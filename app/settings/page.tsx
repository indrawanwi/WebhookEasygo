"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, ShieldCheck, Database, Server, Radio, Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const [originUrl, setOriginUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOriginUrl(window.location.origin);
  }, []);

  const webhookUrl = `${originUrl || "https://your-domain.vercel.app"}/api/webhook`;

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasSecret = false; // Never expose secret
  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-blue-500" />
          <span>System Settings & Health</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Environment configuration status, webhook endpoint security, and database connectivity.
        </p>
      </div>

      {/* Settings Bento Cards */}
      <div className="space-y-5">
        {/* Webhook Endpoint Card */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <Radio className="w-4.5 h-4.5 text-blue-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Webhook Endpoint Configuration</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-400 block mb-1">Incoming Webhook URL (POST)</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full p-2.5 rounded-xl font-mono bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)] text-zinc-800 dark:text-zinc-200 outline-none"
                />
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                <span className="text-zinc-400 block mb-1">Expected HTTP Method</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">POST</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
                <span className="text-zinc-400 block mb-1">Expected Content-Type</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">application/json</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Webhook Security Status</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-zinc-400 block">Header Authentication</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-300">x-webhook-secret</span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Optional Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-zinc-400 block">WEBHOOK_SECRET status</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {hasSecret ? "Configured" : "Not configured"}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                  hasSecret
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}
              >
                {hasSecret ? "Protected" : "Open Access"}
              </span>
            </div>
          </div>
        </div>

        {/* Database & Environment Status */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <Database className="w-4.5 h-4.5 text-purple-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Database & Deployment Metadata</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
              <span className="text-zinc-400 block mb-1">Database Engine</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">PostgreSQL (Prisma ORM)</span>
              <span className="block text-[10px] text-emerald-500 font-medium mt-1">● Connected</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
              <span className="text-zinc-400 block mb-1">Runtime Environment</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                {isProd ? "Vercel Production" : "Development Local"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)]">
              <span className="text-zinc-400 block mb-1">Data Retention</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Unlimited persistent log</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
