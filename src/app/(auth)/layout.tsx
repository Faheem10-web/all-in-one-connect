import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Visual Showcase Panel (Desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-slate-100 flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle grid patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        {/* Decorative dynamic glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative z-10">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="2" y="2" width="20" height="20" rx="4" />
              <path d="M12 7v10M7 12h10" />
            </svg>
            ALL IN ONE CONNECT
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            One QR. <br />
            Every Business Connection.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Create your premium digital business profile, configure custom branding, add custom
            redirects, and connect instantly with visitors.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium">
          &copy; 2026 All In One Connect. Inc. All rights reserved.
        </div>
      </div>

      {/* Main Forms Display Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full flex justify-center">{children}</div>
      </div>
    </div>
  );
}
