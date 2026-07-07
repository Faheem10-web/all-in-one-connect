import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import QRCode from "@/lib/models/qrcode";
import Analytics from "@/lib/models/analytics";
import ActivityLog from "@/lib/models/activity-log";
import Notification from "@/lib/models/notification";
import Link from "next/link";
import { cn } from "@/utils/cn";
import {
  QrCode,
  Building2,
  Bell,
  CheckCircle,
  AlertTriangle,
  History,
  TrendingUp,
} from "lucide-react";
import { CreateBusinessForm } from "@/components/dashboard/create-business-form";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectToDatabase();

  // 1. Fetch businesses owned by this user
  const businesses = await Business.find({
    userId: session.user.id,
    isDeleted: { $ne: true },
  });

  // 2. Fetch recent activity logs
  const activityLogs = await ActivityLog.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(5);

  // 3. Fetch latest unread notifications
  const notifications = await Notification.find({
    userId: session.user.id,
    readStatus: false,
  })
    .sort({ createdAt: -1 })
    .limit(5);

  // If no businesses exist, render the empty onboarding state
  if (businesses.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create your business profile
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Get started by creating your dynamic digital business profile and generating your
              unique QR code connection.
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl text-left shadow-xs">
            <CreateBusinessForm />
          </div>
        </div>
      </div>
    );
  }

  // Active business metrics
  const activeBusiness = businesses[0];

  // Fetch linked QR details
  const qrCode = await QRCode.findOne({ businessId: activeBusiness._id });

  // Calculate scan statistics
  const scansToday = await Analytics.countDocuments({
    businessId: activeBusiness._id,
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  const totalScans = qrCode?.scanCount || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {session.user.email?.split("@")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here is what is happening with{" "}
            <span className="font-bold text-foreground">{activeBusiness.name}</span> today.
          </p>
        </div>

        {/* Verification Alert Banner */}
        {activeBusiness.status === "PENDING" && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Profile Pending Verification Check</span>
          </div>
        )}
        {activeBusiness.status === "APPROVED" && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-green-500/20 bg-green-500/10 text-xs font-semibold text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Active Business Profile Verified</span>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scans Today
            </p>
            <h3 className="text-3xl font-black mt-2 text-foreground">{scansToday}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Scans
            </p>
            <h3 className="text-3xl font-black mt-2 text-foreground">{totalScans}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verification State
            </p>
            <h3 className="text-lg font-bold mt-3 text-foreground capitalize">
              {activeBusiness.status.toLowerCase()}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Info feeds & Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Quick actions and check sheets (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Actions Shortcuts */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard/profile"
                className="p-4 border border-border hover:border-ring rounded-lg bg-secondary/30 hover:bg-background transition-all text-left group cursor-pointer"
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                  Edit Profile Info
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Change schedules, address, description details.
                </p>
              </Link>

              <Link
                href="/dashboard/branding"
                className="p-4 border border-border hover:border-ring rounded-lg bg-secondary/30 hover:bg-background transition-all text-left group cursor-pointer"
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                  Branding Layouts
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Upload logos, covers, custom primary theme colors.
                </p>
              </Link>

              <Link
                href="/dashboard/qr"
                className="p-4 border border-border hover:border-ring rounded-lg bg-secondary/30 hover:bg-background transition-all text-left group cursor-pointer"
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                  Dynamic QR Code
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Download SVG/PNG, customize redirect options.
                </p>
              </Link>

              <Link
                href="/dashboard/social"
                className="p-4 border border-border hover:border-ring rounded-lg bg-secondary/30 hover:bg-background transition-all text-left group cursor-pointer"
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                  Social Links
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Add Facebook, Instagram, custom web targets.
                </p>
              </Link>
            </div>
          </div>

          {/* Setup checklist widget */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground">Profile Onboarding Checklist</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">Create business profile</h4>
                  <p className="text-xs text-muted-foreground">
                    Successfully initialized your business coordinates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                    activeBusiness.logoUrl
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border text-transparent",
                  )}
                >
                  {activeBusiness.logoUrl ? <CheckCircle className="w-4 h-4" /> : null}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Upload brand logo</h4>
                  <p className="text-xs text-muted-foreground">
                    Add your company symbol to customize public interfaces.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                    activeBusiness.socialLinks?.length > 0
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border text-transparent",
                  )}
                >
                  {activeBusiness.socialLinks?.length > 0 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : null}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Add social media channels</h4>
                  <p className="text-xs text-muted-foreground">
                    Connect with visitors on Instagram, WhatsApp, or Facebook.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Logs feed and notifications (1 col) */}
        <div className="space-y-6">
          {/* Notifications feed */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4" /> Alerts
              </h2>
              {notifications.length > 0 && (
                <Link
                  href="/dashboard/notifications"
                  className="text-xs text-accent font-semibold hover:underline"
                >
                  All
                </Link>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No new notifications</p>
            ) : (
              <div className="space-y-3.5">
                {notifications.map((notif) => (
                  <div
                    key={notif._id.toString()}
                    className="border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <h4 className="text-xs font-bold text-foreground">{notif.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Logs feed */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" /> Activity
              </h2>
              {activityLogs.length > 0 && (
                <Link
                  href="/dashboard/logs"
                  className="text-xs text-accent font-semibold hover:underline"
                >
                  All
                </Link>
              )}
            </div>

            {activityLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No recorded operations
              </p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log._id.toString()} className="flex flex-col gap-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      {log.action.replace("_", " ")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
