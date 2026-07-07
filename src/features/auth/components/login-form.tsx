"use client";

import React, { useActionState } from "react";
import { loginUser } from "../actions";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginUser, null);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to manage your dynamic connections
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.message && !state.success && (
          <div className="p-3 text-xs font-medium text-destructive-foreground bg-destructive/10 rounded-md border border-destructive/20 text-center">
            {state.message}
          </div>
        )}

        {state?.message && state.success && (
          <div className="p-3 text-xs font-medium text-green-600 bg-green-50 rounded-md border border-green-200 text-center">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              htmlFor="password"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline font-medium"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input-minimal text-sm"
            placeholder="••••••••"
          />
          {state?.errors?.password && (
            <p className="text-xs font-medium text-destructive mt-1">{state.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-border bg-transparent text-foreground hover:bg-secondary active:scale-98 transition-all duration-150 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24">
          <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              d="M21.35,11.1H12v2.7h5.38C16.88,15.6,14.77,17.1,12,17.1c-3.15,0-5.7-2.55-5.7-5.7s2.55-5.7,5.7-5.7c1.53,0,2.82,0.59,3.78,1.53l2.07-2.07C16.14,3.54,14.22,3,12,3c-4.95,0-9,4.05-9,9s4.05,9,9,9c4.95,0,9-4.05,9-9C21,11.73,20.82,11.1,21.35,11.1z"
              fill="#4285F4"
            />
          </g>
        </svg>
        <span>Google</span>
      </button>

      <div className="text-center mt-6 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline font-semibold">
          Create account
        </Link>
      </div>
    </motion.div>
  );
}
