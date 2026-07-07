"use client";

import { Smartphone, Laptop, Tablet, Globe, Compass, Clock } from "lucide-react";

// We'll install date-fns if not present, wait, date-fns is standard but we can format manually to prevent missing deps.
// Let's write a simple formatting helper to prevent any package issues:
const timeAgo = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch (e) {
    return "Recently";
  }
};

interface AnalyticsDashboardProps {
  devices: Array<{ _id: string; count: number }>;
  browsers: Array<{ _id: string; count: number }>;
  countries: Array<{ _id: string; count: number }>;
  recentScans: Array<{
    _id: string;
    deviceType: string;
    browser: string;
    os: string;
    country: string;
    city: string;
    createdAt: string;
  }>;
}

export function AnalyticsDashboard({
  devices,
  browsers,
  countries,
  recentScans,
}: AnalyticsDashboardProps) {
  // Calculate total counts
  const totalScans = recentScans.length;

  return (
    <div className="space-y-6">
      {/* 3-Column Charts Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Types Card */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Devices Used
          </h3>

          {devices.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No scan data registered
            </p>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const Icon =
                  device._id === "MOBILE" ? Smartphone : device._id === "TABLET" ? Tablet : Laptop;
                return (
                  <div
                    key={device._id}
                    className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground capitalize">
                        {device._id.toLowerCase()}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{device.count} scans</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browsers Card */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4" /> Top Browsers
          </h3>

          {browsers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No browser logs found</p>
          ) : (
            <div className="space-y-3">
              {browsers.map((browser) => (
                <div
                  key={browser._id}
                  className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0"
                >
                  <span className="text-xs font-semibold text-foreground">
                    {browser._id || "Unknown"}
                  </span>
                  <span className="text-xs font-bold text-foreground">{browser.count} scans</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Geography Card */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4" /> Top Countries
          </h3>

          {countries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No geographic records</p>
          ) : (
            <div className="space-y-3">
              {countries.map((country) => (
                <div
                  key={country._id}
                  className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0"
                >
                  <span className="text-xs font-semibold text-foreground">
                    {country._id || "Unknown"}
                  </span>
                  <span className="text-xs font-bold text-foreground">{country.count} scans</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Scan Logs Table */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Scan Activities
        </h3>

        {recentScans.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-12">
            No QR scan actions registered yet. Share your QR to start collecting metrics.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Browser & OS</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {recentScans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-secondary/15 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground capitalize">
                      {scan.deviceType.toLowerCase()}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {scan.browser} / {scan.os}
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">
                      {scan.city}, {scan.country}
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground">
                      {timeAgo(scan.createdAt)}
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
export default AnalyticsDashboard;
