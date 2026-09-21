"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type SupportActionResult =
  | { ok: true }
  | { ok: false; message: string };

const productRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(254, "Email is too long.")
    .email("Please enter a valid email."),
  item_name: z
    .string()
    .trim()
    .min(1, "Item name is required.")
    .max(200, "Item name must be 200 characters or fewer."),
  details: z
    .string()
    .trim()
    .min(1, "Details are required.")
    .max(1000, "Details must be 1000 characters or fewer."),
});

const bugReportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(254, "Email is too long.")
    .email("Please enter a valid email."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(1000, "Description must be 1000 characters or fewer."),
});

const productRequestStatusSchema = z.enum(["pending", "sourced", "rejected"]);
const bugReportStatusSchema = z.enum(["open", "resolved"]);
const uuidSchema = z.string().uuid("Invalid id.");

type DiscordEmbed = {
  title: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
  image?: { url: string };
  timestamp?: string;
};

async function notifyDiscord(
  channel: "product_request" | "bug_report",
  embed: DiscordEmbed
): Promise<void> {
  const url =
    channel === "product_request"
      ? process.env.DISCORD_WEBHOOK_PRODUCT_REQUESTS?.trim()
      : process.env.DISCORD_WEBHOOK_BUG_REPORTS?.trim();

  if (!url) {
    console.warn(
      channel === "product_request"
        ? "DISCORD_WEBHOOK_PRODUCT_REQUESTS is not set — skipping Discord notify"
        : "DISCORD_WEBHOOK_BUG_REPORTS is not set — skipping Discord notify"
    );
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!res.ok) {
      console.error("Discord webhook failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Discord webhook error:", err);
  }
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function fileFrom(formData: FormData, key: string): File | null {
  const v = formData.get(key);
  if (v instanceof File && v.size > 0) return v;
  return null;
}

function zodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Customer custom product request → Supabase + Discord. */
export async function submitProductRequest(
  formData: FormData
): Promise<SupportActionResult> {
  const parsed = productRequestSchema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email"),
    item_name: str(formData, "item_name"),
    details: str(formData, "details"),
  });

  if (!parsed.success) {
    return { ok: false, message: zodErrorMessage(parsed.error) };
  }

  const { name, email, item_name: itemName, details } = parsed.data;
  const image = fileFrom(formData, "image");

  const supabase = await createClient();
  let imageUrl: string | null = null;

  if (image) {
    if (image.size > MAX_IMAGE_BYTES) {
      return { ok: false, message: "Image must be 5 MB or smaller." };
    }
    if (image.type && !ALLOWED_IMAGE_TYPES.has(image.type)) {
      return {
        ok: false,
        message: "Image must be JPEG, PNG, WebP, or GIF.",
      };
    }

    const ext =
      image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("requests")
      .upload(path, image, {
        cacheControl: "3600",
        upsert: false,
        contentType: image.type || undefined,
      });

    if (uploadError) {
      return { ok: false, message: uploadError.message };
    }

    const { data } = supabase.storage.from("requests").getPublicUrl(path);
    imageUrl = data.publicUrl;
  }

  const { error } = await supabase.from("product_requests").insert({
    name,
    email,
    item_name: itemName,
    details,
    image_url: imageUrl,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await notifyDiscord("product_request", {
    title: "🛒 New Product Request",
    color: 0x2ecc71,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Name", value: name, inline: true },
      { name: "Email", value: email, inline: true },
      { name: "Item", value: itemName },
      { name: "Details", value: details || "—" },
    ],
    ...(imageUrl ? { image: { url: imageUrl } } : {}),
  });

  revalidatePath("/[locale]/admin/requests", "page");
  return { ok: true };
}

/** Customer bug report → Supabase + Discord. */
export async function submitBugReport(
  formData: FormData
): Promise<SupportActionResult> {
  const parsed = bugReportSchema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email"),
    description: str(formData, "description"),
  });

  if (!parsed.success) {
    return { ok: false, message: zodErrorMessage(parsed.error) };
  }

  const { name, email, description } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("bug_reports").insert({
    name,
    email,
    description,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await notifyDiscord("bug_report", {
    title: "🐛 New Bug Report",
    color: 0xe74c3c,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Name", value: name, inline: true },
      { name: "Email", value: email, inline: true },
      { name: "Description", value: description || "—" },
    ],
  });

  revalidatePath("/[locale]/admin/bugs", "page");
  return { ok: true };
}

export type ProductRequestStatus = z.infer<typeof productRequestStatusSchema>;
export type BugReportStatus = z.infer<typeof bugReportStatusSchema>;

/** Admin: update product request status. */
export async function updateProductRequestStatus(
  id: string,
  status: ProductRequestStatus
): Promise<SupportActionResult> {
  const idParsed = uuidSchema.safeParse(id);
  const statusParsed = productRequestStatusSchema.safeParse(status);
  if (!idParsed.success) {
    return { ok: false, message: zodErrorMessage(idParsed.error) };
  }
  if (!statusParsed.success) {
    return { ok: false, message: zodErrorMessage(statusParsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_requests")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/[locale]/admin/requests", "page");
  return { ok: true };
}

/** Admin: update bug report status. */
export async function updateBugReportStatus(
  id: string,
  status: BugReportStatus
): Promise<SupportActionResult> {
  const idParsed = uuidSchema.safeParse(id);
  const statusParsed = bugReportStatusSchema.safeParse(status);
  if (!idParsed.success) {
    return { ok: false, message: zodErrorMessage(idParsed.error) };
  }
  if (!statusParsed.success) {
    return { ok: false, message: zodErrorMessage(statusParsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bug_reports")
    .update({ status: statusParsed.data })
    .eq("id", idParsed.data);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/[locale]/admin/bugs", "page");
  return { ok: true };
}
