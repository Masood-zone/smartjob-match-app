import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  appName: string;
  userEmail: string;
  userName?: string;
  resetUrl: string;
  expiresIn: string;
}

export function PasswordResetEmail({
  appName,
  userEmail,
  userName,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={hero}>
            <Text style={eyebrow}>Password recovery</Text>
            <Text style={title}>Reset your password</Text>
            <Text style={intro}>Hello {userName || userEmail},</Text>
            <Text style={intro}>
              We received a request to reset your password. If you did not make
              this request, you can safely ignore this email.
            </Text>
          </Section>

          <Section style={content}>
            <Section style={panel}>
              <Text style={panelTitle}>What happens next</Text>
              <Text style={panelText}>
                Open the button below to set a new password. The link expires in{" "}
                {expiresIn} for your protection.
              </Text>
            </Section>

            <Section style={buttonWrap}>
              <Button style={button} href={resetUrl}>
                Reset password
              </Button>
            </Section>

            <Text style={linkLabel}>
              If the button does not work, copy this link:
            </Text>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>

            <Hr style={divider} />

            <Text style={footer}>
              For security reasons, this link will expire in {expiresIn}. Please
              use it only on a device you trust.
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
  backgroundColor: "#f7f3ee",
  margin: "0",
  fontFamily: 'Manrope, "Segoe UI", Arial, sans-serif',
  color: "#34261f",
};

const container = {
  backgroundColor: "#fffdf9",
  border: "1px solid #ead9ca",
  borderRadius: "24px",
  margin: "0 auto",
  overflow: "hidden",
  padding: "0",
  maxWidth: "640px",
};

const hero = {
  backgroundColor: "#c2652a",
  padding: "34px 40px 28px",
};

const eyebrow = {
  display: "inline-block",
  margin: "0 0 14px",
  padding: "8px 14px",
  borderRadius: "999px",
  backgroundColor: "rgba(255,255,255,0.16)",
  color: "#fff7ef",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
};

const title = {
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
  margin: "0 0 12px",
  color: "#7a4522",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
};

const panelText = {
  margin: "0",
  color: "#5c4336",
  fontSize: "15px",
  lineHeight: "1.7",
};

const buttonWrap = {
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

const linkLabel = {
  color: "#8c6857",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "20px 0 8px",
};

const link = {
  color: "#a24e18",
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

const divider = {
  borderColor: "#ead9ca",
  margin: "30px 0 22px",
};

const footer = {
  color: "#8c6857",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};
