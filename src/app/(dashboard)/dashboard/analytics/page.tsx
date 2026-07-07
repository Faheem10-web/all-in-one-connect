import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import Analytics from "@/lib/models/analytics";
import { getSessionUserId } from "@/utils/session";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import React from "react";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectToDatabase();

  const userId = await getSessionUserId(session);

  const business = await Business.findOne({
    userId,
    isDeleted: { $ne: true },
  });

  if (!business) {
    redirect("/dashboard");
  }

  // 1. Devices grouping aggregation
  const devicesAgg = await Analytics.aggregate([
    { $match: { businessId: business._id } },
    { $group: { _id: "$deviceType", count: { $sum: 1 } } },
  ]);

  // 2. Browsers grouping aggregation
  const browsersAgg = await Analytics.aggregate([
    { $match: { businessId: business._id } },
    { $group: { _id: "$browser", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // 3. Countries grouping aggregation
  const countriesAgg = await Analytics.aggregate([
    { $match: { businessId: business._id } },
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // 4. Fetch the recent 10 scan logs
  const recent = await Analytics.find({ businessId: business._id })
    .sort({ createdAt: -1 })
    .limit(10);

  // Serialize objects for client hydration safety
  const serializedDevices = devicesAgg.map((d) => ({
    _id: d._id || "Unknown",
    count: d.count,
  }));

  const serializedBrowsers = browsersAgg.map((b) => ({
    _id: b._id || "Unknown",
    count: b.count,
  }));

  const serializedCountries = countriesAgg.map((c) => ({
    _id: c._id || "Unknown",
    count: c.count,
  }));

  const serializedRecent = recent.map((r) => ({
    _id: r._id.toString(),
    deviceType: r.deviceType,
    browser: r.browser || "Unknown",
    os: r.os || "Unknown",
    country: r.country || "Unknown",
    city: r.city || "Unknown",
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Scans Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Monitor scanner behaviors, popular browsers, user devices, and geographic configurations
        </p>
      </div>

      <AnalyticsDashboard
        devices={serializedDevices}
        browsers={serializedBrowsers}
        countries={serializedCountries}
        recentScans={serializedRecent}
      />
    </div>
  );
}
