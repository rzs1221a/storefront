import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initRenderMotionEngine, mountMotionHud } from "./lib/renderMotion";
import "./index.css";

initRenderMotionEngine();
mountMotionHud();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
