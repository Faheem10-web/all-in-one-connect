import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reset Password | All In One Connect",
  description: "Set a new password for your account",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login");
  }

  return <ResetPasswordForm token={token} />;
}
