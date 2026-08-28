import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// GA4, deferred: nothing loads until the page has painted and gone idle, so
// analytics never touches the critical path. Off entirely until VITE_GA4_ID
// is set in the Netlify env.
const GA4 = import.meta.env.VITE_GA4_ID;
if (GA4) {
  const loadGa = () => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4}`;
    document.head.appendChild(s);
    const w = window as typeof window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer!.push(args);
    };
    w.gtag("js", new Date());
    w.gtag("config", GA4, { anonymize_ip: true });
  };
  const whenIdle =
    typeof window.requestIdleCallback === "function"
      ? () => window.requestIdleCallback(loadGa, { timeout: 5000 })
      : () => setTimeout(loadGa, 2000);
  window.addEventListener("load", whenIdle, { once: true });
}
