export const STATUS_DO: Record<number, string> = {
  0: "IN Used",
  1: "IN Asal",
  2: "OUT ASAL, OTW Tujuan",
  3: "IN Tujuan",
  4: "OUT Tujuan",
  5: "Alarm",
  7: "Closed In-Complete",
  8: "Complete",
  11: "Closed-In Asal",
  12: "Closed-Out Asal, OTW Tujuan",
  13: "Closed-IN Tujuan",
  14: "Closed-Out Tujuan, OTW Balik",
  31: "Closed-di Tujuan LAIN",
  32: "Closed-Bongkar di Tujuan",
  33: "Closed-Bongkar di Tujuan LAIN",
};

export function getStatusLabel(statusCode: number | null, fallbackText?: string | null): string {
  if (statusCode === null || statusCode === undefined) {
    return fallbackText || "Unknown Status";
  }
  return STATUS_DO[statusCode] || fallbackText || `Status ${statusCode}`;
}

export type BadgeVariant = {
  bg: string;
  text: string;
  border: string;
  dotBg?: string;
};

export function getStatusBadgeVariant(statusCode: number | null, ketStatus?: string | null): BadgeVariant {
  const label = (ketStatus || getStatusLabel(statusCode)).toUpperCase();

  if (statusCode === 8 || label.includes("COMPLETE") && !label.includes("INCOMPLETE")) {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      dotBg: "bg-emerald-500",
    };
  }

  if (statusCode === 5 || label.includes("ALARM")) {
    return {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-500/20 dark:border-rose-500/30",
      dotBg: "bg-rose-500",
    };
  }

  if (label.includes("OTW") || statusCode === 2 || statusCode === 12) {
    return {
      bg: "bg-sky-500/10 dark:bg-sky-500/15",
      text: "text-sky-700 dark:text-sky-400",
      border: "border-sky-500/20 dark:border-sky-500/30",
      dotBg: "bg-sky-500",
    };
  }

  if (statusCode === 1 || statusCode === 3 || label.includes("IN ")) {
    return {
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-500/20 dark:border-purple-500/30",
      dotBg: "bg-purple-500",
    };
  }

  if (statusCode === 7 || label.includes("CLOSED")) {
    return {
      bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
      text: "text-zinc-700 dark:text-zinc-400",
      border: "border-zinc-500/20 dark:border-zinc-500/30",
      dotBg: "bg-zinc-400",
    };
  }

  return {
    bg: "bg-slate-500/10 dark:bg-slate-500/15",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/20 dark:border-slate-500/30",
    dotBg: "bg-slate-400",
  };
}

export function getTypeBadgeVariant(tipeData: string | null): BadgeVariant {
  const type = (tipeData || "").toUpperCase();

  switch (type) {
    case "UPDATE_STATUS":
      return {
        bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
        text: "text-indigo-700 dark:text-indigo-400",
        border: "border-indigo-500/20 dark:border-indigo-500/30",
      };
    case "ALARM":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/20 dark:border-amber-500/30",
      };
    case "EVENT":
      return {
        bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
        text: "text-cyan-700 dark:text-cyan-400",
        border: "border-cyan-500/20 dark:border-cyan-500/30",
      };
    case "UPDATE_INFO":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-500/20 dark:border-blue-500/30",
      };
    default:
      return {
        bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
        text: "text-zinc-700 dark:text-zinc-400",
        border: "border-zinc-500/20 dark:border-zinc-500/30",
      };
  }
}

export function getAlarmDirectionVariant(direction: string | null): BadgeVariant & { label: string; status: string } {
  if (direction === "START") {
    return {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-500/20 dark:border-rose-500/30",
      dotBg: "bg-rose-500",
      label: "START",
      status: "ACTIVE",
    };
  }
  if (direction === "STOP") {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      dotBg: "bg-emerald-500",
      label: "STOP",
      status: "RESOLVED",
    };
  }
  return {
    bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
    text: "text-zinc-700 dark:text-zinc-400",
    border: "border-zinc-500/20 dark:border-zinc-500/30",
    label: direction || "N/A",
    status: "UNKNOWN",
  };
}
