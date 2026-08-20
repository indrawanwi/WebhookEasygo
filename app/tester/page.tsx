"use client";

import { useState } from "react";
import { Send, Code2, CheckCircle2, AlertTriangle, RefreshCw, Key } from "lucide-react";
import { JsonViewer } from "@/components/json-viewer";

// Sample presets required by prompt
const PRESETS = {
  "Alarm START": {
    do_id: 1088054,
    status_do: 2,
    no_do: "2004914333",
    no_sj: "2005141774",
    ket_status_do: "OTW Tujuan",
    nopol: "F 1234 FC",
    direction_status: "START",
    tipe_data: "ALARM",
    ket_tipe_data: "TUJUAN LAIN",
    distance_km: 198.0,
    current_temperatur1: 0.0,
    even: null,
    alarm: {
      id: 19315,
      eventNm: "TUJUAN LAIN",
      addr: "Jl. Maospati - Solo, Kedunglengki, Pengkol, Mantingan, Ngawi, Jawa Timur 63261",
      lon: 111.20394897460937,
      lat: -7.373449802398682,
      geo_nm: "GUDANG XXI",
      geo_code: "1600930000,0000000160",
      geo_id: 45223,
      start_time: "2026-08-19T13:29:23+07:00",
      stop_time: "2026-08-19T14:31:21+07:00",
      duration: {
        value: 3718.0,
        text: "1 jam, 1 menit"
      }
    },
    asal: null,
    tujuan: null
  },
  "Complete DO": {
    do_id: 1085624,
    nopol: "B 1234 FEU",
    status_do: 8,
    ket_status_do: "Complete - Out Tujuan",
    no_do: "SO-011",
    no_sj: "SJ-99882",
    direction_status: null,
    tipe_data: "UPDATE_STATUS",
    ket_tipe_data: "COMPLETE",
    distance_km: 794.6,
    current_temperatur1: -25.5,
    even: {
      eventNm: "COMPLETE",
      addr: "Kawasan Industri MM2100, Cikarang Barat, Bekasi, Jawa Barat",
      lon: 107.09841,
      lat: -6.29912,
      odometer: 145200,
      geo_nm: "GUDANG UTAMA CIKARANG",
      geo_code: "GEO-MM2100",
      geo_id: 1029,
      tgl_event: "2026-08-19T14:10:10+07:00"
    },
    alarm: null,
    asal: null,
    tujuan: {
      geo_nm: "GUDANG UTAMA CIKARANG",
      geo_code: "GEO-MM2100",
      geo_id: 1029,
      tgl_masuk: "2026-08-19T13:45:00+07:00",
      tgl_keluar: "2026-08-19T14:10:00+07:00",
      tgl_unlock: "2026-08-19T13:50:00+07:00",
      tgl_lock: "2026-08-19T14:05:00+07:00",
      start_bongkar: "2026-08-19T13:52:00+07:00",
      selesai_bongkar: "2026-08-19T14:05:00+07:00",
      duration: { value: 1500, text: "25 menit" },
      no_sj: "SJ-99882",
      Complete: true,
      desc: "Bongkar muatan sukses",
      cust_telegram: "@cust_bekasi",
      cust_email: "logistic@client.com",
      auth_rfid: "RFID-8877",
      lon: "107.09841",
      lat: "-6.29912"
    }
  },
  "Closed InComplete": {
    do_id: 1089900,
    nopol: "B 9911 ABC",
    status_do: 7,
    ket_status_do: "Closed In-Complete",
    no_do: "DO-CLOSE-01",
    no_sj: "SJ-CLOSE-01",
    direction_status: null,
    tipe_data: "UPDATE_STATUS",
    ket_tipe_data: "CLOSED InCOMPLETE",
    distance_km: 120.4,
    current_temperatur1: -15.0,
    even: null,
    alarm: null,
    asal: null,
    tujuan: null
  },
  "Masuk Tujuan": {
    do_id: 1089100,
    nopol: "L 9876 AB",
    status_do: 3,
    ket_status_do: "IN Tujuan",
    no_do: "DO-SURABAYA-88",
    no_sj: "SJ-SUB-102",
    direction_status: null,
    tipe_data: "UPDATE_STATUS",
    ket_tipe_data: "MASUK_TUJUAN",
    distance_km: 45.2,
    current_temperatur1: -20.0,
    even: {
      eventNm: "MASUK_TUJUAN",
      addr: "Jl. Industri Rungkut, Surabaya, Jawa Timur",
      lon: 112.7681,
      lat: -7.3245,
      odometer: 89310,
      geo_nm: "DC SURABAYA RUNGKUT",
      geo_code: "GEO-SUB-RUNGKUT",
      geo_id: 5044,
      tgl_event: "2026-08-19T15:05:00+07:00"
    },
    alarm: null,
    asal: null,
    tujuan: null
  },
  "Keluar Tujuan": {
    do_id: 1089100,
    nopol: "L 9876 AB",
    status_do: 4,
    ket_status_do: "OUT Tujuan",
    no_do: "DO-SURABAYA-88",
    no_sj: "SJ-SUB-102",
    direction_status: null,
    tipe_data: "UPDATE_STATUS",
    ket_tipe_data: "KELUAR_TUJUAN",
    distance_km: 48.0,
    current_temperatur1: -19.5,
    even: {
      eventNm: "KELUAR_TUJUAN",
      addr: "Jl. Industri Rungkut, Surabaya, Jawa Timur",
      lon: 112.7681,
      lat: -7.3245,
      odometer: 89315,
      geo_nm: "DC SURABAYA RUNGKUT",
      geo_code: "GEO-SUB-RUNGKUT",
      geo_id: 5044,
      tgl_event: "2026-08-19T15:30:00+07:00"
    },
    alarm: null,
    asal: null,
    tujuan: null
  },
  "Event": {
    do_id: 1087500,
    nopol: "B 5544 KKL",
    status_do: 2,
    ket_status_do: "OTW Tujuan",
    no_do: "DO-EVENT-99",
    no_sj: "SJ-EVENT-99",
    direction_status: null,
    tipe_data: "EVENT",
    ket_tipe_data: "UNLOCK",
    distance_km: 310.0,
    current_temperatur1: -22.0,
    even: {
      eventNm: "UNLOCK",
      addr: "Rest Area KM 207 Tol Palimanan, Cirebon",
      lon: 108.531,
      lat: -6.742,
      odometer: 112000,
      geo_nm: "REST AREA KM 207",
      geo_code: "GEO-REST-207",
      geo_id: 8812,
      tgl_event: "2026-08-19T16:00:00+07:00"
    },
    alarm: null,
    asal: null,
    tujuan: null
  }
};

