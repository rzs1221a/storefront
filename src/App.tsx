import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import Work from "./sections/Work";
import Capabilities from "./sections/Capabilities";
import Comparison from "./sections/Comparison";
import Pricing from "./sections/Pricing";
import Process from "./sections/Process";
import Faq from "./sections/Faq";
import Contact from "./sections/Contact";

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link btn btn-primary btn-sm">
        Skip to content
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <Work />
        <hr className="rule" />
        <Capabilities />
        <hr className="rule" />
        <Comparison />
        <hr className="rule" />
        <Pricing />
        <hr className="rule" />
        <Process />
        <hr className="rule" />
        <Faq />
        <hr className="rule" />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
