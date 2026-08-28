/**
 * Client-side head management for the SPA layer. The crawler-facing head is
 * stamped statically by scripts/prerender.mjs; these hooks keep the document
 * honest during client navigation so the tab title and canonical follow the
 * route.
 */
import { useEffect } from "react";
import { SITE } from "./site";

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  }, [title, description]);
}

export function useCanonical(path: string) {
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute("href", `${SITE.domain}${path}`);
  }, [path]);
}

/** Inject route-scoped JSON-LD during client navigation. */
export function useJsonLd(id: string, data: object | null) {
  useEffect(() => {
    if (!data) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.jsonld = id;
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [id, data]);
}
