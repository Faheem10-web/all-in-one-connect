"use client";

import React, { useState, useTransition } from "react";
import { updateUserStatus, updateUserRole, deleteUser } from "@/features/admin/actions";
import { useRouter } from "next/navigation";
import { Search, Loader2, ShieldCheck, ShieldAlert, UserX, UserCheck, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";

import { UserRole } from "@/lib/models/user";

interface UserItem {
  _id: string;
  email: string;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
}

interface UsersManagerProps {
  users: UserItem[];
  currentUserId: string;
}

export function UsersManager({ users, currentUserId }: UsersManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search input state
  const [search, setSearch] = useState("");

  const handleToggleStatus = (id: string, isSuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${isSuspended ? "activate" : "suspend"} this account?`))
      return;

    startTransition(async () => {
      const result = await updateUserStatus(id, !isSuspended);
      if (result.success) {
        alert(result.message);
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  const handleToggleRole = (id: string, currentRole: UserRole) => {
    const nextRole = currentRole === "BUSINESS_OWNER" ? "SUPER_ADMIN" : "BUSINESS_OWNER";
    if (!confirm(`Are you sure you want to promote/demote this account to "${nextRole}"?`)) return;

    startTransition(async () => {
      const result = await updateUserRole(id, nextRole);
      if (result.success) {
        alert(result.message);
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  const handleDeleteUser = (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) return;

    startTransition(async () => {
      const result = await deleteUser(id);
      if (result.success) {
        alert(result.message);
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  // Client search filter
  const filteredUsers = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Search Input bar */}
      <div className="p-4 bg-card border border-border rounded-xl shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs outline-none bg-transparent"
        />
      </div>

      {/* Users table */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          User Directory Registry
        </h2>

        {filteredUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No users match your search query.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Role Group</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Moderator Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filteredUsers.map((user) => {
                  const isSelf = user._id === currentUserId;
                  return (
                    <tr key={user._id} className="hover:bg-secondary/15 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground truncate max-w-xs">
                        {user.email}{" "}
                        {isSelf && (
                          <span className="text-[9px] bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded-full ml-1.5 uppercase">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {user.role === "SUPER_ADMIN" ? (
                          <span className="text-blue-500 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Admin
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            User
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            user.isSuspended
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200",
                          )}
                        >
                          {user.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Role Toggle button */}
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleRole(user._id, user.role)}
                              disabled={isPending}
                              className="h-8 px-2.5 rounded-md border border-border bg-transparent text-[10px] font-bold hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
                              title="Toggle admin/user role status"
                            >
                              Toggle Role
                            </button>
                          )}

                          {/* Suspend Toggle button */}
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleStatus(user._id, user.isSuspended)}
                              disabled={isPending}
                              className={cn(
                                "p-1.5 rounded-md border transition-colors cursor-pointer disabled:opacity-50",
                                user.isSuspended
                                  ? "border-green-200 bg-green-50/20 text-green-600 hover:bg-green-600 hover:text-white"
                                  : "border-red-200 bg-red-50/20 text-red-600 hover:bg-red-600 hover:text-white",
                              )}
                              title={user.isSuspended ? "Activate User" : "Suspend User"}
                            >
                              {user.isSuspended ? (
                                <UserCheck className="w-4 h-4" />
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Delete user button */}
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={isPending}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default UsersManager;
