import { JourneyInfo } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { MapPin, Navigation, Clock, Gauge, Car, SquareParking, Hourglass } from "lucide-react";

interface JourneyAnalyticsProps {
  infoAsalComplete: JourneyInfo | null;
  infoAsalTujuan: JourneyInfo | null;
  infoTujuanAsal: JourneyInfo | null;
}

export function JourneyAnalytics({
  infoAsalComplete,
  infoAsalTujuan,
  infoTujuanAsal,
}: JourneyAnalyticsProps) {
  const cards = [
    {
      title: "Origin → Complete",
      subtitle: "Full lifecycle metric",
      data: infoAsalComplete,
      icon: MapPin,
      accentColor: "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Origin → Destination",
      subtitle: "Outbound transit metric",
      data: infoAsalTujuan,
      icon: Navigation,
      accentColor: "border-sky-500/20 text-sky-600 dark:text-sky-400 bg-sky-500/10",
    },
    {
      title: "Destination → Origin",
      subtitle: "Return leg metric",
      data: infoTujuanAsal,
      icon: MapPin,
      accentColor: "border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const info = card.data;

        return (
          <div key={idx} className="bento-card p-5 flex flex-col justify-between space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">{card.title}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-xl border ${card.accentColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Total Distance Metric */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-zinc-400" /> Total KM
              </span>
              <span className="text-base font-bold tabular-nums text-[var(--foreground)]">
                {info?.total_km !== null && info?.total_km !== undefined ? `${info.total_km.toFixed(1)} km` : "—"}
              </span>
            </div>

            {/* Duration metrics breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-dashed border-[var(--border-color)]">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> Total Duration
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  {info?.durasi?.text || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-dashed border-[var(--border-color)]">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-500" /> Driving
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {info?.durasi_driving?.text || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-dashed border-[var(--border-color)]">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <SquareParking className="w-3.5 h-3.5 text-amber-500" /> Parking
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {info?.durasi_parking?.text || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5 text-purple-500" /> Idle
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {info?.durasi_idle?.text || "—"}
                </span>
              </div>
            </div>

            {/* Time windows */}
            <div className="pt-2 border-t border-[var(--border-color)] grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-400 block">Start</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatDate(info?.start_time, "—", "dd MMM, HH:mm")}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Stop</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatDate(info?.stop_time, "—", "dd MMM, HH:mm")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
