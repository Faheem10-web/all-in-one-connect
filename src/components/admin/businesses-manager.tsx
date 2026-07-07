"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, CheckCircle2, AlertTriangle, UserX, ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

interface BusinessItem {
  _id: string;
  name: string;
  category: string;
  businessSlug: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  createdAt: string;
}

interface BusinessesManagerProps {
  businesses: BusinessItem[];
}

export function BusinessesManager({ businesses }: BusinessesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search input state
  const [search, setSearch] = useState("");
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const handleUpdateStatus = (id: string, status: "PENDING" | "APPROVED" | "SUSPENDED") => {
    if (status === "SUSPENDED" && !confirm("Are you sure you want to suspend this profile?"))
      return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/admin/businesses/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        const result = await response.json();
        if (result.success) {
          alert(`Business profile status modified to "${status}" successfully!`);
          router.refresh();
        } else {
          alert(result.error?.message || "Failed to update profile verification status.");
        }
      } catch (err) {
        console.error("Status update error:", err);
      }
    });
  };

  // Client search and filter logic
  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search Input bar + Filter dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 p-4 bg-card border border-border rounded-xl shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search businesses by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs outline-none bg-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-full px-3 border border-border rounded-xl bg-card text-xs font-semibold text-foreground cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Audits</option>
          <option value="APPROVED">Approved Active</option>
          <option value="SUSPENDED">Suspended Profiles</option>
        </select>
      </div>

      {/* Businesses table */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Business Profiles Queue
        </h2>

        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No business records match your query filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Business Profile Details</th>
                  <th className="py-3 px-4">Category Group</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Creation Date</th>
                  <th className="py-3 px-4 text-right">Moderator Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-secondary/15 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        {b.name}
                        <Link
                          href={`/${b.businessSlug}`}
                          target="_blank"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{b.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 w-fit",
                          b.status === "APPROVED"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : b.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        {b.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                        {b.status === "PENDING" && <AlertTriangle className="w-3 h-3" />}
                        {b.status === "SUSPENDED" && <UserX className="w-3 h-3" />}
                        {b.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status !== "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, "APPROVED")}
                            disabled={isPending}
                            className="h-8 px-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}

                        {b.status !== "SUSPENDED" && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, "SUSPENDED")}
                            disabled={isPending}
                            className="h-8 px-3 rounded-md bg-destructive/10 hover:bg-destructive hover:text-white text-destructive font-semibold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}

                        {b.status !== "PENDING" && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, "PENDING")}
                            disabled={isPending}
                            className="h-8 px-3 rounded-md border border-border bg-transparent text-foreground hover:bg-secondary font-semibold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Reset Pending
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default BusinessesManager;
