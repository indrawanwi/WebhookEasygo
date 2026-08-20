"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, MapPin, Clock, Truck, ShieldAlert } from "lucide-react";
import { WebhookLogItem } from "@/lib/types";
import { formatDate } from "@/lib/dates";

interface AlarmGroup {
  key: string;
  do_id: number | null;
  nopol: string | null;
  no_do: string | null;
  alarmType: string;
  status: "ACTIVE" | "RESOLVED";
  startTime: string | null;
  stopTime: string | null;
  durationText: string | null;
  locationAddr: string | null;
  geoName: string | null;
  lat: number | null;
  lon: number | null;
  latestLogId: string;
}

export default function ActiveAlarmsPage() {
  const [alarmGroups, setAlarmGroups] = useState<AlarmGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");

  useEffect(() => {
    async function fetchAlarms() {
      try {
        const res = await fetch("/api/logs?type=ALARM&limit=500");
        const data = await res.json();
        if (data.success && data.logs) {
          const logs: WebhookLogItem[] = data.logs;

          // Group by do_id + ket_tipe_data
          const groupsMap = new Map<string, AlarmGroup>();

          // Sort chronological ascending to pair START & STOP correctly
          const sorted = [...logs].sort(
            (a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
          );

          sorted.forEach((log) => {
            const alarmType = log.ket_tipe_data || log.payload_json.alarm?.eventNm || "UNKNOWN ALARM";
            const key = `${log.do_id || "nodo"}_${alarmType}`;

            const existing = groupsMap.get(key);
            const direction = log.direction_status || (log.payload_json.alarm?.stop_time ? "STOP" : "START");

            if (!existing) {
              groupsMap.set(key, {
                key,
                do_id: log.do_id,
                nopol: log.nopol,
                no_do: log.no_do,
                alarmType,
                status: direction === "STOP" ? "RESOLVED" : "ACTIVE",
                startTime: log.payload_json.alarm?.start_time || log.event_time,
                stopTime: log.payload_json.alarm?.stop_time || (direction === "STOP" ? log.event_time : null),
                durationText: log.payload_json.alarm?.duration?.text || null,
                locationAddr: log.payload_json.alarm?.addr || log.payload_json.even?.addr || null,
                geoName: log.payload_json.alarm?.geo_nm || null,
                lat: log.payload_json.alarm?.lat || null,
                lon: log.payload_json.alarm?.lon || null,
                latestLogId: log.id,
              });
            } else {
              // Update status
              if (direction === "STOP") {
                existing.status = "RESOLVED";
                existing.stopTime = log.payload_json.alarm?.stop_time || log.event_time;
                if (log.payload_json.alarm?.duration?.text) {
                  existing.durationText = log.payload_json.alarm.duration.text;
                }
              } else if (direction === "START") {
                existing.status = "ACTIVE";
              }
              existing.latestLogId = log.id;
            }
          });

          // Convert map back to list (newest first)
          const list = Array.from(groupsMap.values()).reverse();
          setAlarmGroups(list);
        }
      } catch (err) {
        console.error("Failed to load alarms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlarms();
  }, []);

  const filteredAlarms = alarmGroups.filter((g) => {
    if (filterStatus === "ACTIVE") return g.status === "ACTIVE";
    if (filterStatus === "RESOLVED") return g.status === "RESOLVED";
    return true;
  });

  const activeCount = alarmGroups.filter((g) => g.status === "ACTIVE").length;
  const resolvedCount = alarmGroups.filter((g) => g.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>Active & Historical Alarms</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time security alerts, idle over-dwells, overspeed, and route deviation monitoring.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-900/60 border border-[var(--border-color)] text-xs font-medium">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === "ALL"
                ? "bg-[var(--card-bg)] text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            All ({alarmGroups.length})
          </button>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filterStatus === "ACTIVE"
                ? "bg-rose-500 text-white font-bold shadow-xs"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active ({activeCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus("RESOLVED")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filterStatus === "RESOLVED"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved ({resolvedCount})</span>
          </button>
        </div>
      </div>

      {/* Alarms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bento-card p-5 h-44 animate-pulse bg-zinc-200/50 dark:bg-zinc-900/50"></div>
          ))
        ) : filteredAlarms.length === 0 ? (
          <div className="col-span-full py-16 text-center bento-card space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-[var(--foreground)]">No Alarms Found</h3>
            <p className="text-xs text-zinc-500">There are no active or matching alarm triggers recorded.</p>
          </div>
        ) : (
          filteredAlarms.map((alarm) => (
            <div
              key={alarm.key}
              className={`bento-card p-5 flex flex-col justify-between space-y-4 border transition-all ${
                alarm.status === "ACTIVE"
                  ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 shadow-xs"
                  : "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    {alarm.status === "ACTIVE" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <span>{alarm.alarmType}</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                    DO #{alarm.do_id || "N/A"} {alarm.no_do ? `(${alarm.no_do})` : ""}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border uppercase ${
                    alarm.status === "ACTIVE"
                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {alarm.status}
                </span>
              </div>

              {/* Body metrics */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-purple-500" /> Vehicle
                  </span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {alarm.nopol || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Started
                  </span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {formatDate(alarm.startTime, "—", "HH:mm:ss")}
                  </span>
                </div>

                {alarm.durationText && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Duration</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {alarm.durationText}
                    </span>
                  </div>
                )}

                {alarm.locationAddr && (
                  <div className="pt-2 border-t border-dashed border-[var(--border-color)]">
                    <span className="text-zinc-400 block flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> Location
                    </span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2">
                      {alarm.geoName ? `${alarm.geoName} - ` : ""}
                      {alarm.locationAddr}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer link */}
              <div className="pt-2 border-t border-[var(--border-color)] text-right">
                <Link
                  href={`/logs/${alarm.latestLogId}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Inspect Log Detail →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
