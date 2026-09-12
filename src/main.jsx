import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { initSmoothScroll } from "@/lib/gsapScroll";

// Buttery GSAP inertia scroll — desktop only, skipped on touch devices
initSmoothScroll();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
