"use client";

import React, { useTransition, useState } from "react";
import { markAsRead, deleteNotification } from "@/features/notifications/actions";
import { useRouter } from "next/navigation";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

interface NotificationsListProps {
  notifications: NotificationItem[];
}

export function NotificationsList({ notifications: initialNotifications }: NotificationsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState(initialNotifications);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      const result = await markAsRead(id);
      if (result.success) {
        setList(list.map((item) => (item._id === id ? { ...item, readStatus: true } : item)));
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteNotification(id);
      if (result.success) {
        setList(list.filter((item) => item._id !== id));
        router.refresh();
      }
    });
  };

  return (
    <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
      <h2 className="text-lg font-bold text-foreground">Alert History</h2>

      {list.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center space-y-2">
          <Bell className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground">
            You don&apos;t have any pending alerts or notifications.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {list.map((item) => (
            <div
              key={item._id}
              className={cn(
                "py-4 flex items-start justify-between gap-4 transition-all duration-150",
                !item.readStatus ? "bg-blue-500/5 px-3 rounded-lg -mx-3" : "",
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                  {!item.readStatus && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.message}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.readStatus && (
                  <button
                    onClick={() => handleMarkRead(item._id)}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default NotificationsList;
