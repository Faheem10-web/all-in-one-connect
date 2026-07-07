"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Trash2, Eye } from "lucide-react";
import { cn } from "@/utils/cn";

interface BrandingFormProps {
  businessId: string;
  logoUrl?: string;
  coverUrl?: string;
  branding: {
    primaryColor: string;
    textColor: string;
    theme: "LIGHT" | "DARK" | "SYSTEM";
    buttonRadius: number;
    fontFamily: string;
  };
}

const FONTS = ["Inter", "Arial", "sans-serif", "system-ui", "Georgia"];

export function BrandingForm({ businessId, logoUrl, coverUrl, branding }: BrandingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State bindings for visual preview
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [textColor, setTextColor] = useState(branding.textColor);
  const [theme, setTheme] = useState(branding.theme);
  const [buttonRadius, setButtonRadius] = useState(branding.buttonRadius);
  const [fontFamily, setFontFamily] = useState(branding.fontFamily);

  // Image links states
  const [logo, setLogo] = useState(logoUrl || "");
  const [cover, setCover] = useState(coverUrl || "");

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/owner/businesses/${businessId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            logoUrl: logo,
            coverUrl: cover,
            branding: {
              primaryColor,
              textColor,
              theme,
              buttonRadius,
              fontFamily,
            },
          }),
        });

        const result = await response.json();
        if (result.success) {
          alert("Branding settings saved successfully!");
          router.refresh();
        } else {
          alert(result.error?.message || "Failed to update branding.");
        }
      } catch (err) {
        console.error("Save branding error:", err);
        alert("Failed to save. Check your connection.");
      }
    });
  };

  // Simulated asset upload triggers
  const simulateUpload = (type: "LOGO" | "COVER") => {
    const url = prompt(
      `[DEMO MODE] Enter the URL of the ${type === "LOGO" ? "logo" : "cover"} image:`,
    );
    if (url === null) return; // Canceled
    if (type === "LOGO") {
      setLogo(url);
    } else {
      setCover(url);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Forms Left Panel (2 Columns) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Colors & Typography Cards */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-foreground">Branding Configuration</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  maxLength={7}
                  className="input-minimal text-xs font-semibold h-10 w-28 uppercase text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Text / UI Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  maxLength={7}
                  className="input-minimal text-xs font-semibold h-10 w-28 uppercase text-center"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full h-10 px-3 border border-border rounded-md bg-secondary/20 outline-none focus:border-ring text-xs font-semibold text-foreground cursor-pointer"
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Button Corner Radius
              </label>
              <span className="text-xs font-semibold text-foreground">{buttonRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              value={buttonRadius}
              onChange={(e) => setButtonRadius(Number(e.target.value))}
              className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Media Asset Upload Areas */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-foreground">Media Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo upload slot */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Brand Logo
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center bg-secondary/10 relative overflow-hidden group">
                {logo ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-16 h-16 rounded-full mx-auto object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="text-xs font-bold text-destructive hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => simulateUpload("LOGO")}
                    className="flex flex-col items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span>Upload Logo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cover upload slot */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cover Image
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center bg-secondary/10 relative overflow-hidden group">
                {cover ? (
                  <div className="space-y-3 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt="Cover"
                      className="h-16 w-full object-cover rounded-md border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setCover("")}
                      className="text-xs font-bold text-destructive hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => simulateUpload("COVER")}
                    className="flex flex-col items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span>Upload Cover</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Branding
          </button>
        </div>
      </div>

      {/* Device Preview Right Panel (1 Column) */}
      <div className="flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1">
          <Eye className="w-4 h-4" /> Live Mobile Preview
        </p>

        {/* Dynamic device mockup layout */}
        <div className="w-[280px] h-[540px] rounded-[36px] border-[10px] border-slate-900 bg-background overflow-hidden relative shadow-2xl flex flex-col">
          {/* Cover image preview */}
          <div className="h-28 bg-slate-200 relative shrink-0">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Logo preview */}
          <div className="relative h-6 shrink-0 z-10">
            <div className="absolute -top-7 left-6 w-14 h-14 rounded-full border-2 border-background bg-slate-300 overflow-hidden flex items-center justify-center">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Business Details Mock Container */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ fontFamily }}>
            <div>
              <div className="h-4 w-28 bg-slate-200 rounded-md mb-2" />
              <div className="h-3 w-16 bg-slate-100 rounded-md" />
            </div>

            {/* Simulated Action buttons updating with radius and brand colors */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((btn) => (
                <div
                  key={btn}
                  className="h-8 border flex items-center justify-center text-[9px] font-bold select-none cursor-pointer"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                    borderRadius: `${buttonRadius}px`,
                  }}
                >
                  Action
                </div>
              ))}
            </div>

            {/* Custom redirect links widgets mockup */}
            <div className="space-y-2">
              {[1, 2, 3].map((link) => (
                <div
                  key={link}
                  className="h-10 w-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs cursor-pointer select-none"
                  style={{
                    backgroundColor: primaryColor,
                    borderRadius: `${buttonRadius}px`,
                  }}
                >
                  Social media link
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal placeholder building icon
function Building2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
      <path d="M12 14h.01" />
    </svg>
  );
}
export default BrandingForm;
