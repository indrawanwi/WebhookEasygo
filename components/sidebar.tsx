"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListFilter,
  AlertTriangle,
  Truck,
  Send,
  Settings,
  Radio,
  X
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Logs", href: "/logs", icon: ListFilter },
    { name: "Active Alarms", href: "/alarms", icon: AlertTriangle },
    { name: "Vehicles", href: "/vehicles", icon: Truck },
    { name: "Webhook Tester", href: "/tester", icon: Send },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r bg-[var(--card-bg)] border-[var(--border-color)] transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--border-color)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold border border-blue-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-[var(--foreground)]">H2H Listener</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">DO Reply Monitor</p>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg lg:hidden text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <Icon className={clsx("w-4 h-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Status Footnote */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Webhook Engine</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Production Ready</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
