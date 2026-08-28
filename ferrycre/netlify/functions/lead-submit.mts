/**
 * BoldTrail (kvCORE) Lead Dropbox ingestion — single-agent edition.
 *
 * The dropbox is an EMAIL PARSER, not an API:
 *   - Subject must be exactly "Add Contact"
 *   - Body must be plain text, line-based, "Field Name: value"
 *   - A malformed message is DISCARDED SILENTLY — no bounce, no error.
 *
 * Because of that silent-failure mode, every submission is persisted with a
 * correlation ID before the send, so a missing contact traces back to an
 * exact payload. Antoinette's BoldTrail instance:
 * antoinetteferry.heymannwilliams.com — set BOLDTRAIL_DROPBOX_EMAIL to her
 * agent-scoped dropbox address. Until it's set, leads fall back to direct
 * email (LEAD_FALLBACK_EMAIL, default her brokerage inbox) — swappable from
 * the Netlify dashboard without a redeploy.
 *
 * TCPA: consent must be an explicit true, and the exact consent language,
 * timestamp, and source URL are stored with every submission.
 */
import { getStore } from '@netlify/blobs';
import nodemailer from 'nodemailer';
import { z } from 'zod';

/* ---------------------------------------------------------------------------
 * Validation. `noNewlines` is the field-injection guard: the dropbox body is
 * line-based, so a newline inside a value would let a submitter forge extra
 * fields. Reject rather than strip, so the attempt is visible in logs.
 * ------------------------------------------------------------------------- */
const noNewlines = (v: string) => !/[\r\n]/.test(v);
const lineBreakMsg = (label: string) => ({ message: `${label} may not contain line breaks` });

const optionalLine = (label: string, max: number, email = false) => {
  const base = z.string().trim().max(max);
  return z
    .union([z.literal(''), (email ? base.email() : base).refine(noNewlines, lineBreakMsg(label))])
    .optional();
};

const LeadSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).refine(noNewlines, lineBreakMsg('First name')),
    lastName: z.string().trim().min(1).max(100).refine(noNewlines, lineBreakMsg('Last name')),
    email: optionalLine('Email', 200, true),
    phone: optionalLine('Phone', 40),

    // TCPA: must be an explicit true. Anything else is a hard reject.
    consent: z.literal(true),
    consentText: z.string().max(2000),
    consentTimestamp: z.string().datetime(),
    sourceUrl: z.string().max(500),

    // The intent questionnaire: goal, useType, sizeRange, timeline,
    // submarket, message, listing/market context. Rides into the dropbox
    // body below the parser fields (kvCORE files the whole body into a
    // Custom Note on the contact).
    context: z.record(z.string(), z.string()).optional(),

    honeypot: z.string().optional()
  })
  .refine((d) => Boolean(d.email) || Boolean(d.phone), {
    message: 'Provide at least an email address or a phone number',
    path: ['email']
  });

type Lead = z.infer<typeof LeadSchema>;

/* ---------------------------------------------------------------------------
 * Rate limiting — 5 submissions per IP per 10 minutes, backed by Netlify
 * Blobs so the limit survives cold starts. IPs are hashed, never stored raw.
 * ------------------------------------------------------------------------- */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

