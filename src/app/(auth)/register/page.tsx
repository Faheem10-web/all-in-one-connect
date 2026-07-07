import { RegisterForm } from "@/features/auth/components/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | All In One Connect",
  description: "Create an account to start building your digital profile",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
