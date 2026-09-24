import { Resend } from "resend";
import { renderOrderShippedEmailHtml } from "@/emails/OrderShippedEmail";

export type SendOrderShippedInput = {
  to: string;
  customerName?: string;
  orderId: string;
  trackingNumber: string;
  courierName?: string | null;
};

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "The supplier Kaung Set <onboarding@resend.dev>"
  );
}

/**
 * Sends a shipped notification. Never throws — logs and returns false on failure
 * so order updates are not blocked by email outages.
 */
export async function sendOrderShippedEmail(
  input: SendOrderShippedInput
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipped shipped email");
    return false;
  }

  const to = input.to.trim();
  if (!to || !to.includes("@")) {
    console.warn("[email] No valid customer email — skipped shipped email");
    return false;
  }

  const shortId = input.orderId.slice(0, 8).toUpperCase();

  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: `Your order #${shortId} has shipped — ${input.trackingNumber}`,
      html: renderOrderShippedEmailHtml({
        customerName: input.customerName,
        orderId: input.orderId,
        trackingNumber: input.trackingNumber,
        courierName: input.courierName,
      }),
    });

    if (error) {
      console.error("[email] Resend error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      "[email] sendOrderShippedEmail failed:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
