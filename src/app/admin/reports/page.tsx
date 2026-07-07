import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/user";
import Business from "@/lib/models/business";
import ActivityLog from "@/lib/models/activity-log";
import { AdminReportsView } from "@/components/admin/admin-reports-view";
import React from "react";

export default async function AdminReportsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  await connectToDatabase();

  const users = await User.find({}).sort({ createdAt: -1 });
  const businesses = await Business.find({}).sort({ createdAt: -1 });
  const logs = await ActivityLog.find({}).sort({ createdAt: -1 });

  // Serialize datasets
  const serializedUsers = users.map((u) => ({
    email: u.email,
    role: u.role,
    isSuspended: u.isSuspended ?? false,
    createdAt: u.createdAt.toISOString(),
  }));

  const serializedBusinesses = businesses.map((b) => ({
    name: b.name,
    category: b.category,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  const serializedLogs = logs.map((l) => ({
    action: l.action,
    details: l.details,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Platform Reports</h1>
        <p className="text-sm text-muted-foreground">
          Download datasets, user tables, and activity timelines as formatted spreadsheet CSV files
        </p>
      </div>

      <AdminReportsView
        users={serializedUsers}
        businesses={serializedBusinesses}
        logs={serializedLogs}
      />
    </div>
  );
}
