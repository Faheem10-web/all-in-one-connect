import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Notification from "@/lib/models/notification";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { getSessionUserId } from "@/utils/session";
import React from "react";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectToDatabase();

  const userId = await getSessionUserId(session);

  const notifications = await Notification.find({
    userId,
  }).sort({ createdAt: -1 });

  // Serialize notifications array
  const serializedNotifications = notifications.map((n) => ({
    _id: n._id.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    readStatus: n.readStatus,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay updated with system changes, verified statuses, and scan warnings
        </p>
      </div>

      <NotificationsList notifications={serializedNotifications} />
    </div>
  );
}
