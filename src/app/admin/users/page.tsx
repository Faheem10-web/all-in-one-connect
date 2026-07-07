import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/user";
import { UsersManager } from "@/components/admin/users-manager";
import React from "react";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  await connectToDatabase();

  // Fetch all users sorted by signup date
  const usersList = await User.find({}).sort({ createdAt: -1 });

  // Serialize users
  const serializedUsers = usersList.map((u) => ({
    _id: u._id.toString(),
    email: u.email,
    role: u.role,
    isSuspended: u.isSuspended ?? false,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage user system access groups, suspension logs, and credential roles
        </p>
      </div>

      <UsersManager users={serializedUsers} currentUserId={session.user.id || ""} />
    </div>
  );
}
