import { useAtom } from "jotai";
import { ToastContainer } from "react-toastify";
import { themeAtom } from "@/atom/theme";

// Renders the toast container using the active theme so notifications don't
// stay stuck in light mode when dark mode is on.
function ThemedToaster() {
  const [theme] = useAtom(themeAtom);

  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  return <ToastContainer position="bottom-right" theme={resolved} />;
}

export default ThemedToaster;