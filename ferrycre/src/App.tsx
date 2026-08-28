import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import { markets } from "./lib/markets";

const Home = lazy(() => import("./routes/Home"));
const Listings = lazy(() => import("./routes/Listings"));
const ListingDetail = lazy(() => import("./routes/ListingDetail"));
const Explore = lazy(() => import("./routes/Explore"));
const Services = lazy(() => import("./routes/Services"));
const MarketPage = lazy(() => import("./routes/MarketPage"));
const About = lazy(() => import("./routes/About"));
const Contact = lazy(() => import("./routes/Contact"));

function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-44 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="text-3xl font-medium">That page isn't in the inventory.</h1>
      <Link to="/" className="btn-signal mt-8 inline-flex px-6 py-3 text-sm">
        Back to the county
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:slug" element={<ListingDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* the geo squeeze pages — explicit routes from the market config */}
          {markets.map((m) => (
            <Route key={m.slug} path={`/${m.slug}`} element={<MarketPage slug={m.slug} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* /explore is a first-class surface behind its own route boundary —
            full-viewport, no shared chrome, and never prerendered */}
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Suspense>
  );
}
