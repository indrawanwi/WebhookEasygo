import { WebhookLogItem } from "@/lib/types";
import { formatTimeOnly, formatDateOnly } from "@/lib/dates";
import { getTypeBadgeVariant, getStatusBadgeVariant } from "@/lib/status";
import { Circle, AlertTriangle, Activity, Zap, Database } from "lucide-react";
import Link from "next/link";

interface TimelineProps {
  logs: WebhookLogItem[];
  currentLogId?: string;
}

export function Timeline({ logs, currentLogId }: TimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No event history found for this Delivery Order.
      </div>
    );
  }

  // Sort logs chronologically ascending (earliest to latest)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-color)]">
      {sortedLogs.map((log) => {
        const isCurrent = log.id === currentLogId;
        const typeVariant = getTypeBadgeVariant(log.tipe_data);
        const statusVariant = getStatusBadgeVariant(log.status_do, log.ket_status_do);

        let EventIcon = Activity;
        if (log.tipe_data === 'ALARM') EventIcon = AlertTriangle;
        if (log.tipe_data === 'EVENT') EventIcon = Zap;
        if (log.tipe_data === 'UPDATE_INFO') EventIcon = Database;

        return (
          <div key={log.id} className="relative flex items-start gap-4 group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-[23px] top-1 flex items-center justify-center w-5 h-5 rounded-full border-2 bg-[var(--card-bg)] transition-transform group-hover:scale-110 ${
                isCurrent
                  ? "border-blue-600 dark:border-blue-400 text-blue-600"
                  : log.tipe_data === "ALARM"
                  ? "border-rose-500 text-rose-500"
                  : "border-zinc-400 dark:border-zinc-600 text-zinc-400"
              }`}
            >
              <Circle className={`w-2 h-2 ${isCurrent ? "fill-blue-600 dark:fill-blue-400" : log.tipe_data === "ALARM" ? "fill-rose-500" : "fill-zinc-400"}`} />
            </div>

            {/* Timeline Item Content Card */}
            <div
              className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                isCurrent
                  ? "border-blue-500/40 bg-blue-500/5 dark:bg-blue-500/10 shadow-xs"
                  : "border-[var(--border-color)] bg-[var(--card-bg)] hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-[var(--foreground)]">
                    {formatTimeOnly(log.event_time || log.received_at)}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    ({formatDateOnly(log.event_time || log.received_at)})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeVariant.bg} ${typeVariant.text} ${typeVariant.border}`}
                  >
                    {log.tipe_data}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                      Selected
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                    <EventIcon className="w-3.5 h-3.5 text-zinc-500" />
                    {log.ket_tipe_data || log.ket_status_do || "Status Event"}
                  </p>
                  {log.nopol && (
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {log.nopol}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${statusVariant.bg} ${statusVariant.text} ${statusVariant.border}`}
                  >
                    {log.ket_status_do || `Status ${log.status_do}`}
                  </span>
                </div>
              </div>

              {log.id !== currentLogId && (
                <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-right">
                  <Link
                    href={`/logs/${log.id}`}
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