async function hashIp(ip: string): Promise<string> {
  const bytes = new TextEncoder().encode(`ferrycre:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const store = getStore('lead-ratelimit');
    const key = await hashIp(ip);
    const now = Date.now();
    const previous = ((await store.get(key, { type: 'json' })) as number[] | null) ?? [];
    const recent = previous.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_LIMIT) return true;
    recent.push(now);
    await store.setJSON(key, recent);
    return false;
  } catch (err) {
    // Never let the limiter's own failure block a real lead.
    console.warn('[lead-submit] rate limit check failed, allowing through', err);
    return false;
  }
}

const singleLine = (v: string) => v.replace(/[\r\n]+/g, ' ').trim();
const contextLabel = (k: string) =>
  k.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

/**
 * The dropbox body. Parser fields first; then the intent story retold as a
 * short briefing (kvCORE files the whole body into a Custom Note).
 */
function formatBody(lead: Lead, forDropbox: boolean): string {
  const lines: string[] = [`First Name: ${lead.firstName}`, `Last Name: ${lead.lastName}`];
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.phone) lines.push(`Phone: ${lead.phone}`);

  const ctx = Object.fromEntries(
    Object.entries(lead.context ?? {})
      .map(([k, v]) => [k, singleLine(v).slice(0, 500)])
      .filter(([, v]) => v)
  );
  const story: string[] = [];
  const take = (k: string) => {
    const v = ctx[k] ?? '';
    delete ctx[k];
    return v;
  };
  const goal = take('goal');
  const useType = take('useType');
  const sizeRange = take('sizeRange');
  const timeline = take('timeline');
  const submarket = take('submarket');
  const message = take('message');
  if (goal || useType) story.push(`${lead.firstName} wants to ${goal || 'talk'}${useType ? ` — ${useType.toLowerCase()}` : ''}.`);
  if (sizeRange) story.push(`Size: ${sizeRange}.`);
  if (submarket) story.push(`Submarket: ${submarket}.`);
  if (timeline) story.push(`Timeline: ${timeline}.`);
  if (message) story.push(`In their words: "${message}"`);
  for (const [key, value] of Object.entries(ctx)) story.push(`${contextLabel(key)}: ${value}.`);
  if (story.length) lines.push('', story.join(' '));

  lines.push(
    '',
    `Submitted through ferrycre.com (${singleLine(lead.sourceUrl)}). ` +
      `Consent to be contacted was given on ${lead.consentTimestamp}: "${singleLine(lead.consentText).slice(0, 400)}"`
  );
  if (!forDropbox) lines.unshift('New commercial lead from ferrycre.com', '');
  return lines.join('\n');
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  const correlationId = crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const ip =
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(400, { ok: false, correlationId, error: 'Malformed JSON body' });
  }

  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[lead-submit] ${correlationId} rejected`, parsed.error.flatten().fieldErrors);
    return json(400, {
      ok: false,
      correlationId,
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors
    });
  }
  const lead = parsed.data;

  // Honeypot: accept and drop. A bot that gets a 200 has no signal to retry.
  if (lead.honeypot && lead.honeypot.trim() !== '') {
    console.info(`[lead-submit] ${correlationId} honeypot triggered, dropped`);
    return json(200, { ok: true, correlationId });
  }

  if (await isRateLimited(ip)) {
    console.warn(`[lead-submit] ${correlationId} rate limited`);
    return json(429, { ok: false, correlationId, error: 'Too many submissions. Please try again shortly.' });
  }

  // Routing: dropbox when configured, direct email to her otherwise.
  const dropbox = process.env.BOLDTRAIL_DROPBOX_EMAIL ?? '';
  const fallback = process.env.LEAD_FALLBACK_EMAIL || 'ferry@heymannwilliamsrealty.com';
  const to = dropbox || fallback;
  const viaDropbox = Boolean(dropbox);

  // Transport: Gmail SMTP with an app password (the path the dropbox parser
  // is proven against), or any SMTP server via SMTP_* vars.
  const gmailUser = process.env.GMAIL_USER ?? '';
  const gmailPass = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s+/g, '');
  const smtpHost = process.env.SMTP_HOST ?? '';

  const record = {
    correlationId,
    receivedAt,
    routedTo: viaDropbox ? 'boldtrail-dropbox' : 'direct-email',
    payload: {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email || null,
      phone: lead.phone || null,
      context: lead.context ?? {}
    },
    consent: {
      granted: lead.consent,
      text: lead.consentText,
      timestamp: lead.consentTimestamp,
      sourceUrl: lead.sourceUrl
    },
    delivery: { status: 'pending' as string, providerId: null as string | null, error: null as string | null }
  };

  const logStore = (() => {
    try {
      return getStore('leads');
    } catch {
      return null;
    }
  })();
  const persist = async () => {
    try {
      await logStore?.setJSON(correlationId, record);
    } catch (err) {
      console.error(`[lead-submit] ${correlationId} could not persist log`, err);
    }
  };
  await persist();

  if (!gmailPass && !smtpHost) {
    record.delivery.status = 'not_configured';
    record.delivery.error = 'no mail transport configured (set GMAIL_APP_PASSWORD or SMTP_HOST)';
    await persist();
    console.error(`[lead-submit] ${correlationId} not delivered: ${record.delivery.error}`);
    return json(502, {
      ok: false,
      correlationId,
      error: 'Lead recorded but not yet delivered. Please call or email directly.'
    });
  }

  try {
    const mailer = gmailPass
      ? nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: gmailUser, pass: gmailPass }
        })
      : nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT ?? 465),
          secure: process.env.SMTP_SECURE !== 'false',
          auth: { user: process.env.SMTP_USER ?? '', pass: process.env.SMTP_PASS ?? '' }
        });
    const info = await mailer.sendMail({
      from: gmailPass ? gmailUser : process.env.SMTP_FROM || process.env.SMTP_USER || '',
      to,
      // exact — any prefix/suffix breaks the dropbox parser
      subject: viaDropbox ? 'Add Contact' : `ferrycre.com lead: ${lead.firstName} ${lead.lastName}`,
      // plain text only; an HTML wrapper breaks the line-based parse
      text: formatBody(lead, viaDropbox)
    });

    record.delivery.status = 'sent';
    record.delivery.providerId = info.messageId ?? null;
    await persist();
    console.info(`[lead-submit] ${correlationId} sent via ${viaDropbox ? 'dropbox' : 'fallback email'}`);
    return json(200, { ok: true, correlationId });
  } catch (err) {
    record.delivery.status = 'failed';
    record.delivery.error = err instanceof Error ? err.message : String(err);
    await persist();
    console.error(`[lead-submit] ${correlationId} send failed`, err);
    return json(502, {
      ok: false,
      correlationId,
      error: 'Lead recorded but delivery failed. Please call or email directly.'
    });
  }
};
