
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "./index.css";
import App from "./App.jsx";

// Register the service worker for PWA support.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    console.log("TaskGrid PWA service worker registered.", registration);
  },
  onRegisterError(error) {
    console.error("TaskGrid PWA registration failed:", error);
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);