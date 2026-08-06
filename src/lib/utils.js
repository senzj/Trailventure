import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names, resolving conflicts so the last class wins.
 * Wraps `clsx` + `tailwind-merge`. Used by all shadcn/ui components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}