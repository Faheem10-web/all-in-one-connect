import { LoginForm } from "@/features/auth/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | All In One Connect",
  description: "Sign in to access your dashboard settings",
};

export default function LoginPage() {
  return <LoginForm />;
}
