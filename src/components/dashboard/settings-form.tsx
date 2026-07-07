"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Loader2, ShieldCheck, Mail, ShieldAlert } from "lucide-react";

export function SettingsForm() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const handlePasswordResetRequest = () => {
    if (!session?.user?.email) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: session.user.email }),
        });

        // Wait, standard route reset trigger
        alert(
          "If the account is registered, a password reset link has been dispatched to your email address!",
        );
      } catch (err) {
        console.error("Reset trigger error:", err);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-foreground">Account Coordinates</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 p-3.5 border border-border/80 rounded-lg bg-secondary/10">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Registered Email Address
            </span>
            <p className="text-sm font-semibold text-foreground truncate mt-1">
              {session?.user?.email || "loading..."}
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 border border-border/80 rounded-lg bg-secondary/10">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Security Access Group
            </span>
            <p className="text-sm font-semibold text-foreground uppercase mt-1">
              {session?.user?.role || "loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Security Actions Card */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-foreground">Sign In & Credentials</h2>
        <p className="text-xs text-muted-foreground">
          To update your password, request a secure verification connection reset email below.
        </p>

        <div>
          <button
            type="button"
            onClick={handlePasswordResetRequest}
            disabled={isPending}
            className="flex items-center justify-center h-10 px-5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Reset Password Details
          </button>
        </div>
      </div>
    </div>
  );
}
export default SettingsForm;
