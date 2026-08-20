"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X
} from "lucide-react";
import { WebhookLogItem } from "@/lib/types";
import { getStatusBadgeVariant, getTypeBadgeVariant, STATUS_DO } from "@/lib/status";
import { formatDate } from "@/lib/dates";

export default function LogsPage() {
  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });

      if (search) params.set("search", search);
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      if (vehicle) params.set("vehicle", vehicle);

      const res = await fetch(`/api/logs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, type, status, vehicle]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const clearFilters = () => {
    setSearch("");
    setType("");
    setStatus("");
    setVehicle("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Webhook Logs
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Complete historical audit trail of incoming H2H DO webhooks ({total} total records).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer select-none border border-[var(--border-color)] px-3 py-2 rounded-xl bg-[var(--card-bg)]">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Auto Refresh (5s)</span>
          </label>

          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : "text-zinc-500"}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bento-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search box (Span 4 cols) */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search DO ID, No DO, SJ, Vehicle, Event..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-blue-500 focus:bg-[var(--card-bg)] outline-none transition-colors"
            />
          </div>

          {/* Type Filter (Span 3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-blue-500 focus:bg-[var(--card-bg)] outline-none transition-colors text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Tipe Data</option>
              <option value="UPDATE_STATUS">UPDATE_STATUS</option>
              <option value="ALARM">ALARM</option>
              <option value="EVENT">EVENT</option>
              <option value="UPDATE_INFO">UPDATE_INFO</option>
            </select>
          </div>

          {/* Status DO Filter (Span 3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-blue-500 focus:bg-[var(--card-bg)] outline-none transition-colors text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Status DO</option>
              {Object.entries(STATUS_DO).map(([code, name]) => (
                <option key={code} value={code}>
                  [{code}] {name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear button (Span 2 cols) */}
          <div className="lg:col-span-2 flex items-center justify-end">
            {(search || type || status || vehicle) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors w-full sm:w-auto justify-center"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">DO ID</th>
                <th className="py-3 px-4">No DO</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Detail</th>
                <th className="py-3 px-4 text-right">Distance</th>
                <th className="py-3 px-4 text-right">Temp</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={10} className="py-4 px-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                    No webhook logs match your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const statusVariant = getStatusBadgeVariant(log.status_do, log.ket_status_do);
                  const typeVariant = getTypeBadgeVariant(log.tipe_data);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        {formatDate(log.event_time || log.received_at, "—", "HH:mm:ss")}
                        <span className="block text-[10px] text-zinc-400">
                          {formatDate(log.event_time || log.received_at, "—", "dd MMM")}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {log.do_id ? `#${log.do_id}` : "—"}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-[var(--foreground)] whitespace-nowrap">
                        {log.no_do || "—"}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                        {log.nopol || "—"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${statusVariant.bg} ${statusVariant.text} ${statusVariant.border}`}
                        >
                          {log.ket_status_do || `Status ${log.status_do}`}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeVariant.bg} ${typeVariant.text} ${typeVariant.border}`}
                        >
                          {log.tipe_data || "—"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300 max-w-[180px] truncate">
                        {log.ket_tipe_data || log.ket_status_do || "—"}
                      </td>

                      <td className="py-3 px-4 font-mono text-right text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {typeof log.distance_km === "number"
                          ? `${log.distance_km.toFixed(1)} km`
                          : "—"}
                      </td>

                      <td className="py-3 px-4 font-mono text-right text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {typeof log.temperature === "number"
                          ? `${log.temperature.toFixed(1)}°C`
                          : "—"}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Link
                          href={`/logs/${log.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)] bg-zinc-50/30 dark:bg-zinc-900/30 text-xs">
          <div className="text-zinc-500">
            Showing Page <span className="font-bold text-[var(--foreground)]">{page}</span> of{" "}
            <span className="font-bold text-[var(--foreground)]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-[var(--border-color)] disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-[var(--border-color)] disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
