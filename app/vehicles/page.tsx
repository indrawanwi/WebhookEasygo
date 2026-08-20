"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Gauge, Thermometer, Clock, ArrowRight, Activity, Search } from "lucide-react";
import { WebhookLogItem } from "@/lib/types";
import { getStatusBadgeVariant } from "@/lib/status";
import { formatDate } from "@/lib/dates";

interface VehicleSummary {
  nopol: string;
  lastDO: string | number | null;
  lastStatus: string | null;
  lastStatusCode: number | null;
  lastEvent: string | null;
  lastSeen: string;
  lastDistance: number | null;
  lastTemp: number | null;
  totalLogs: number;
  latestLogId: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/logs?limit=1000");
        const data = await res.json();
        if (data.success && data.logs) {
          const logs: WebhookLogItem[] = data.logs;
          const vehicleMap = new Map<string, WebhookLogItem[]>();

          logs.forEach((log) => {
            if (log.nopol) {
              const list = vehicleMap.get(log.nopol) || [];
              list.push(log);
              vehicleMap.set(log.nopol, list);
            }
          });

          const summaries: VehicleSummary[] = Array.from(vehicleMap.entries()).map(
            ([nopol, vLogs]) => {
              // Sort newest first
              vLogs.sort(
                (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
              );
              const latest = vLogs[0];

              return {
                nopol,
                lastDO: latest.no_do || latest.do_id || "N/A",
                lastStatus: latest.ket_status_do || `Status ${latest.status_do}`,
                lastStatusCode: latest.status_do,
                lastEvent: latest.ket_tipe_data || latest.tipe_data,
                lastSeen: latest.event_time || latest.received_at,
                lastDistance: latest.distance_km,
                lastTemp: latest.temperature,
                totalLogs: vLogs.length,
                latestLogId: latest.id,
              };
            }
          );

          setVehicles(summaries);
        }
      } catch (err) {
        console.error("Failed to load vehicle catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter((v) =>
    v.nopol.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-purple-500" />
            <span>Vehicle Fleet Catalog</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Active transport units transmitting telemetry webhooks ({vehicles.length} vehicles registered).
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nopol..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)] outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bento-card p-5 h-44 animate-pulse bg-zinc-200/50 dark:bg-zinc-900/50"></div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center bento-card space-y-2">
            <Truck className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-[var(--foreground)]">No Vehicles Match</h3>
            <p className="text-xs text-zinc-500">No vehicles match your search filter.</p>
          </div>
        ) : (
          filtered.map((v) => {
            const statusVariant = getStatusBadgeVariant(v.lastStatusCode, v.lastStatus);

            return (
              <div key={v.nopol} className="bento-card p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                      <Truck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-mono text-[var(--foreground)]">{v.nopol}</h3>
                      <p className="text-[11px] text-zinc-400">{v.totalLogs} events recorded</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${statusVariant.bg} ${statusVariant.text} ${statusVariant.border}`}
                  >
                    {v.lastStatus}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Last DO</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{v.lastDO}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-sky-500" /> Last Event
                    </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{v.lastEvent}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" /> Last Seen
                    </span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-300">{formatDate(v.lastSeen)}</span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-[var(--border-color)] grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                      <span className="text-[10px] text-zinc-400 block">Distance</span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {v.lastDistance !== null ? `${v.lastDistance.toFixed(1)} km` : "—"}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                      <span className="text-[10px] text-zinc-400 block">Temp</span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {v.lastTemp !== null ? `${v.lastTemp.toFixed(1)}°C` : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] text-right">
                  <Link
                    href={`/vehicles/${encodeURIComponent(v.nopol)}`}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Vehicle History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
