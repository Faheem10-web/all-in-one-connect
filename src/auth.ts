import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/user";
import argon2 from "argon2";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      async profile(profile) {
        // Sync or register OAuth accounts inside our Mongo Atlas database
        await connectToDatabase();
        let user = await User.findOne({ email: profile.email.toLowerCase() });

        if (!user) {
          user = await User.create({
            email: profile.email.toLowerCase(),
            role: "BUSINESS_OWNER",
            isVerified: true, // Google accounts verified
          });
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        await connectToDatabase();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.passwordHash) {
          return null;
        }

        // In dev mode (no real SMTP configured), skip email verification check
        const smtpConfigured =
          process.env.SMTP_USER && process.env.SMTP_USER !== "smtp-username";
        if (smtpConfigured && !user.isVerified) {
          console.warn(`[AUTH] Login blocked — email not verified: ${email}`);
          return null;
        }

        const passwordsMatch = await argon2.verify(user.passwordHash, password);
        if (passwordsMatch) {
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: user.email?.toLowerCase() });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        } else {
          token.id = user.id;
          token.role = user.role || "BUSINESS_OWNER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
