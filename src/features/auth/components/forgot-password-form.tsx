"use client";

import React, { useActionState } from "react";
import { forgotPassword } from "../actions";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your email and we&apos;ll send you a link to reset your password
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.message && (
          <div
            className={`p-3 text-xs font-medium rounded-md border text-center ${
              state.success
                ? "text-green-600 bg-green-50 border-green-200"
                : "text-destructive-foreground bg-destructive/10 border-destructive/20"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="space-y-2">
          <label
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-minimal text-sm"
            placeholder="name@company.com"
          />
          {state?.errors?.email && (
            <p className="text-xs font-medium text-destructive mt-1">{state.errors.email[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-accent hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
