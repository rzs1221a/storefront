import { CONTACT } from "../lib/brand";

/**
 * The conversion path agents actually use: a text message.
 *
 * A plain sms: link, deliberately with no body parameter — prefilled bodies
 * are unreliable across platforms, and a body that silently vanishes on iOS
 * is worse than none. The thumb gets a 48px target; the LeadForm remains the
 * deep path for people who write paragraphs.
 */
export default function QuickText({
  className = "",
  label = "Text Zander",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a href={`sms:${CONTACT.phone}`} className={className}>
      {label}
    </a>
  );
}
