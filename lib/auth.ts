import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: true,
        returned: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 15 * 60,
    autoSignIn: false,
    // TODO: Implement email sending for password reset
    // sendResetPassword: async ({ user, url, token }) => {
    //   const baseMetadata = {
    //     channels: {
    //       email: {
    //         to: user.email,
    //         subject: `Reset Your Password - ${process.env.APP_NAME || "SIDS"}`,
    //         status: "PENDING",
    //       },
    //     },
    //   } as const;

    //   //   const notification = await notificationService.create({
    //   //     userId: user.id,
    //   //     type: NotificationType.SYSTEM,
    //   //     title: "Password reset requested",
    //   //     message:
    //   //       "We received a request to reset your password. Check your email for the reset link.",
    //   //     metadata: baseMetadata,
    //   //   });
    // },
  },
});
