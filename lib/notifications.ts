import { createElement } from "react";

import { PlatformNotificationEmail } from "@/components/emails/platform-notification-email";
import { emailService, getAppName, getAppUrl } from "@/lib/email-service";

type NotificationStep = {
  title: string;
  description: string;
};

interface WelcomeEmailArgs {
  email: string;
  name?: string;
}

interface RoleWelcomeEmailArgs extends WelcomeEmailArgs {
  dashboardUrl?: string;
}

function normalizeName(name?: string, email?: string): string | undefined {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  return email?.trim() || undefined;
}

function buildTextSummary(
  title: string,
  steps: NotificationStep[],
  ctaUrl: string,
) {
  const stepSummary = steps
    .map((step, index) => `${index + 1}. ${step.title} - ${step.description}`)
    .join("\n");

  return `${title}\n\n${stepSummary}\n\nOpen here: ${ctaUrl}`;
}

class NotificationsService {
  async sendNewUserWelcomeEmail(args: WelcomeEmailArgs): Promise<void> {
    const appUrl = getAppUrl();
    const appName = getAppName();
    const recipientName = normalizeName(args.name, args.email);
    const ctaUrl = `${appUrl}/onboarding`;

    const steps: NotificationStep[] = [
      {
        title: "Complete your profile",
        description:
          "Add your personal details so the platform can guide you through the right path.",
      },
      {
        title: "Choose your next step",
        description:
          "Select whether you want to continue as a Job Seeker or as an Employer.",
      },
      {
        title: "Start exploring",
        description:
          "Once your profile is ready, you can search for jobs or post roles in just a few steps.",
      },
    ];

    await emailService.sendReactEmail({
      to: args.email,
      subject: `Welcome to ${appName}`,
      component: createElement(PlatformNotificationEmail, {
        appName,
        recipientName,
        eyebrow: "Welcome aboard",
        title: "Your Qualify account is ready",
        lead: "You can now take the next step on the platform and move into the path that fits your goal.",
        steps,
        ctaLabel: "Open onboarding",
        ctaUrl,
        ctaNote:
          "It only takes a few minutes to choose your path and begin the next phase.",
        closing:
          "We built the journey to be simple, warm, and focused on getting you moving quickly.",
      }),
      text: buildTextSummary("Your Qualify account is ready", steps, ctaUrl),
    });
  }

  async sendJobSeekerWelcomeEmail(args: RoleWelcomeEmailArgs): Promise<void> {
    const appName = getAppName();
    const appUrl = getAppUrl();
    const recipientName = normalizeName(args.name, args.email);
    const ctaUrl =
      args.dashboardUrl || `${appUrl}/onboarding/job-seeker/dashboard`;

    const steps: NotificationStep[] = [
      {
        title: "Review your profile",
        description:
          "Keep your skills, qualifications, and experience up to date for stronger matches.",
      },
      {
        title: "Browse opportunities",
        description:
          "Look through available roles and use the platform to find the best fit for you.",
      },
      {
        title: "Apply with confidence",
        description:
          "Submit applications, track progress, and stay ready for the next opportunity.",
      },
    ];

    await emailService.sendReactEmail({
      to: args.email,
      subject: `Welcome Job Seeker - ${appName}`,
      component: createElement(PlatformNotificationEmail, {
        appName,
        recipientName,
        eyebrow: "Job seeker activated",
        title: "You are now ready to find your next opportunity",
        lead: "Your application has been accepted. The platform is now set up to help you search and apply with ease.",
        steps,
        ctaLabel: "Go to dashboard",
        ctaUrl,
        ctaNote:
          "Update your profile regularly so the matching experience stays sharp.",
        closing:
          "We are excited to help you move from application to opportunity in a few easy steps.",
      }),
      text: buildTextSummary(
        "You are now ready to find your next opportunity",
        steps,
        ctaUrl,
      ),
    });
  }

  async sendEmployerWelcomeEmail(args: RoleWelcomeEmailArgs): Promise<void> {
    const appName = getAppName();
    const appUrl = getAppUrl();
    const recipientName = normalizeName(args.name, args.email);
    const ctaUrl =
      args.dashboardUrl || `${appUrl}/onboarding/employer/dashboard`;

    const steps: NotificationStep[] = [
      {
        title: "Finish your company profile",
        description:
          "Keep your company information complete so candidates can trust your listing.",
      },
      {
        title: "Post your first job",
        description:
          "Share a role in a few easy steps and begin attracting the right candidates.",
      },
      {
        title: "Review matched talent",
        description:
          "Shortlist candidates, compare profiles, and move forward with the best fit.",
      },
    ];

    await emailService.sendReactEmail({
      to: args.email,
      subject: `Welcome Employer - ${appName}`,
      component: createElement(PlatformNotificationEmail, {
        appName,
        recipientName,
        eyebrow: "Employer activated",
        title: "Your recruiting workspace is ready",
        lead: "Your company profile has been approved. You can now begin posting jobs and exploring talent on the platform.",
        steps,
        ctaLabel: "Go to dashboard",
        ctaUrl,
        ctaNote:
          "The sooner your jobs are live, the sooner the right candidates can find you.",
        closing:
          "We will keep the process simple so you can focus on hiring with confidence.",
      }),
      text: buildTextSummary(
        "Your recruiting workspace is ready",
        steps,
        ctaUrl,
      ),
    });
  }
}

export const notificationsService = new NotificationsService();
