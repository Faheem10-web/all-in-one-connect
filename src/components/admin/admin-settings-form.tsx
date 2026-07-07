"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminSettingsForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Settings mock toggles
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);

  const handleSave = () => {
    startTransition(async () => {
      // Mock saving admin settings variables
      await new Promise((resolve) => setTimeout(resolve, 600));
      alert("Platform administrative parameters saved successfully!");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Settings details card */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-foreground">Operational States</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Maintenance Mode</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Take the platform offline for structural upgrades.
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-border text-primary cursor-pointer h-5 w-5"
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Allow New Account Sign-Ups</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Disable registrations to manage platform growth limits.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowRegistration}
              onChange={(e) => setAllowRegistration(e.target.checked)}
              className="rounded border-border text-primary cursor-pointer h-5 w-5"
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Mandatory Email Verification
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Require verification links verification before dashboard entries.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailVerificationRequired}
              onChange={(e) => setEmailVerificationRequired(e.target.checked)}
              className="rounded border-border text-primary cursor-pointer h-5 w-5"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center justify-center h-10 px-5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Settings
        </button>
      </div>
    </div>
  );
}
export default AdminSettingsForm;
