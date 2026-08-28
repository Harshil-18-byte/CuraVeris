import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode><main><h1>CuraVeris</h1><p>Web client foundation. No product workflows are enabled in Phase 1.</p></main></StrictMode>,
);
