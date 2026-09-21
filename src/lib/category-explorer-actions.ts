"use server";

import { getExplorerCategories } from "@/lib/products";
import type { ExplorerCategory } from "@/types/database";

/** Secure server fetch for the floating Categories menu. */
export async function fetchExplorerCategories(): Promise<ExplorerCategory[]> {
  return getExplorerCategories();
}
