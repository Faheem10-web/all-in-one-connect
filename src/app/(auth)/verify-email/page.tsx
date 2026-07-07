import { verifyEmail } from "@/features/auth/actions";
import Link from "next/link";
import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | All In One Connect",
  description: "Verify your email address details",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm text-center space-y-4">
        <XCircle className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold tracking-tight">Invalid Verification Link</h1>
        <p className="text-sm text-muted-foreground">
          No verification token was provided. Please request a new registration link.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all duration-150"
        >
          Back to Sign Up
        </Link>
      </div>
    );
  }

  const result = await verifyEmail(token);

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm text-center space-y-6">
      {result.success ? (
        <>
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">Email Verified!</h1>
          <p className="text-sm text-muted-foreground">{result.message}</p>
          <Link
            href="/login"
            className="w-full flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150"
          >
            Go to Sign In
          </Link>
        </>
      ) : (
        <>
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Verification Failed</h1>
          <p className="text-sm text-muted-foreground">{result.message}</p>
          <Link
            href="/register"
            className="w-full flex items-center justify-center h-10 px-4 rounded-md border border-border bg-transparent text-foreground hover:bg-secondary active:scale-98 transition-all duration-150"
          >
            Back to Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
