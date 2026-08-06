import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { themeAtom, accentAtom, ACCENTS, setThemeLocal, setAccentLocal } from "@/atom/theme";
import { userAtom } from "@/atom/auth";
import { updateProfile } from "@/api/auth";

const mediaQuery =
  typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function resolveDark(theme) {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return mediaQuery ? mediaQuery.matches : false;
}

/**
 * Applies the active theme + accent color to <html> and persists preferences.
 * Mounted once in main.jsx. Also best-effort syncs theme to the signed-in account.
 */
function ThemeEffects() {
  const [theme] = useAtom(themeAtom);
  const [accent] = useAtom(accentAtom);
  const [user] = useAtom(userAtom);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolveDark(theme));
    document.documentElement.style.colorScheme =
      theme === "system" ? "light dark" : theme;
    setThemeLocal(theme);

    if (user && theme !== user.theme) {
      updateProfile({ theme }).catch(() => {});
    }
  }, [theme, user]);

  useEffect(() => {
    const preset = ACCENTS.find((a) => a.key === accent) ?? ACCENTS[0];
    document.documentElement.style.setProperty("--primary", preset.primary);
    document.documentElement.style.setProperty("--ring", preset.ring);
    setAccentLocal(accent);
  }, [accent]);

  useEffect(() => {
    if (!mediaQuery) return undefined;
    const onChange = () => {
      document.documentElement.classList.toggle("dark", resolveDark(themeRef.current));
    };
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return null;
}

export default ThemeEffects;