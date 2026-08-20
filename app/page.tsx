"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radio,
  Copy,
  Check,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Activity,
  Zap,
  Database,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { WebhookLogItem } from "@/lib/types";
import { getStatusBadgeVariant, getTypeBadgeVariant } from "@/lib/status";
import { formatTimeOnly, formatDateOnly } from "@/lib/dates";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totalMessages: number;
    totalDO: number;
    activeAlarms: number;
    completedDO: number;
    messagesToday: number;
  }>({
    totalMessages: 0,
    totalDO: 0,
    activeAlarms: 0,
    completedDO: 0,
    messagesToday: 0,
  });

  const [liveLogs, setLiveLogs] = useState<WebhookLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [originUrl, setOriginUrl] = useState("");

  useEffect(() => {
    setOriginUrl(window.location.origin);
    fetchData();

    // Auto-refresh live stream every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/logs?limit=15").then((r) => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success) setLiveLogs(logsRes.logs);
    } catch (err) {
      console.error("Failed to refresh dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const webhookUrl = `${originUrl || "https://your-domain.vercel.app"}/api/webhook`;

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Overview Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time H2H DO Webhook monitoring and telemetry stream.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : "text-zinc-500"}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/tester"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
          >
            <span>Webhook Tester</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top Bento Grid - 12 Columns Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* Bento 1: Listener Status (Span 4 cols) */}
        <div className="md:col-span-6 lg:col-span-4 bento-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Radio className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Webhook Listener
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Online & Ready
                  </span>
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 border border-[var(--border-color)]">
              application/json
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Endpoint URL</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                POST /api/webhook
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-xs truncate border border-zinc-800 flex items-center justify-between gap-2">
              <span className="truncate">{webhookUrl}</span>
              <button
                onClick={handleCopyEndpoint}
                className="shrink-0 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Copy Endpoint"
              >
                {copiedEndpoint ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bento 2: Messages Today (Span 2 cols) */}
        <div className="md:col-span-3 lg:col-span-2 bento-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Messages Today</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold font-tabular text-[var(--foreground)] tracking-tight">
              {stats.messagesToday.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Total logs: {stats.totalMessages.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bento 3: Active Alarms (Span 2 cols) - Red Emphasis */}
        <div className="md:col-span-3 lg:col-span-2 bento-card p-5 flex flex-col justify-between border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold">Active Alarms</span>
            <div className="p-2 rounded-xl bg-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold font-tabular text-rose-600 dark:text-rose-400 tracking-tight">
              {stats.activeAlarms.toLocaleString()}
            </p>
            <Link
              href="/alarms"
              className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline mt-1 inline-block"
            >
              View Active Alarms →
            </Link>
          </div>
        </div>

        {/* Bento 4: Completed DO (Span 2 cols) - Green Emphasis */}
        <div className="md:col-span-3 lg:col-span-2 bento-card p-5 flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold">Completed DO</span>
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold font-tabular text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.completedDO.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Out of {stats.totalDO} Delivery Orders
            </p>
          </div>
        </div>

        {/* Bento 5: Vehicles (Span 2 cols) */}
        <div className="md:col-span-3 lg:col-span-2 bento-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Unique Vehicles</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold font-tabular text-[var(--foreground)] tracking-tight">
              {stats.totalDO > 0 ? stats.totalDO : "0"}
            </p>
            <Link
              href="/vehicles"
              className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
            >
              Catalog Vehicles →
            </Link>
          </div>
        </div>
      </div>

      {/* Large Bento Card: LIVE EVENT STREAM */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Live Event Stream
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Latest received H2H webhook events in chronological descending order.
              </p>
            </div>
          </div>
          <Link
            href="/logs"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Logs ({stats.totalMessages})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stream List */}
        <div className="divide-y divide-[var(--border-color)]">
          {liveLogs.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              No webhook events received yet. Send a test payload using the Webhook Tester.
            </div>
          ) : (
            liveLogs.map((log) => {
              const statusVariant = getStatusBadgeVariant(log.status_do, log.ket_status_do);
              const isAlarmStart = log.tipe_data === "ALARM" && log.direction_status === "START";

              let EventIcon = Activity;
              if (log.tipe_data === "ALARM") EventIcon = AlertTriangle;
              if (log.tipe_data === "EVENT") EventIcon = Zap;
              if (log.tipe_data === "UPDATE_INFO") EventIcon = Database;

              return (
                <Link
                  key={log.id}
                  href={`/logs/${log.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-3 -mx-3 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 transition-colors gap-3 group"
                >
                  {/* Left: Icon & Vehicle info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105 ${
                        log.tipe_data === "ALARM"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}
                    >
                      <EventIcon className={`w-4 h-4 ${isAlarmStart ? "animate-bounce text-rose-500" : ""}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-[var(--foreground)]">
                          {log.nopol || "N/A"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusVariant.bg} ${statusVariant.text} ${statusVariant.border}`}
                        >
                          {log.ket_status_do || `Status ${log.status_do}`}
                        </span>
                        {isAlarmStart && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        DO: <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{log.no_do || log.do_id || "—"}</span>
                        {log.no_sj && <span> · SJ: {log.no_sj}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: Event Detail & Time */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-[var(--foreground)]">
                        {log.ket_tipe_data || log.ket_status_do || "Telemetry update"}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {log.distance_km !== null ? `${log.distance_km.toFixed(1)} km` : ""}
                        {log.distance_km !== null && log.temperature !== null ? " · " : ""}
                        {log.temperature !== null ? `${log.temperature.toFixed(1)}°C` : ""}
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {formatTimeOnly(log.event_time || log.received_at)}
                      <span className="block text-[10px] text-zinc-400 font-normal">
                        {formatDateOnly(log.event_time || log.received_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
