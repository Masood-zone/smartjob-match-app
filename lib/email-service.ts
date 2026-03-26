import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value.toLowerCase() === "true";
}

function getAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3000"
  );
}

function getAppName(): string {
  return process.env.APP_NAME || "Qualify Job Match";
}

function buildTransportConfig(): EmailConfig {
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  const serviceEnv = process.env.SMTP_SERVICE;
  const hostEnv = process.env.SMTP_HOST;
  const portEnv = process.env.SMTP_PORT;
  const secureEnv = parseBoolean(process.env.SMTP_SECURE);

  const port = portEnv ? Number(portEnv) : undefined;
  const hostLooksLikeService =
    !!hostEnv && !hostEnv.includes(".") && hostEnv !== "localhost";

  const service = serviceEnv || (hostLooksLikeService ? hostEnv : undefined);
  const host = service ? undefined : hostEnv;

  return {
    ...(service ? { service } : {}),
    ...(host ? { host } : {}),
    ...(port !== undefined ? { port } : {}),
    ...(secureEnv !== undefined ? { secure: secureEnv } : {}),
    auth: { user, pass },
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor() {
    const config = buildTransportConfig();

    this.from =
      process.env.SMTP_FROM || config.auth.user || "noreply@localhost";

    this.transporter = nodemailer.createTransport({
      ...config,
      auth: config.auth.user && config.auth.pass ? config.auth : undefined,
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const { to, subject, html, text } = options;

    if (!to?.trim()) throw new Error("Email recipient is required");
    if (!subject?.trim()) throw new Error("Email subject is required");
    if (!html?.trim()) throw new Error("Email html is required");

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
      text,
    });
  }

  async sendReactEmail(args: {
    to: string;
    subject: string;
    component: ReactElement;
    text?: string;
  }): Promise<void> {
    const html = await render(args.component);

    await this.sendEmail({
      to: args.to,
      subject: args.subject,
      html,
      text: args.text,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}

export const emailService = new EmailService();

export { getAppName, getAppUrl };
