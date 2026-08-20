"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Package,
  Clock,
  Gauge,
  Thermometer,
  MapPin,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Navigation,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { WebhookLogItem } from "@/lib/types";
import { getStatusBadgeVariant, getTypeBadgeVariant, getAlarmDirectionVariant } from "@/lib/status";
import { formatDate } from "@/lib/dates";
import { JsonViewer } from "@/components/json-viewer";
import { JourneyAnalytics } from "@/components/journey-analytics";
import { Timeline } from "@/components/timeline";
import { EventMap } from "@/components/map/event-map";

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [log, setLog] = useState<WebhookLogItem | null>(null);
  const [relatedLogs, setRelatedLogs] = useState<WebhookLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "journey" | "location" | "json">("overview");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/logs/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setLog(data.data);

          // Fetch related logs with same do_id for vertical timeline
          if (data.data.do_id) {
            const relRes = await fetch(`/api/logs?do_id=${data.data.do_id}&limit=50`);
            const relData = await relRes.json();
            if (relData.success) {
              setRelatedLogs(relData.logs);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load log detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-500">Loading delivery order telemetry...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Log Entry Not Found</h2>
        <p className="text-sm text-zinc-500">The requested webhook record does not exist or has been archived.</p>
        <Link
          href="/logs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Logs
        </Link>
      </div>
    );
  }

  const payload: any = log.payload_json || {};
  const statusVariant = getStatusBadgeVariant(log.status_do, log.ket_status_do);
  const typeVariant = getTypeBadgeVariant(log.tipe_data);

  // Extract Map coordinates if available in event or alarm
  const mapLat = payload?.even?.lat ?? payload?.alarm?.lat ?? null;
  const mapLon = payload?.even?.lon ?? payload?.alarm?.lon ?? null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/logs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Logs Audit</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
              DO #{log.do_id || "Unspecified"}
            </h1>
            <span className="font-mono text-base font-semibold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-[var(--border-color)]">
              {log.nopol || "No Plate"}
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Received at {formatDate(log.received_at)} · Event time: {formatDate(log.event_time)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${statusVariant.bg} ${statusVariant.text} ${statusVariant.border}`}
          >
            {log.ket_status_do || `Status ${log.status_do}`}
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${typeVariant.bg} ${typeVariant.text} ${typeVariant.border}`}
          >
            {log.tipe_data}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/60 border border-[var(--border-color)] text-xs font-medium w-fit">
        {[
          { id: "overview", label: "Overview" },
          { id: "journey", label: "Journey & Analytics" },
          { id: "location", label: "Location & Origin/Destination" },
          { id: "json", label: "Raw JSON Viewer" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-[var(--card-bg)] text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (Shipment & Journey Key Cards) - 7 cols */}
          <div className="lg:col-span-7 space-y-5">
            {/* Bento: Shipment Summary */}
            <div className="bento-card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
                <Package className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Shipment Information</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 block mb-0.5">DO ID</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{log.do_id || "—"}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">No DO</span>
                  <span className="font-mono font-semibold text-[var(--foreground)]">{log.no_do || "—"}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">No Surat Jalan (SJ)</span>
                  <span className="font-mono font-semibold text-[var(--foreground)]">{log.no_sj || "—"}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Vehicle Nopol</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{log.nopol || "—"}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Status Code</span>
                  <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">{log.status_do ?? "—"}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Status Detail</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{log.ket_status_do || "—"}</span>
                </div>
              </div>
            </div>

            {/* Bento: Telemetry Snapshot */}
            <div className="bento-card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
                <Gauge className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Telemetry & Environment</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                  <span className="text-zinc-400 block mb-1 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-sky-500" /> Distance
                  </span>
                  <span className="text-base font-bold font-tabular text-[var(--foreground)]">
                    {typeof log.distance_km === "number" ? `${log.distance_km.toFixed(1)} km` : "—"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                  <span className="text-zinc-400 block mb-1 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" /> Temp #1
                  </span>
                  <span className="text-base font-bold font-tabular text-[var(--foreground)]">
                    {typeof log.temperature === "number" ? `${log.temperature.toFixed(1)}°C` : "—"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                  <span className="text-zinc-400 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" /> Event Time
                  </span>
                  <span className="text-xs font-semibold font-mono text-zinc-700 dark:text-zinc-300">
                    {formatDate(log.event_time, "—", "HH:mm:ss")}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                  <span className="text-zinc-400 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Received At
                  </span>
                  <span className="text-xs font-semibold font-mono text-zinc-700 dark:text-zinc-300">
                    {formatDate(log.received_at, "—", "HH:mm:ss")}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Event Box (if present) */}
            {payload.even && (
              <div className="bento-card p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Current Telemetry Event</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                    even
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block">Event Name</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.even?.eventNm || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Geofence Name</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.even?.geo_nm || "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block">Location Address</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{payload.even?.addr || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Coordinates (Lat, Lon)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      {typeof payload.even?.lat === "number" && typeof payload.even?.lon === "number"
                        ? `${payload.even.lat.toFixed(5)}, ${payload.even.lon.toFixed(5)}`
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Odometer</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      {payload.even?.odometer ? `${payload.even.odometer} km` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Alarm Box (if present) */}
            {payload.alarm && (
              <div className="bento-card p-5 space-y-3 border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10">
                <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Alarm Alert Triggered</h3>
                  </div>
                  {(() => {
                    const dir = getAlarmDirectionVariant(payload.direction_status);
                    return (
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${dir.bg} ${dir.text} ${dir.border}`}>
                        {dir.label} · {dir.status}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block">Alarm Type</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{payload.alarm?.eventNm || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Geofence Area</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.alarm?.geo_nm || "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block">Address</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{payload.alarm?.addr || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Start Time</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.alarm?.start_time)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Stop Time</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.alarm?.stop_time)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Duration</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.alarm?.duration?.text || "—"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Map + Vertical Timeline) - 5 cols */}
          <div className="lg:col-span-5 space-y-5">
            {/* Map View */}
            {mapLat !== null && mapLon !== null ? (
              <div className="bento-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Event Location Map</h3>
                </div>
                <EventMap
                  lat={Number(mapLat)}
                  lon={Number(mapLon)}
                  vehicle={log.nopol}
                  eventName={payload.even?.eventNm || payload.alarm?.eventNm || log.ket_status_do}
                  address={payload.even?.addr || payload.alarm?.addr || "Location"}
                  height="260px"
                />
              </div>
            ) : (
              <div className="bento-card p-6 text-center text-xs text-zinc-400">
                No GPS coordinates available in this specific payload to plot on map.
              </div>
            )}

            {/* Vertical Timeline for this DO */}
            <div className="bento-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-[var(--foreground)]">DO Event Timeline</h3>
                </div>
                <span className="text-xs text-zinc-400">{relatedLogs.length} events</span>
              </div>
              <Timeline logs={relatedLogs.length > 0 ? relatedLogs : [log]} currentLogId={log.id} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOURNEY ANALYTICS */}
      {activeTab === "journey" && (
        <div className="space-y-6">
          <JourneyAnalytics
            infoAsalComplete={payload.info_asal_complete}
            infoAsalTujuan={payload.info_asal_tujuan}
            infoTujuanAsal={payload.info_tujuan_asal}
          />
        </div>
      )}

      {/* TAB 3: LOCATION (ORIGIN & DESTINATION) */}
      {activeTab === "location" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Origin / Asal Bento */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-purple-500" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Origin / Asal DO</h3>
              </div>
              {payload.asal ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  Recorded
                </span>
              ) : (
                <span className="text-xs text-zinc-400">Not Available</span>
              )}
            </div>

            {payload.asal ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 block">Geofence Name</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.asal?.geo_nm || "—"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block">Geo Code</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{payload.asal?.geo_code || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Geo ID</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{payload.asal?.geo_id ?? "—"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-[var(--border-color)] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block">Arrival (Masuk)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.asal?.tgl_masuk)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Departure (Keluar)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.asal?.tgl_keluar)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block flex items-center gap-1">
                      <Unlock className="w-3 h-3 text-amber-500" /> Unlock Time
                    </span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.asal?.tgl_unlock)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" /> Lock Time
                    </span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.asal?.tgl_lock)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)]">
                  <span className="text-zinc-400 block">Duration in Origin</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.asal?.duration?.text || "—"}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">No origin data in this payload.</div>
            )}
          </div>

          {/* Destination / Tujuan Bento */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Navigation className="w-4.5 h-4.5 text-emerald-500" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Destination / Tujuan DO</h3>
              </div>
              {payload.tujuan ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Recorded
                </span>
              ) : (
                <span className="text-xs text-zinc-400">Not Available</span>
              )}
            </div>

            {payload.tujuan ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 block">Geofence Name</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.tujuan?.geo_nm || "—"}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block">Complete Status</span>
                    <span className="font-semibold flex items-center gap-1 mt-0.5">
                      {payload.tujuan?.Complete ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Complete</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400">In-Progress</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Surat Jalan</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{payload.tujuan?.no_sj || "—"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-[var(--border-color)] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block">Arrival (Masuk)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.tujuan?.tgl_masuk)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Departure (Keluar)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.tujuan?.tgl_keluar)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block">Start Unloading (Bongkar)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.tujuan?.start_bongkar)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Finish Unloading</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatDate(payload.tujuan?.selesai_bongkar)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block">Duration in Destination</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{payload.tujuan?.duration?.text || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Auth RFID</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{payload.tujuan?.auth_rfid || "—"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">No destination data in this payload.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RAW JSON */}
      {activeTab === "json" && (
        <div className="space-y-4">
          <JsonViewer data={payload} initialExpandedDepth={4} />
        </div>
      )}
    </div>
  );
}
