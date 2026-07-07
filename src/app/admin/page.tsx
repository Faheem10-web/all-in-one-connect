import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/user";
import Business from "@/lib/models/business";
import QRCode from "@/lib/models/qrcode";
import ActivityLog from "@/lib/models/activity-log";
import Link from "next/link";
import { Users, Building2, TrendingUp, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { AdminApproveButton } from "@/components/admin/admin-approve-button";

export default async function AdminDashboardPage() {
  await connectToDatabase();

  // 1. Core counters
  const totalUsers = await User.countDocuments();
  const totalBusinesses = await Business.countDocuments({ isDeleted: { $ne: true } });
  const pendingCount = await Business.countDocuments({
    status: "PENDING",
    isDeleted: { $ne: true },
  });

  // 2. Fetch sum of scans across QRCode collection
  const qrs = await QRCode.find({});
  const totalScans = qrs.reduce((acc, curr) => acc + (curr.scanCount || 0), 0);

  // 3. Fetch latest 5 activity logs
  const activityLogs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(5);

  // 4. Fetch pending businesses for quick approval shortcuts
  const pendingBusinesses = await Business.find({
    status: "PENDING",
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Platform Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back to the administrator panel. Here is the operational state of the SaaS
          platform.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-card border border-border rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Users
            </span>
            <h3 className="text-2xl font-black text-foreground">{totalUsers}</h3>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Profiles
            </span>
            <h3 className="text-2xl font-black text-foreground">{totalBusinesses}</h3>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Pending Audit
            </span>
            <h3 className="text-2xl font-black text-foreground">{pendingCount}</h3>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Scan Hits
            </span>
            <h3 className="text-2xl font-black text-foreground">{totalScans}</h3>
          </div>
          <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Pending business approvals list (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Pending Approvals Queue</h2>
              <Link
                href="/admin/businesses"
                className="text-xs font-semibold text-blue-500 hover:underline"
              >
                View All
              </Link>
            </div>

            {pendingBusinesses.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                All business profile creations have been audited. No pending items.
              </p>
            ) : (
              <div className="space-y-4">
                {pendingBusinesses.map((b) => (
                  <div
                    key={b._id.toString()}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/80 rounded-lg bg-secondary/15 hover:bg-secondary/35 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {b.name}
                        <Link
                          href={`/${b.businessSlug}`}
                          target="_blank"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Category: {b.category}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <AdminApproveButton businessId={b._id.toString()} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Audit trails feed (1 col) */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4.5 h-4.5" /> Audit Activity Log
          </h2>

          {activityLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No recorded operations</p>
          ) : (
            <div className="space-y-3.5">
              {activityLogs.map((log) => (
                <div
                  key={log._id.toString()}
                  className="border-b border-border/60 pb-3 last:border-0 last:pb-0 text-xs"
                >
                  <p className="font-semibold text-foreground capitalize">
                    {log.action.replace("_", " ")}
                  </p>
                  <p className="text-muted-foreground mt-0.5">{log.details}</p>
                  <span className="text-[9px] text-muted-foreground font-semibold mt-1 block">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
