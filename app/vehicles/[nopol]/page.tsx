"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Truck, Clock, Gauge, Activity } from "lucide-react";
import { WebhookLogItem } from "@/lib/types";
import { Timeline } from "@/components/timeline";
import { formatDate } from "@/lib/dates";

export default function VehicleDetailPage({ params }: { params: Promise<{ nopol: string }> }) {
  const { nopol } = use(params);
  const decodedNopol = decodeURIComponent(nopol);

  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicleHistory() {
      try {
        const res = await fetch(`/api/logs?vehicle=${encodeURIComponent(decodedNopol)}&limit=500`);
        const data = await res.json();
        if (data.success && data.logs) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error("Failed to load vehicle logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicleHistory();
  }, [decodedNopol]);

  const latestLog = logs[0];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Catalog</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-mono tracking-tight text-[var(--foreground)]">
              Vehicle {decodedNopol}
            </h1>
            <p className="text-xs text-zinc-500">
              {logs.length} telemetry event logs recorded across DO lifetime.
            </p>
          </div>
        </div>

        {latestLog && (
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-zinc-400 block">Latest Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {latestLog.ket_status_do || `Status ${latestLog.status_do}`}
              </span>
            </div>
            <div className="text-right border-l border-[var(--border-color)] pl-4">
              <span className="text-zinc-400 block">Last Seen</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">
                {formatDate(latestLog.event_time || latestLog.received_at)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
          <Activity className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Vehicle Telemetry Chronology
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-400">Loading timeline...</div>
        ) : (
          <Timeline logs={logs} />
        )}
      </div>
    </div>
  );
}
