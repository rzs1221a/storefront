import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/Shell";
import Coast from "./routes/Coast";
import WorkDetail from "./routes/WorkDetail";
import Contact from "./routes/Contact";
import { Build, Pricing, Process, Questions } from "./routes/Studio";
import { WorkIndex, StudioIndex } from "./routes/MobileList";

/**
 * Real routes, because a destination you cannot link to or share is not a
 * page. Every one of these is also prerendered to static HTML at build time
 * (scripts/prerender.mjs) so crawlers and no-JS visitors get the full written
 * content rather than an empty map.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Coast />} />

          {/* Phone-only indexes; the desktop rail lists these directly. */}
          <Route path="work" element={<WorkIndex />} />
          <Route path="studio" element={<StudioIndex />} />

          <Route path="work/:slug" element={<WorkDetail />} />
          <Route path="build" element={<Build />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="process" element={<Process />} />
          <Route path="questions" element={<Questions />} />
          <Route path="contact" element={<Contact />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
