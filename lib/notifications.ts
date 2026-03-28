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

interface ApplicationReceivedEmailArgs {
  employerEmail: string;
  employerName?: string;
  seekerName?: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
  matchScore?: number;
  dashboardUrl?: string;
}

interface ApplicationUpdateEmailArgs extends WelcomeEmailArgs {
  approved: boolean;
  jobTitle: string;
  companyName: string;
  applicationId: string;
  dashboardUrl?: string;
}

interface InterviewScheduledEmailArgs extends WelcomeEmailArgs {
  jobTitle: string;
  companyName: string;
  applicationId: string;
  interviewDate: string;
  interviewLocation: string;
  notes?: string | null;
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

  async sendEmployerApplicationReceivedEmail(
    args: ApplicationReceivedEmailArgs,
  ): Promise<void> {
    const appName = getAppName();
    const dashboardUrl =
      args.dashboardUrl || `${getAppUrl()}/onboarding/employer/applicants`;
    const recipientName = normalizeName(args.employerName, args.employerEmail);

    const steps: NotificationStep[] = [
      {
        title: "Review the new applicant",
        description:
          "Open the application and review the candidate profile, match score, and submitted details.",
      },
      {
        title: "Compare fit for the role",
        description:
          "Check how the seeker aligns with the qualification and skills you requested.",
      },
      {
        title: "Choose the next action",
        description:
          "Shortlist the candidate, schedule an interview, or reject the application if it is not a fit.",
      },
    ];

    await emailService.sendReactEmail({
      to: args.employerEmail,
      subject: `New application received for ${args.jobTitle} - ${appName}`,
      component: createElement(PlatformNotificationEmail, {
        appName,
        recipientName,
        eyebrow: "New application",
        title: `A new candidate applied for ${args.jobTitle}`,
        lead: `${args.seekerName || "A candidate"} has submitted an application for ${args.jobTitle} at ${args.companyName}. The application is ready for review from your employer dashboard.`,
        steps,
        ctaLabel: "Review application",
        ctaUrl: dashboardUrl,
        ctaNote:
          typeof args.matchScore === "number"
            ? `Initial match score: ${args.matchScore.toFixed(0)}%.`
            : "Open the dashboard to review the full application profile.",
        closing:
          "The best hiring decisions usually come from timely review and clear next steps.",
      }),
      text: buildTextSummary(
        `A new candidate applied for ${args.jobTitle}`,
        steps,
        dashboardUrl,
      ),
    });
  }

  async sendJobSeekerApplicationUpdateEmail(
    args: ApplicationUpdateEmailArgs,
  ): Promise<void> {
    const appUrl = getAppUrl();
    const dashboardUrl =
      args.dashboardUrl ||
      `${appUrl}/onboarding/job-seeker/dashboard/applications/${args.applicationId}`;

    const content = buildDecisionEmailContent({
      approved: args.approved,
      approvedTitle: `Your application for ${args.jobTitle} has been shortlisted`,
      rejectedTitle: `Your application for ${args.jobTitle} was not selected`,
      approvedLead:
        "The employer has moved your application forward. You can review the application details and prepare for the next step if a meeting is added.",
      rejectedLead:
        "The employer has reviewed your application and decided not to proceed with this role.",
      approvedSteps: [
        {
          title: "Open the application details",
          description:
            "Check the latest status, notes, and any interview information added by the employer.",
        },
        {
          title: "Stay ready for follow-up",
          description:
            "If a meeting is added, respond quickly so the hiring process keeps moving.",
        },
        {
          title: "Keep applying strategically",
          description:
            "Continue reviewing relevant matches so you always have active opportunities in progress.",
        },
      ],
      rejectedSteps: [
        {
          title: "Review the role details",
          description:
            "Use the application history to understand what the role asked for and how it compares with your profile.",
        },
        {
          title: "Improve your profile where needed",
          description:
            "Update your experience, skills, or qualifications so future applications stay competitive.",
        },
        {
          title: "Apply to other relevant roles",
          description:
            "Move quickly to the next fit so your job search keeps momentum.",
        },
      ],
      approvedCtaLabel: "View application",
      rejectedCtaLabel: "View application",
      approvedCtaUrl: dashboardUrl,
      rejectedCtaUrl: dashboardUrl,
      approvedCtaNote:
        "If the employer adds a meeting or notes, they will appear in the application detail page.",
      rejectedCtaNote:
        "The application history is still available for future reference.",
      approvedClosing:
        "Keep an eye on your dashboard so you can respond quickly to the next update.",
      rejectedClosing:
        "Use the feedback to shape stronger applications going forward.",
    });

    await this.sendDecisionEmail({
      ...args,
      subject: args.approved
        ? `Your application has been shortlisted - ${getAppName()}`
        : `Update on your application - ${getAppName()}`,
      eyebrow: args.approved ? "Application shortlisted" : "Application closed",
      title: content.title,
      lead: content.lead,
      steps: content.steps,
      ctaLabel: content.ctaLabel,
      ctaUrl: content.ctaUrl,
      ctaNote: content.ctaNote,
      closing: content.closing,
    });
  }

  async sendJobSeekerInterviewScheduledEmail(
    args: InterviewScheduledEmailArgs,
  ): Promise<void> {
    const appName = getAppName();
    const dashboardUrl =
      args.dashboardUrl ||
      `${getAppUrl()}/onboarding/job-seeker/dashboard/applications/${args.applicationId}`;
    const recipientName = normalizeName(args.name, args.email);
    const interviewDate = new Date(args.interviewDate);
    const formattedDate = Number.isNaN(interviewDate.getTime())
      ? args.interviewDate
      : interviewDate.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        });

    const steps: NotificationStep[] = [
      {
        title: "Review the meeting details",
        description: `Your interview is scheduled for ${formattedDate} at ${args.interviewLocation}.`,
      },
      {
        title: "Prepare for the conversation",
        description:
          "Bring the essentials: your updated profile, notes about the role, and any documents the employer may need.",
      },
      {
        title: "Watch for follow-up instructions",
        description: args.notes?.trim()
          ? args.notes.trim()
          : "If the employer requests a call or sends additional notes, respond promptly so the process keeps moving.",
      },
    ];

    await emailService.sendReactEmail({
      to: args.email,
      subject: `Interview scheduled for ${args.jobTitle} - ${appName}`,
      component: createElement(PlatformNotificationEmail, {
        appName,
        recipientName,
        eyebrow: "Interview scheduled",
        title: `Your interview for ${args.jobTitle} is confirmed`,
        lead: `The employer at ${args.companyName} has added a meeting for your application. Please review the details below and prepare ahead of time.`,
        steps,
        ctaLabel: "View application",
        ctaUrl: dashboardUrl,
        ctaNote:
          "If the employer adds notes or asks for a call, you will see the latest update in your dashboard.",
        closing:
          "Staying prepared and responsive helps the hiring process stay smooth for everyone involved.",
      }),
      text: buildTextSummary(
        `Your interview for ${args.jobTitle} is confirmed`,
        steps,
        dashboardUrl,
      ),
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
