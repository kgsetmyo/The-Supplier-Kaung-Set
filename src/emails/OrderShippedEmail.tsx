type OrderShippedEmailProps = {
  customerName?: string;
  orderId: string;
  trackingNumber: string;
  courierName?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain HTML email body (no react-email dependency). */
export function renderOrderShippedEmailHtml({
  customerName,
  orderId,
  trackingNumber,
  courierName,
}: OrderShippedEmailProps): string {
  const shortId = escapeHtml(orderId.slice(0, 8).toUpperCase());
  const tracking = escapeHtml(trackingNumber);
  const greeting = customerName
    ? `Hi ${escapeHtml(customerName)},`
    : "Hi,";
  const courier = courierName
    ? `<p style="font-size:13px;color:#444;margin:0">Courier: ${escapeHtml(courierName)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>Order shipped</title></head>
<body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e5e5e0;padding:32px 24px">
          <tr><td>
            <h1 style="font-size:22px;font-weight:600;color:#111;margin:0 0 16px">Your order has shipped</h1>
            <p style="font-size:15px;line-height:1.55;color:#222;margin:0 0 12px">${greeting}</p>
            <p style="font-size:15px;line-height:1.55;color:#222;margin:0 0 12px">Your order <strong>#${shortId}</strong> has shipped!</p>
            <div style="background:#f6f6f4;border:1px solid #e5e5e0;padding:16px;margin:20px 0">
              <p style="font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#444;margin:0 0 6px">Tracking number</p>
              <p style="font-size:20px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#111;margin:0 0 8px">${tracking}</p>
              ${courier}
            </div>
            <hr style="border:none;border-top:1px solid #e5e5e0;margin:24px 0" />
            <p style="font-size:12px;color:#666;margin:0">The supplier Kaung Set — thank you for shopping with us.</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
