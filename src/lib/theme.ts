export const THEME_COOKIE = "ks-theme";
export const THEME_STORAGE_KEY = "theme";

export type ThemePreference = "light" | "dark" | "system";

export function parseThemePreference(
  value: string | undefined | null
): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

/** Resolve a class for <html> on the server (no client script). */
export function resolveThemeClass(
  preference: ThemePreference,
  prefersDarkHint?: boolean | null
): "light" | "dark" {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  if (prefersDarkHint === true) return "dark";
  if (prefersDarkHint === false) return "light";
  return "light";
}
