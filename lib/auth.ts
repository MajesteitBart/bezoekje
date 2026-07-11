import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";

import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/auth-schema";
import { sendOtpEmail } from "@/lib/email";

function createAuth() {
  return betterAuth({
    baseURL:
      process.env.BETTER_AUTH_URL ??
      (process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : "http://localhost:3000"),
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite", schema: authSchema }),
    session: {
      expiresIn: 60 * 60 * 24 * 30,
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 60 * 10,
        allowedAttempts: 3,
        // Awaited on purpose: every address gets a mail (unknown ones just
        // become an empty account), so timing reveals nothing — and a send
        // failure must surface as an error instead of an endless wait.
        async sendVerificationOTP({ email, otp }) {
          await sendOtpEmail(email, otp);
        },
      }),
      // Must stay last: lets server actions set the session cookie.
      nextCookies(),
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;

const g = globalThis as typeof globalThis & { __visitsAuth?: Auth };

function getAuth(): Auth {
  g.__visitsAuth ??= createAuth();
  return g.__visitsAuth;
}

// Same lazy pattern as lib/db: `next build` imports this module while
// collecting page data, and the secret only exists at runtime.
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuth(), prop, receiver);
  },
});
