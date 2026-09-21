import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type OrderShippedEmailProps = {
  customerName?: string;
  orderId: string;
  trackingNumber: string;
  courierName?: string | null;
};

export function OrderShippedEmail({
  customerName,
  orderId,
  trackingNumber,
  courierName,
}: OrderShippedEmailProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>
        Your order #{shortId} has shipped — tracking {trackingNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your order has shipped</Heading>
          <Text style={text}>
            {customerName ? `Hi ${customerName},` : "Hi,"}
          </Text>
          <Text style={text}>
            Your order <strong>#{shortId}</strong> has shipped!
          </Text>
          <Section style={box}>
            <Text style={label}>Tracking number</Text>
            <Text style={tracking}>{trackingNumber}</Text>
            {courierName ? (
              <Text style={meta}>Courier: {courierName}</Text>
            ) : null}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            The supplier Kaung Set — thank you for shopping with us.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f4",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "520px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5e0",
};

const heading = {
  fontSize: "22px",
  fontWeight: "600" as const,
  color: "#111111",
  margin: "0 0 16px",
};

const text = {
  fontSize: "15px",
  lineHeight: "1.55",
  color: "#222222",
  margin: "0 0 12px",
};

const box = {
  backgroundColor: "#f6f6f4",
  border: "1px solid #e5e5e0",
  padding: "16px",
  margin: "20px 0",
};

const label = {
  fontSize: "11px",
  fontWeight: "600" as const,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#444444",
  margin: "0 0 6px",
};

const tracking = {
  fontSize: "20px",
  fontWeight: "700" as const,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  color: "#111111",
  margin: "0 0 8px",
};

const meta = {
  fontSize: "13px",
  color: "#444444",
  margin: "0",
};

const hr = {
  borderColor: "#e5e5e0",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#666666",
  margin: "0",
};
