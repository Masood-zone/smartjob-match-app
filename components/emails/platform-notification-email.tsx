import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Text,
} from "@react-email/components";

type EmailStep = {
  title: string;
  description: string;
};

interface PlatformNotificationEmailProps {
  appName: string;
  recipientName?: string;
  eyebrow: string;
  title: string;
  lead: string;
  steps: EmailStep[];
  ctaLabel: string;
  ctaUrl: string;
  ctaNote?: string;
  closing?: string;
}

export function PlatformNotificationEmail({
  appName,
  recipientName,
  eyebrow,
  title,
  lead,
  steps,
  ctaLabel,
  ctaUrl,
  ctaNote,
  closing,
}: PlatformNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={hero}>
            <Text style={eyebrowStyle}>{eyebrow}</Text>
            <Text style={headline}>{title}</Text>
            <Text style={intro}>Hello {recipientName || "there"},</Text>
            <Text style={intro}>{lead}</Text>
          </Section>

          <Section style={content}>
            <Section style={panel}>
              <Text style={panelTitle}>Your next easy steps</Text>
              {steps.map((step, index) => (
                <Section key={`${step.title}-${index}`} style={stepCard}>
                  <Text style={stepIndex}>
                    Step {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text style={stepTitle}>{step.title}</Text>
                  <Text style={stepDescription}>{step.description}</Text>
                </Section>
              ))}
            </Section>

            <Section style={ctaWrap}>
              <Button style={button} href={ctaUrl}>
                {ctaLabel}
              </Button>
              {ctaNote ? <Text style={ctaNoteStyle}>{ctaNote}</Text> : null}
            </Section>

            <Hr style={divider} />

            <Text style={closingText}>
              {closing ||
                "If you need help along the way, the Qualify team is here to keep things simple."}
            </Text>

            <Text style={footer}>
              Best regards,
              <br />
              {appName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#faf5ee",
  color: "#35261f",
  margin: "0",
  fontFamily: 'Manrope, "Segoe UI", Arial, sans-serif',
};

const container = {
  backgroundColor: "#fffdf9",
  border: "1px solid #ead7c6",
  borderRadius: "24px",
  margin: "0 auto",
  padding: "0",
  overflow: "hidden",
  maxWidth: "640px",
};

const hero = {
  backgroundColor: "#c2652a",
  padding: "32px 40px 28px",
};

const eyebrowStyle = {
  display: "inline-block",
  margin: "0 0 16px",
  padding: "8px 14px",
  borderRadius: "999px",
  backgroundColor: "rgba(255, 255, 255, 0.16)",
  color: "#fff7ef",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
};

const headline = {
  margin: "0 0 14px",
  color: "#fffdf7",
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: "34px",
  lineHeight: "1.15",
  fontWeight: "700",
};

const intro = {
  margin: "0 0 10px",
  color: "#fff8f0",
  fontSize: "16px",
  lineHeight: "1.6",
};

const content = {
  padding: "30px 40px 40px",
};

const panel = {
  backgroundColor: "#fff8f1",
  border: "1px solid #eed8c6",
  borderRadius: "20px",
  padding: "22px",
};

const panelTitle = {
  margin: "0 0 18px",
  color: "#7a4522",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
};

const stepCard = {
  backgroundColor: "#fffdf9",
  border: "1px solid #f0dfd0",
  borderRadius: "16px",
  margin: "0 0 14px",
  padding: "18px 18px 16px",
};

const stepIndex = {
  margin: "0 0 6px",
  color: "#a25a28",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
};

const stepTitle = {
  margin: "0 0 8px",
  color: "#35261f",
  fontSize: "18px",
  lineHeight: "1.3",
  fontWeight: "700",
};

const stepDescription = {
  margin: "0",
  color: "#674838",
  fontSize: "15px",
  lineHeight: "1.6",
};

const ctaWrap = {
  textAlign: "center" as const,
  margin: "28px 0 0",
};

const button = {
  backgroundColor: "#c2652a",
  borderRadius: "999px",
  color: "#fffdf7",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "700",
  padding: "14px 26px",
  textDecoration: "none",
};

const ctaNoteStyle = {
  color: "#8c6857",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "14px 0 0",
};

const divider = {
  borderColor: "#ead7c6",
  margin: "30px 0 22px",
};

const closingText = {
  color: "#674838",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const footer = {
  color: "#8c6857",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
};
