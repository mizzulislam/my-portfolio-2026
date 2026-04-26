import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ← tambahkan ini
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {" "}
      {/* ← tambahkan ini */}
      <App />
    </BrowserRouter>{" "}
    {/* ← tambahkan ini */}
  </StrictMode>,
);
