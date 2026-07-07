"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Globe } from "lucide-react";
import { cn } from "@/utils/cn";

interface SocialLinksFormProps {
  businessId: string;
  initialLinks: Array<{
    platform: string;
    url: string;
    isActive: boolean;
  }>;
}

const SUPPORTED_PLATFORMS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "YouTube",
  "WhatsApp",
  "Twitter",
  "Telegram",
];

export function SocialLinksForm({ businessId, initialLinks }: SocialLinksFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state maintaining link rows list
  const [links, setLinks] = useState(initialLinks);

  // Custom links addition states
  const [customPlatform, setCustomPlatform] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleUpdateLink = (index: number, field: "url" | "isActive", value: string | boolean) => {
    const updated = [...links];
    updated[index] = {
      ...updated[index],
      [field]: value,
    } as (typeof links)[number];
    setLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, idx) => idx !== index));
  };

  const handleAddCustomLink = () => {
    if (!customPlatform || !customUrl) {
      alert("Please enter a name/label and URL for your custom link.");
      return;
    }

    // Basic URL validation
    if (!customUrl.startsWith("http://") && !customUrl.startsWith("https://")) {
      alert("Custom URL must start with http:// or https://");
      return;
    }

    setLinks([...links, { platform: customPlatform, url: customUrl, isActive: true }]);

    // Clear custom form values
    setCustomPlatform("");
    setCustomUrl("");
    setShowCustomModal(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/owner/businesses/${businessId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            socialLinks: links,
          }),
        });

        const result = await response.json();
        if (result.success) {
          alert("Social links updated successfully!");
          router.refresh();
        } else {
          alert(result.error?.message || "Failed to update links.");
        }
      } catch (err) {
        console.error("Save social links error:", err);
        alert("Failed to submit. Check your connection.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Social Links Manager</h2>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-transparent text-foreground hover:bg-secondary text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>

        {/* Existing links edit grid */}
        {links.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No social links added yet. Click &quot;Add Link&quot; above to connect platforms.
          </p>
        ) : (
          <div className="space-y-4">
            {links.map((link, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border/80 rounded-lg bg-secondary/15"
              >
                <div className="flex items-center gap-2.5 shrink-0">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">{link.platform}</span>
                </div>

                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                  className="input-minimal text-xs flex-1 h-9"
                  placeholder="https://platform.com/username"
                  disabled={isPending}
                />

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      id={`links.${idx}.isActive`}
                      type="checkbox"
                      checked={link.isActive}
                      onChange={(e) => handleUpdateLink(idx, "isActive", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-1 cursor-pointer"
                      disabled={isPending}
                    />
                    <label
                      htmlFor={`links.${idx}.isActive`}
                      className="text-xs font-semibold text-muted-foreground select-none cursor-pointer"
                    >
                      Active
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Connections
        </button>
      </div>

      {/* Add Custom Link Modal Overlay */}
      {showCustomModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/60 z-50 p-4">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-foreground">Add Connection</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Platform Name / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Website, Portfolio, WhatsApp"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  className="input-minimal text-xs h-9"
                  list="platforms-preset"
                />
                <datalist id="platforms-preset">
                  {SUPPORTED_PLATFORMS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Destination URL
                </label>
                <input
                  type="text"
                  placeholder="https://link.com/profile"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="input-minimal text-xs h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="h-9 px-4 rounded-md border border-border bg-transparent text-foreground hover:bg-secondary text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomLink}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 cursor-pointer"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SocialLinksForm;
