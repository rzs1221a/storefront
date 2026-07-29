import { useEffect, useState } from "react";
import { observeFrames } from "./lib/cameraFrames";
import Atmosphere from "./components/Atmosphere";
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
  const [activeFrame, setActiveFrame] = useState<string | null>(null);

  /*
   * One observer drives two things: the background map flies to the place the
   * current section is about, and the nav marks that section active. Runs
   * after mount so every [data-frame] element exists to be observed.
   */
  useEffect(() => observeFrames(setActiveFrame), []);

  return (
    <>
      <a href="#main" className="skip-link btn btn-primary btn-sm">
        Skip to content
      </a>

      <Atmosphere />

      <Nav activeFrame={activeFrame} />

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
