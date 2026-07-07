"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

interface AdminApproveButtonProps {
  businessId: string;
}

export function AdminApproveButton({ businessId }: AdminApproveButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (status: "APPROVED" | "SUSPENDED") => {
    if (status === "SUSPENDED" && !confirm("Are you sure you want to reject this profile?")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/admin/businesses/${businessId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        const result = await response.json();
        if (result.success) {
          alert(`Business profile set to "${status}" successfully!`);
          router.refresh();
        } else {
          alert(result.error?.message || "Failed to update profile verification status.");
        }
      } catch (err) {
        console.error("Status update error:", err);
        alert("Failed to submit status update.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleUpdateStatus("APPROVED")}
        disabled={isPending}
        className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
        title="Approve Profile"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>

      <button
        onClick={() => handleUpdateStatus("SUSPENDED")}
        disabled={isPending}
        className="h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
        title="Reject Profile"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
export default AdminApproveButton;
