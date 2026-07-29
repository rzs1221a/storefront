import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LEGACY_REDIRECTS } from "./lib/destinations";
import Shell from "./components/Shell";
import Coast from "./routes/Coast";
import Work from "./routes/Work";
import WorkDetail from "./routes/WorkDetail";
import Packages from "./routes/Packages";
import Capabilities from "./routes/Capabilities";
import Contact from "./routes/Contact";
import { Process, Questions } from "./routes/Studio";

/**
 * Real routes, because a destination you cannot link to or share is not a
 * page. Every one of these is also prerendered to static HTML at build time
 * (scripts/prerender.mjs) so crawlers and no-JS visitors get the full written
 * content rather than an empty map.
 *
 * The five commercial routes — home, packages, work, capabilities, contact —
 * are what the rail and the tab bar lead with. Process and Questions are real
 * pages too, linked from inside the sheets that raise those questions, because
 * a navigation that lists everything ranks nothing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Coast />} />

          <Route path="packages" element={<Packages />} />
          <Route path="work" element={<Work />} />
          <Route path="work/:slug" element={<WorkDetail />} />
          <Route path="capabilities" element={<Capabilities />} />
          <Route path="contact" element={<Contact />} />

          <Route path="process" element={<Process />} />
          <Route path="questions" element={<Questions />} />

          {/* Paths that moved when the site was productized. A 404 on a page
              that used to rank is a lead lost. */}
          {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from.slice(1)} element={<Navigate to={to} replace />} />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
