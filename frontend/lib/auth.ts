import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { transporter } from "./nodemailer"
import { Pool } from "pg"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({user, url, token}, request) => {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset your KnowYourVote password",
        text: `Click the following link to reset your password: ${url}`
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Verify your KnowYourVote email address",
        text: `Click the following link to verify your email: ${url}`
      })
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  plugins: [nextCookies()]
})