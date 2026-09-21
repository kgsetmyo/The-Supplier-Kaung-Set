import { cookies } from "next/headers";
import {
  THEME_COOKIE,
  parseThemePreference,
  resolveThemeClass,
} from "@/lib/theme";

/** Server-only: do not import this from Client Components. */
export async function getServerThemeClass(): Promise<"light" | "dark"> {
  const jar = await cookies();
  const preference = parseThemePreference(jar.get(THEME_COOKIE)?.value);
  return resolveThemeClass(preference);
}
