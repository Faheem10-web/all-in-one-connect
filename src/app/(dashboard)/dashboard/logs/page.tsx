import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import ActivityLog from "@/lib/models/activity-log";
import { History } from "lucide-react";

export default async function LogsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectToDatabase();

  const logs = await ActivityLog.find({
    userId: session.user.id,
  }).sort({ createdAt: -1 });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Activity Audits</h1>
        <p className="text-sm text-muted-foreground">
          Review modifications, logins, QR downloads, and profile transactions logs
        </p>
      </div>

      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4" /> Activity History Logs
        </h2>

        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No activity audits registered yet. Carry out actions to record telemetry logs.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Operation / Event</th>
                  <th className="py-2.5 px-3">Transaction Details</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {logs.map((log) => (
                  <tr key={log._id.toString()} className="hover:bg-secondary/15 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground capitalize">
                      {log.action.replace("_", " ")}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground font-medium">
                      {new Date(log.createdAt).toLocaleString()}
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
