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

interface VerificationDecisionEmailArgs extends WelcomeEmailArgs {
  approved: boolean;
  ctaUrl?: string;
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

function buildDecisionEmailContent(options: {
  approved: boolean;
  approvedTitle: string;
  rejectedTitle: string;
  approvedLead: string;
  rejectedLead: string;
  approvedSteps: NotificationStep[];
  rejectedSteps: NotificationStep[];
  approvedCtaLabel: string;
  rejectedCtaLabel: string;
  approvedCtaUrl: string;
  rejectedCtaUrl: string;
  approvedCtaNote?: string;
  rejectedCtaNote?: string;
  approvedClosing?: string;
  rejectedClosing?: string;
}) {
  if (options.approved) {
    return {
      title: options.approvedTitle,
      lead: options.approvedLead,
      steps: options.approvedSteps,
      ctaLabel: options.approvedCtaLabel,
      ctaUrl: options.approvedCtaUrl,
      ctaNote: options.approvedCtaNote,
      closing: options.approvedClosing,
    };
  }

  return {
    title: options.rejectedTitle,
    lead: options.rejectedLead,
    steps: options.rejectedSteps,
    ctaLabel: options.rejectedCtaLabel,
    ctaUrl: options.rejectedCtaUrl,
    ctaNote: options.rejectedCtaNote,
    closing: options.rejectedClosing,
  };
}

class NotificationsService {
  private async sendDecisionEmail(
    args: VerificationDecisionEmailArgs & {
      subject: string;
      eyebrow: string;
      title: string;
      lead: string;
      steps: NotificationStep[];
      ctaLabel: string;
      ctaUrl: string;
      ctaNote?: string;
      closing?: string;
    },
  ): Promise<void> {
    const appName = getAppName();
    const recipientName = normalizeName(args.name, args.email);

    await emailService.sendReactEmail({
      to: args.email,
      subject: args.subject,
      component: createElement(PlatformNotificationEmail, {
        appName,
        recipientName,
        eyebrow: args.eyebrow,
        title: args.title,
        lead: args.lead,
        steps: args.steps,
        ctaLabel: args.ctaLabel,
        ctaUrl: args.ctaUrl,
        ctaNote: args.ctaNote,
        closing: args.closing,
      }),
      text: buildTextSummary(args.title, args.steps, args.ctaUrl),
    });
  }

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

  async sendJobSeekerDecisionEmail(
    args: VerificationDecisionEmailArgs,
  ): Promise<void> {
    const appUrl = getAppUrl();
    const ctaUrl = args.ctaUrl || `${appUrl}/onboarding/job-seeker`;

    const content = buildDecisionEmailContent({
      approved: args.approved,
      approvedTitle: "Your job seeker profile has been approved",
      rejectedTitle: "Your job seeker profile needs a few updates",
      approvedLead:
        "Your profile is now approved. You can start exploring matched opportunities, apply to roles, and keep your profile current for stronger results.",
      rejectedLead:
        "Your profile was not approved yet. Review the details below, update any missing information, and resubmit once everything is complete.",
      approvedSteps: [
        {
          title: "Review your matched roles",
          description:
            "Open your dashboard and start exploring roles that fit your qualification and experience.",
        },
        {
          title: "Apply with confidence",
          description:
            "Submit applications to the roles that match your goals and track progress from one place.",
        },
        {
          title: "Keep your profile updated",
          description:
            "Refresh your skills, experience, and location preferences so future matches stay relevant.",
        },
      ],
      rejectedSteps: [
        {
          title: "Review the missing details",
          description:
            "Check your profile information, qualifications, and experience for anything that may need to be completed.",
        },
        {
          title: "Update your profile",
          description:
            "Add the missing details or improve the clarity of your work history so the review team can re-evaluate it.",
        },
        {
          title: "Submit again for review",
          description:
            "Once the updates are in place, send your profile back for another approval pass.",
        },
      ],
      approvedCtaLabel: "Go to dashboard",
      rejectedCtaLabel: "Update profile",
      approvedCtaUrl: ctaUrl,
      rejectedCtaUrl: ctaUrl,
      approvedCtaNote:
        "Keep your skills and experience up to date to improve future matching quality.",
      rejectedCtaNote:
        "After updating your profile, you can resubmit it for another review.",
      approvedClosing:
        "We are ready to help you move from profile approval to active job search.",
      rejectedClosing:
        "Once your profile is updated, we will be ready to review it again.",
    });

    await this.sendDecisionEmail({
      ...args,
      subject: args.approved
        ? `Your job seeker profile has been approved - ${getAppName()}`
        : `Action needed on your job seeker profile - ${getAppName()}`,
      eyebrow: args.approved ? "Profile approved" : "Profile update needed",
      title: content.title,
      lead: content.lead,
      steps: content.steps,
      ctaLabel: content.ctaLabel,
      ctaUrl: content.ctaUrl,
      ctaNote: content.ctaNote,
      closing: content.closing,
    });
  }

  async sendEmployerDecisionEmail(
    args: VerificationDecisionEmailArgs,
  ): Promise<void> {
    const appUrl = getAppUrl();
    const ctaUrl = args.ctaUrl || `${appUrl}/onboarding/employer`;

    const content = buildDecisionEmailContent({
      approved: args.approved,
      approvedTitle: "Your employer account has been approved",
      rejectedTitle: "Your employer account needs a few updates",
      approvedLead:
        "Your company profile is now approved. You can start posting jobs, reviewing matched talent, and moving forward with hiring.",
      rejectedLead:
        "Your employer profile was not approved yet. Please review the missing details below, update the company information, and submit again.",
      approvedSteps: [
        {
          title: "Post your first job",
          description:
            "Create a listing and start attracting candidates who match your hiring needs.",
        },
        {
          title: "Review matched candidates",
          description:
            "Compare applicants and shortlist talent that best fits the role and your team.",
        },
        {
          title: "Keep company details current",
          description:
            "Maintain an accurate profile so candidates and reviewers can trust your workspace.",
        },
      ],
      rejectedSteps: [
        {
          title: "Review your company profile",
          description:
            "Check the business details, verification files, and contact information for anything incomplete.",
        },
        {
          title: "Update and resubmit",
          description:
            "Correct the missing information and submit the profile again for approval.",
        },
        {
          title: "Prepare to post jobs",
          description:
            "Once approved, you will be able to publish roles and manage candidates from your dashboard.",
        },
      ],
      approvedCtaLabel: "Go to dashboard",
      rejectedCtaLabel: "Update company profile",
      approvedCtaUrl: ctaUrl,
      rejectedCtaUrl: ctaUrl,
      approvedCtaNote:
        "Posting strong job details early helps the matching system surface relevant talent faster.",
      rejectedCtaNote:
        "After updating your company details, submit the review form again.",
      approvedClosing: "Your hiring workspace is ready whenever you are.",
      rejectedClosing:
        "Update the profile and the review team can take another look.",
    });

    await this.sendDecisionEmail({
      ...args,
      subject: args.approved
        ? `Your employer account has been approved - ${getAppName()}`
        : `Action needed on your employer account - ${getAppName()}`,
      eyebrow: args.approved ? "Account approved" : "Profile update needed",
      title: content.title,
      lead: content.lead,
      steps: content.steps,
      ctaLabel: content.ctaLabel,
      ctaUrl: content.ctaUrl,
      ctaNote: content.ctaNote,
      closing: content.closing,
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
