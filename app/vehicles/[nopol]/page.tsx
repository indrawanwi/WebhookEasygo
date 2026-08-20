"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Truck, Activity, AlertTriangle, Gauge, Thermometer, Clock } from "lucide-react";
import { WebhookLogItem } from "@/lib/types";
import { getStatusBadgeVariant, getTypeBadgeVariant } from "@/lib/status";
import { formatDate } from "@/lib/dates";
import { Timeline } from "@/components/timeline";

export default function VehicleDetailPage({ params }: { params: Promise<{ nopol: string }> }) {
  const { nopol: rawNopol } = use(params);
  const nopol = decodeURIComponent(rawNopol);
  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicleLogs() {
      try {
        const res = await fetch(`/api/logs?vehicle=${encodeURIComponent(nopol)}&limit=500`);
        const data = await res.json();
        if (data.success && data.logs) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error("Failed to load vehicle telemetry history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicleLogs();
  }, [nopol]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-500">Loading vehicle fleet history...</p>
      </div>
    );
  }

  const latestLog = logs[0];
  const totalAlarms = logs.filter((l) => l.tipe_data === "ALARM").length;

  return (
    <div className="space-y-6">
      {/* Back link */}
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
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold font-mono tracking-tight text-[var(--foreground)]">
                {nopol}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {logs.length} Total Telemetry Logs
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Vehicle telemetry stream & historical delivery order timeline.
            </p>
          </div>
        </div>

        {latestLog && (
          <div className="flex items-center gap-2">
            {(() => {
              const statusVariant = getStatusBadgeVariant(latestLog.status_do, latestLog.ket_status_do);
              return (
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${statusVariant.bg} ${statusVariant.text} ${statusVariant.border}`}
                >
                  Latest: {latestLog.ket_status_do || `Status ${latestLog.status_do}`}
                </span>
              );
            })()}
          </div>
        )}
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-4">
          <span className="text-xs text-zinc-400 block mb-1">Total Telemetry Logs</span>
          <span className="text-2xl font-extrabold font-tabular text-[var(--foreground)]">{logs.length}</span>
        </div>
        <div className="bento-card p-4">
          <span className="text-xs text-zinc-400 block mb-1">Alarm Triggers</span>
          <span className="text-2xl font-extrabold font-tabular text-rose-500">{totalAlarms}</span>
        </div>
        <div className="bento-card p-4">
          <span className="text-xs text-zinc-400 block mb-1">Latest Odometer / Distance</span>
          <span className="text-2xl font-extrabold font-tabular text-[var(--foreground)]">
            {latestLog?.distance_km !== null && latestLog?.distance_km !== undefined
              ? `${latestLog.distance_km.toFixed(1)} km`
              : "—"}
          </span>
        </div>
        <div className="bento-card p-4">
          <span className="text-xs text-zinc-400 block mb-1">Latest Temperature</span>
          <span className="text-2xl font-extrabold font-tabular text-[var(--foreground)]">
            {latestLog?.temperature !== null && latestLog?.temperature !== undefined
              ? `${latestLog.temperature.toFixed(1)}°C`
              : "—"}
          </span>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-[var(--foreground)]">Vehicle Event History</h2>
          </div>
          <span className="text-xs text-zinc-400">{logs.length} records</span>
        </div>

        <Timeline logs={logs} />
      </div>
    </div>
  );
}
