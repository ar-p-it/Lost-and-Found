import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import appStore from "./utils/appStore";
import favicon512 from "./Icons/android-chrome-512x512.png";

function HeadSetup() {
  useEffect(() => {
    // Ensure title
    if (document.title !== "Lost&Found") document.title = "Lost&Found";

    const head = document.head;

    // Helper to upsert link tags
    const upsertLink = (rel, sizes, href, type) => {
      let link = head.querySelector(
        `link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ""}${type ? `[type="${type}"]` : ""}`,
      );
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        if (type) link.type = type;
        head.appendChild(link);
      }
      link.href = href;
    };

    // Favicons (use 512x512 everywhere)
    upsertLink("icon", "512x512", favicon512, "image/png");
  }, []);
  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={appStore}>
      <HeadSetup />
      <App />
    </Provider>
  </StrictMode>,
);
