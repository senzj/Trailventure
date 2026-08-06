import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "jotai";
import App from "./App.jsx";
import store from "./atom/store";
import { initAuth } from "./atom/auth";
import ThemeEffects from "./components/ThemeEffects";
import ThemedToaster from "./components/ThemedToaster";
import "./index.css";

// Restore the user session once at startup (shared global auth state).
initAuth();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeEffects />
      <App />
      <ThemedToaster />
    </Provider>
  </React.StrictMode>,
);
