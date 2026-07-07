"use client";

import React, { useTransition } from "react";
import { Download, FileBarChart2, FileSpreadsheet, Loader2 } from "lucide-react";

interface AdminReportsViewProps {
  users: Array<{ email: string; role: string; isSuspended: boolean; createdAt: string }>;
  businesses: Array<{ name: string; category: string; status: string; createdAt: string }>;
  logs: Array<{ action: string; details: string; createdAt: string }>;
}

export function AdminReportsView({ users, businesses, logs }: AdminReportsViewProps) {
  const [isPending, startTransition] = useTransition();

  // Helper converting arrays to CSV downloads
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUsers = () => {
    startTransition(async () => {
      const headers = ["Email", "Role Group", "Suspension Status", "Creation Date"];
      const rows = users.map((u) => [
        u.email,
        u.role,
        u.isSuspended ? "Suspended" : "Active",
        u.createdAt,
      ]);
      downloadCSV("platform_users_audit_list", headers, rows);
    });
  };

  const handleExportBusinesses = () => {
    startTransition(async () => {
      const headers = [
        "Business Profile Name",
        "Category Group",
        "Verification Status",
        "Creation Date",
      ];
      const rows = businesses.map((b) => [b.name, b.category, b.status, b.createdAt]);
      downloadCSV("platform_businesses_directory", headers, rows);
    });
  };

  const handleExportLogs = () => {
    startTransition(async () => {
      const headers = ["Action Type", "Transaction Log Details", "Created Timestamp"];
      const rows = logs.map((l) => [l.action, l.details, l.createdAt]);
      downloadCSV("system_audit_timeline_logs", headers, rows);
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Users export card */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">User Audit Lists</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Exports emails, registration timestamps, access groups, and verification flags.
          </p>
        </div>

        <button
          onClick={handleExportUsers}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Export CSV</span>
        </button>
      </div>

      {/* Businesses export card */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Business Directory</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Downloads all profiles metadata, verification statuses, and category groups.
          </p>
        </div>

        <button
          onClick={handleExportBusinesses}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Export CSV</span>
        </button>
      </div>

      {/* Audit Logs export card */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Audit Activity Logs</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Compiles action telemetry reports tracking platform transactions.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
export default AdminReportsView;