export default function WebhookTesterPage() {
  const [jsonText, setJsonText] = useState(JSON.stringify(PRESETS["Alarm START"], null, 2));
  const [secret, setSecret] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{
    status: number | null;
    timeMs: number | null;
    body: any;
  } | null>(null);

  const handleSelectPreset = (name: keyof typeof PRESETS) => {
    setJsonText(JSON.stringify(PRESETS[name], null, 2));
  };

  const handleSend = async () => {
    setSending(true);
    const startTime = performance.now();

    try {
      let parsedBody;
      try {
        parsedBody = JSON.parse(jsonText);
      } catch (e) {
        setResponse({
          status: 400,
          timeMs: 0,
          body: { success: false, error: "Invalid JSON format in text area" }
        });
        setSending(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (secret.trim()) {
        headers["x-webhook-secret"] = secret.trim();
      }

      const res = await fetch("/api/webhook", {
        method: "POST",
        headers,
        body: JSON.stringify(parsedBody)
      });

      const endTime = performance.now();
      const resBody = await res.json();

      setResponse({
        status: res.status,
        timeMs: Math.round(endTime - startTime),
        body: resBody
      });
    } catch (err: any) {
      setResponse({
        status: 500,
        timeMs: 0,
        body: { success: false, error: err.message || "Failed to reach endpoint" }
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
          <Send className="w-6 h-6 text-blue-500" />
          <span>Webhook Tester & Debugger</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Simulate upstream HTTP POST requests to <code className="font-mono text-blue-500 font-semibold">/api/webhook</code> and inspect quick JSON execution.
        </p>
      </div>

      {/* Preset selector bar */}
      <div className="bento-card p-4 space-y-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
          Load Sample Presets:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.keys(PRESETS).map((presetName) => (
            <button
              key={presetName}
              onClick={() => handleSelectPreset(presetName as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[var(--border-color)] bg-zinc-100 dark:bg-zinc-900 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-colors"
            >
              {presetName}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Payload Editor (7 cols) */}
        <div className="lg:col-span-7 bento-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Webhook JSON Payload</h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">POST /api/webhook</span>
            </div>

            {/* Optional secret input */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
              <Key className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Optional x-webhook-secret header..."
                className="w-full bg-transparent text-xs outline-none font-mono text-zinc-700 dark:text-zinc-300"
              />
            </div>

            {/* Textarea */}
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={16}
              className="w-full p-4 rounded-xl font-mono text-xs bg-zinc-950 text-emerald-400 dark:bg-[#0c0c0e] border border-[var(--border-color)] focus:border-blue-500 outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm"
          >
            {sending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending Payload...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Test Payload →</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT: Response Viewer (5 cols) */}
        <div className="lg:col-span-5 bento-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Server Response</h3>
              {response && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-bold ${
                      response.status === 200
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                    }`}
                  >
                    HTTP {response.status}
                  </span>
                  <span className="text-zinc-400">{response.timeMs}ms</span>
                </div>
              )}
            </div>

            {response ? (
              <JsonViewer data={response.body} initialExpandedDepth={3} />
            ) : (
              <div className="py-24 text-center text-xs text-zinc-400 border border-dashed border-[var(--border-color)] rounded-2xl">
                Click <span className="font-semibold text-blue-500">&quot;Send Test Payload&quot;</span> to see HTTP response status and body.
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-[11px] leading-relaxed">
            💡 Requests sent here directly trigger your live <code className="font-mono">/api/webhook</code> endpoint and update the dashboard in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}
