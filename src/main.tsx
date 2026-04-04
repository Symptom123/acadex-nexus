import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import bgImage from "./assets/background.png";
import coverImage from "./assets/cover.png";
import studentCoverImage from "./assets/student-cover.png";
import logoImage from "./assets/logo.png";

// Ensure the application does not flash the new UI until critical images load
const preloadImages = () => {
  const imagesToLoad = [bgImage, coverImage, studentCoverImage, logoImage];
  let loadedCount = 0;

  return new Promise<void>((resolve) => {
    if (imagesToLoad.length === 0) return resolve();
    
    imagesToLoad.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) resolve();
      };
      img.onerror = () => {
        loadedCount++; 
        if (loadedCount === imagesToLoad.length) resolve();
      };
    });
  });
};

const bootstrapRenderer = async () => {
  // Add a built-in delay (set to 2500ms = 2.5 seconds).
  // This gives the loader animation enough time to look deliberate and beautiful.
  const minDelay = new Promise(resolve => setTimeout(resolve, 2500));
  
  // Wait for both the minimum delay to pass and all critical background images to download
  await Promise.all([preloadImages(), minDelay]);

  createRoot(document.getElementById("root")!).render(<App />);
};

bootstrapRenderer();
