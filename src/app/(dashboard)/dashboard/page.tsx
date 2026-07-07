import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import { LogOut, User, Activity, QrCode } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Dashboard Nav Header */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shadow-xs">
        <span className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
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
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-foreground">{session.user.email}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {session.user.role}
            </span>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Workspace Dashboard Layout */}
      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your connections, branding, and statistics
          </p>
        </div>

        {/* Dynamic Card Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Dynamic QR Code</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Generate and update your redirection code properties.
              </p>
              <Link
                href="/dashboard/qr"
                className="inline-block mt-4 text-xs font-bold text-blue-500 hover:underline"
              >
                Manage QR &rarr;
              </Link>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex items-start gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Business Profile</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure hours, location, cover details, and social links.
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-block mt-4 text-xs font-bold text-blue-500 hover:underline"
              >
                Edit Profile &rarr;
              </Link>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Analytics Metrics</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Log unique scans, device browser configurations, and maps locations.
              </p>
              <Link
                href="/dashboard/analytics"
                className="inline-block mt-4 text-xs font-bold text-blue-500 hover:underline"
              >
                View Charts &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Warning notification about onboarding status */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400">
          Setup Checklist: You can start customizing your business details by clicking on &quot;Edit
          Profile&quot; or download your code under &quot;Manage QR&quot;.
        </div>
      </main>
    </div>
  );
}
