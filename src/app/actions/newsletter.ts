"use server";

import { createClient } from "@/lib/supabase/server";

export type NewsletterResult =
  | { ok: true; alreadySubscribed?: boolean }
  | { ok: false; message: string };

/** Subscribe an email to the newsletter list. */
export async function subscribeToNewsletter(
  formData: FormData
): Promise<NewsletterResult> {
  const raw = formData.get("email");
  const email =
    typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
  });

  if (error) {
    // Unique violation — already on the list
    if (error.code === "23505") {
      return { ok: true, alreadySubscribed: true };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
