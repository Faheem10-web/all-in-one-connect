"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Mail,
  Share2,
  Download,
  Calendar,
  CheckCircle2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

interface ProfileViewProps {
  business: {
    _id: string;
    name: string;
    category: string;
    tagline?: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    hours?: Array<{ day: string; open: string; close: string; closed: boolean }>;
    branding: {
      primaryColor: string;
      textColor: string;
      theme: "LIGHT" | "DARK" | "SYSTEM";
      buttonRadius: number;
      fontFamily: string;
    };
    socialLinks?: Array<{ platform: string; url: string; isActive: boolean }>;
  };
  gallery: Array<{ _id: string; imageUrl: string; title?: string }>;
}

export function ProfileView({ business, gallery }: ProfileViewProps) {
  const { branding } = business;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Parse active social links
  const activeSocials = business.socialLinks?.filter((s) => s.isActive && s.url) || [];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Determine current Open/Closed status client-side (matches user timezone)
  let isOpenNow = null;
  if (isMounted && business.hours && business.hours.length > 0) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDay = daysOfWeek[new Date().getDay()];
    const todayHours = business.hours.find((h) => h.day === currentDay);

    if (!todayHours || todayHours.closed) {
      isOpenNow = false;
    } else {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [openH, openM] = todayHours.open.split(":").map(Number);
      const [closeH, closeM] = todayHours.close.split(":").map(Number);

      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      isOpenNow = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }
  }

  // Copy details helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generate and Download vCard contact file
  const handleDownloadVCard = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${business.name}`,
      `ORG:${business.category}`,
      business.phone ? `TEL;TYPE=WORK,VOICE:${business.phone}` : "",
      business.email ? `EMAIL;TYPE=PREF,INTERNET:${business.email}` : "",
      business.website ? `URL:${business.website}` : "",
      business.address ? `ADR;TYPE=WORK:;;${business.address};;;;` : "",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${business.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Web Sharing action
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.tagline || `Check out ${business.name} profile!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopy(window.location.href, "Profile Link");
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 pb-16 flex justify-center"
      style={{ fontFamily: branding.fontFamily }}
    >
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg relative flex flex-col">
        {/* Cover Canvas Area */}
        <div className="h-40 bg-slate-200 relative shrink-0">
          {business.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-200" />
          )}
        </div>

        {/* Profile Card Header overlay */}
        <div className="px-6 relative -mt-10 mb-4 flex items-end justify-between">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md flex items-center justify-center shrink-0">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              aria-label="Share profile link"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={handleDownloadVCard}
              className="p-2.5 rounded-full text-white transition-opacity shadow-xs cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: branding.primaryColor }}
              aria-label="Download business contact card"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Business Title Details */}
        <div className="px-6 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{business.name}</h1>
            <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 fill-blue-500/10 shrink-0" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              {business.category}
            </span>

            {/* Live Open/Closed badge */}
            {isOpenNow !== null && (
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                  isOpenNow
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200",
                )}
              >
                {isOpenNow ? "Open Now" : "Closed"}
              </span>
            )}
          </div>

          {business.tagline && (
            <p className="text-xs italic text-slate-500 font-medium">
              &quot;{business.tagline}&quot;
            </p>
          )}

          {business.description && (
            <p className="text-xs text-slate-600 leading-relaxed pt-1">{business.description}</p>
          )}
        </div>

        {/* Quick Contacts Actions Panel */}
        <div className="px-6 py-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Quick Contacts
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="h-10 flex items-center justify-center gap-2 text-xs font-bold text-white shadow-xs transition-opacity"
                style={{
                  backgroundColor: branding.primaryColor,
                  borderRadius: `${branding.buttonRadius}px`,
                }}
              >
                <Phone className="w-3.5 h-3.5" /> Call Now
              </a>
            )}

            {business.phone && (
              <a
                href={`https://wa.me/${business.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 flex items-center justify-center gap-2 text-xs font-bold border shadow-xs hover:bg-slate-50 transition-colors"
                style={{
                  borderColor: branding.primaryColor,
                  color: branding.primaryColor,
                  borderRadius: `${branding.buttonRadius}px`,
                }}
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}

            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="h-10 flex items-center justify-center gap-2 text-xs font-bold border shadow-xs hover:bg-slate-50 transition-colors"
                style={{
                  borderColor: branding.primaryColor,
                  color: branding.primaryColor,
                  borderRadius: `${branding.buttonRadius}px`,
                }}
              >
                <Mail className="w-3.5 h-3.5" /> Email Us
              </a>
            )}

            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 flex items-center justify-center gap-2 text-xs font-bold border shadow-xs hover:bg-slate-50 transition-colors"
                style={{
                  borderColor: branding.primaryColor,
                  color: branding.primaryColor,
                  borderRadius: `${branding.buttonRadius}px`,
                }}
              >
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
          </div>
        </div>

        {/* Social Channels section */}
        {activeSocials.length > 0 && (
          <div className="px-6 pb-6 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Connect Socially
            </h2>
            <div className="flex flex-col gap-2">
              {activeSocials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 w-full flex items-center justify-between px-4 text-xs font-bold text-white transition-opacity shadow-xs"
                  style={{
                    backgroundColor: branding.primaryColor,
                    borderRadius: `${branding.buttonRadius}px`,
                  }}
                >
                  <span>Follow on {social.platform}</span>
                  <Globe className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Gallery section */}
        {gallery.length > 0 && (
          <div className="px-6 pb-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Photo Gallery
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((image) => (
                <div
                  key={image._id}
                  onClick={() => setSelectedImage(image.imageUrl)}
                  className="aspect-square border border-slate-100 rounded-lg overflow-hidden relative cursor-pointer group bg-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={image.title || "Gallery"}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Table section */}
        <div className="px-6 pb-8 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Location & Hours
          </h2>

          <div className="space-y-3.5 text-xs text-slate-700">
            {business.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Address</p>
                  <p className="text-slate-600 mt-0.5">{business.address}</p>
                </div>
              </div>
            )}

            {business.hours && business.hours.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Working Hours</p>
                  <div className="mt-1.5 space-y-1 text-slate-600">
                    {business.hours.map((h) => (
                      <div key={h.day} className="flex justify-between max-w-[240px]">
                        <span className="font-semibold">{h.day}</span>
                        <span>{h.closed ? "Closed" : `${h.open} - ${h.close}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copy confirmation feedback widget */}
        <AnimatePresence>
          {copiedText && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 z-50"
            >
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span>Copied {copiedText}!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Image Lightbox Overlay */}
        <AnimatePresence>
          {selectedImage && (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-950/85 z-50 p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-xl max-h-[80vh] overflow-hidden rounded-lg bg-black border border-white/10 shadow-2xl flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Expanded preview"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer brand signature */}
        <footer className="mt-auto py-8 text-center shrink-0 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Powered by All In One Connect
          </p>
        </footer>
      </div>
    </div>
  );
}
export default ProfileView;
