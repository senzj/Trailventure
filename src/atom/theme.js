import { atom } from "jotai";

export const THEMES = ["light", "dark", "system"];

// Accent color presets applied to the --primary / --ring CSS variables.
export const ACCENTS = [
  { key: "blue", label: "Trail Blue", primary: "221 83% 53%", ring: "221 83% 53%" },
  { key: "green", label: "Forest Green", primary: "145 63% 42%", ring: "145 63% 42%" },
  { key: "purple", label: "Sunset Purple", primary: "262 83% 58%", ring: "262 83% 58%" },
  { key: "orange", label: "Campfire", primary: "24 95% 50%", ring: "24 95% 50%" },
  { key: "rose", label: "Wild Rose", primary: "350 84% 60%", ring: "350 84% 60%" },
];

function readLocal(key, list, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (list.includes(stored)) return stored;
  } catch {
    // storage unavailable
  }
  return fallback;
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable
  }
}

export const themeAtom = atom(readLocal("trailventure_theme", THEMES, "system"));

export const accentAtom = atom(
  readLocal("trailventure_accent", ACCENTS.map((a) => a.key), "blue"),
);

export function setThemeLocal(theme) {
  writeLocal("trailventure_theme", theme);
}

export function setAccentLocal(accent) {
  writeLocal("trailventure_accent", accent);
}