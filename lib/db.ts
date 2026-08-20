import { PrismaClient } from '@prisma/client';
import { WebhookLogItem, H2HDOReply } from './types';
import fs from 'fs';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var inMemoryLogs: WebhookLogItem[] | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// File persistence path for local / fallback mode so data NEVER disappears on server restarts
const isVercel = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'webhook_logs.json');

const INITIAL_SAMPLE_LOGS: WebhookLogItem[] = [
  {
    id: "log_sample_01",
    do_id: 1088054,
    nopol: "F 1234 FC",
    no_do: "2004914333",
    no_sj: "2005141774",
    status_do: 2,
    ket_status_do: "OTW Tujuan",
    tipe_data: "ALARM",
    ket_tipe_data: "TUJUAN LAIN",
    direction_status: "START",
    distance_km: 198.0,
    temperature: 0.0,
    event_time: "2026-08-19T13:29:23+07:00",
    received_at: new Date("2026-08-19T13:29:25+07:00").toISOString(),
    payload_json: {
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
      tujuan: null,
      info_asal_complete: null,
      info_asal_tujuan: null,
      info_tujuan_asal: null
    }
  }
];

// Helper functions for disk file persistence
function loadLogsFromFile(): WebhookLogItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Write sample logs initially if file system is writable
    try {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_SAMPLE_LOGS, null, 2));
    } catch {
      // Ignore EROFS on read-only environments
    }
    return INITIAL_SAMPLE_LOGS;
  } catch (err) {
    console.warn("Could not read persistent log file, falling back to initial sample logs:", err);
    return INITIAL_SAMPLE_LOGS;
  }
}

function saveLogsToFile(logs: WebhookLogItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.warn("Could not save to persistent log file:", err);
  }
}

function getInMemoryLogs(): WebhookLogItem[] {
  if (!global.inMemoryLogs || global.inMemoryLogs.length === 0) {
    global.inMemoryLogs = loadLogsFromFile();
  }
  return global.inMemoryLogs;
}

// Initialize in-memory logs
global.inMemoryLogs = getInMemoryLogs();

const isLocalDb = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
const usePostgres = !!(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql://') && (!isVercel || !isLocalDb));

const REMOTE_KV_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a01d86302e5880';

async function fetchRemoteLogs(): Promise<WebhookLogItem[]> {
  try {
    const res = await fetch(REMOTE_KV_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.logs && Array.isArray(json.data.logs) && json.data.logs.length > 0) {
        return json.data.logs;
      }
    }
  } catch (err) {
    console.warn("Remote KV fetch failed, using disk file:", err);
  }
  return loadLogsFromFile();
}

async function saveRemoteLogs(logs: WebhookLogItem[]) {
  try {
    await fetch(REMOTE_KV_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'webhook_easygo_logs',
        data: { logs: logs.slice(0, 100) },
      }),
    });
  } catch (err) {
    console.warn("Remote KV save failed:", err);
  }
}

export async function saveWebhookLog(payload: H2HDOReply): Promise<WebhookLogItem> {
  const eventTime = payload.even?.tgl_event || payload.alarm?.start_time || payload.asal?.tgl_masuk || new Date().toISOString();
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const logItem: WebhookLogItem = {
    id,
    do_id: payload.do_id ?? null,
    nopol: payload.nopol ?? null,
    no_do: payload.no_do ?? null,
    no_sj: payload.no_sj ?? null,
    status_do: payload.status_do ?? null,
    ket_status_do: payload.ket_status_do ?? null,
    tipe_data: payload.tipe_data ?? null,
    ket_tipe_data: payload.ket_tipe_data ?? null,
    direction_status: payload.direction_status ?? null,
    distance_km: payload.distance_km ?? null,
    temperature: payload.current_temperatur1 ?? null,
    payload_json: payload,
    event_time: eventTime,
    received_at: new Date().toISOString(),
  };

  try {
    if (usePostgres) {
      await prisma.webhookLog.create({
        data: {
          id: logItem.id,
          do_id: logItem.do_id !== null ? BigInt(logItem.do_id) : null,
          nopol: logItem.nopol,
          no_do: logItem.no_do,
          no_sj: logItem.no_sj,
          status_do: logItem.status_do,
          ket_status_do: logItem.ket_status_do,
          tipe_data: logItem.tipe_data,
          ket_tipe_data: logItem.ket_tipe_data,
          direction_status: logItem.direction_status,
          distance_km: logItem.distance_km,
          temperature: logItem.temperature,
          payload_json: payload as any,
          event_time: eventTime ? new Date(eventTime) : null,
          received_at: new Date(logItem.received_at),
        },
      });
    }
  } catch (err) {
    console.warn("PostgreSQL write fallback to remote store:", err);
  }

  // Fetch current logs, prepend new log, and update shared remote store
  const logs = await fetchRemoteLogs();
  if (!logs.some(l => l.id === logItem.id)) {
    logs.unshift(logItem);
  }
  global.inMemoryLogs = logs;
  saveLogsToFile(logs);
  saveRemoteLogs(logs).catch(() => {});

  return logItem;
}

export async function getWebhookLogs(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  vehicle?: string;
  dateFrom?: string;
  dateTo?: string;
  do_id?: number;
}): Promise<{ logs: WebhookLogItem[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;

  try {
    if (usePostgres) {
      const where: any = {};

      if (filters?.search) {
        const search = filters.search.trim();
        where.OR = [
          { nopol: { contains: search, mode: 'insensitive' } },
          { no_do: { contains: search, mode: 'insensitive' } },
          { no_sj: { contains: search, mode: 'insensitive' } },
          { ket_tipe_data: { contains: search, mode: 'insensitive' } },
        ];
        const numSearch = parseInt(search, 10);
        if (!isNaN(numSearch)) {
          where.OR.push({ do_id: BigInt(numSearch) });
        }
      }

      if (filters?.type) {
        where.tipe_data = filters.type;
      }
      if (filters?.status !== undefined && filters.status !== '') {
        where.status_do = parseInt(filters.status, 10);
      }
      if (filters?.vehicle) {
        where.nopol = { contains: filters.vehicle, mode: 'insensitive' };
      }
      if (filters?.do_id) {
        where.do_id = BigInt(filters.do_id);
      }

      const total = await prisma.webhookLog.count({ where });
      const dbLogs = await prisma.webhookLog.findMany({
        where,
        orderBy: { received_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const logs: WebhookLogItem[] = dbLogs.map(item => ({
        id: item.id,
        do_id: item.do_id ? Number(item.do_id) : null,
        nopol: item.nopol,
        no_do: item.no_do,
        no_sj: item.no_sj,
        status_do: item.status_do,
        ket_status_do: item.ket_status_do,
        tipe_data: item.tipe_data,
        ket_tipe_data: item.ket_tipe_data,
        direction_status: item.direction_status,
        distance_km: item.distance_km,
        temperature: item.temperature,
        payload_json: item.payload_json as unknown as H2HDOReply,
        event_time: item.event_time ? item.event_time.toISOString() : null,
        received_at: item.received_at.toISOString(),
      }));

      return {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  } catch (err) {
    console.warn("PostgreSQL query fallback to disk file store:", err);
  }

  // Reload logs from remote store or disk file
  const currentLogs = await fetchRemoteLogs();
  global.inMemoryLogs = currentLogs;

  let filtered = currentLogs;

  if (filters?.do_id) {
    filtered = filtered.filter(l => l.do_id === filters.do_id);
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase().trim();
    filtered = filtered.filter(l =>
      (l.do_id !== null && String(l.do_id).includes(s)) ||
      (l.no_do && l.no_do.toLowerCase().includes(s)) ||
      (l.no_sj && l.no_sj.toLowerCase().includes(s)) ||
      (l.nopol && l.nopol.toLowerCase().includes(s)) ||
      (l.ket_tipe_data && l.ket_tipe_data.toLowerCase().includes(s))
    );
  }

  if (filters?.type) {
    filtered = filtered.filter(l => l.tipe_data === filters.type);
  }

  if (filters?.status !== undefined && filters.status !== '') {
    const statusCode = parseInt(filters.status, 10);
    filtered = filtered.filter(l => l.status_do === statusCode);
  }

  if (filters?.vehicle) {
    const v = filters.vehicle.toLowerCase().trim();
    filtered = filtered.filter(l => l.nopol && l.nopol.toLowerCase().includes(v));
  }

  // Always sort newest logs first (descending order)
  filtered = [...filtered].sort(
    (a, b) => new Date(b.received_at || b.event_time || 0).getTime() - new Date(a.received_at || a.event_time || 0).getTime()
  );

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedLogs = filtered.slice(startIndex, startIndex + limit);

  return {
    logs: paginatedLogs,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getWebhookLogById(id: string): Promise<WebhookLogItem | null> {
  try {
    if (usePostgres) {
      const item = await prisma.webhookLog.findUnique({ where: { id } });
      if (item) {
        return {
          id: item.id,
          do_id: item.do_id ? Number(item.do_id) : null,
          nopol: item.nopol,
          no_do: item.no_do,
          no_sj: item.no_sj,
          status_do: item.status_do,
          ket_status_do: item.ket_status_do,
          tipe_data: item.tipe_data,
          ket_tipe_data: item.ket_tipe_data,
          direction_status: item.direction_status,
          distance_km: item.distance_km,
          temperature: item.temperature,
          payload_json: item.payload_json as unknown as H2HDOReply,
          event_time: item.event_time ? item.event_time.toISOString() : null,
          received_at: item.received_at.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("DB query by ID fallback to remote store:", err);
  }

  const currentLogs = await fetchRemoteLogs();
  const memoryItem = currentLogs.find(l => l.id === id);
  return memoryItem || null;
}

export async function getDashboardStats(): Promise<{
  totalMessages: number;
  totalDO: number;
  activeAlarms: number;
  completedDO: number;
  messagesToday: number;
}> {
  try {
    const res = await getWebhookLogs({ limit: 10000 });
    const logs: WebhookLogItem[] = res?.logs || [];

    const totalMessages = logs.length;
    const uniqueDOs = new Set(logs.map(l => l?.do_id).filter(Boolean));
    const totalDO = uniqueDOs.size;

    const alarmMap = new Map<string, string>();
    logs.forEach(l => {
      if (l && l.tipe_data === 'ALARM' && l.do_id && l.ket_tipe_data && l.direction_status) {
        const key = `${l.do_id}_${l.ket_tipe_data}`;
        if (!alarmMap.has(key)) {
          alarmMap.set(key, l.direction_status);
        }
      }
    });

    let activeAlarms = 0;
    alarmMap.forEach((status) => {
      if (status === 'START') activeAlarms++;
    });

    const completedDO = logs.filter(l =>
      l && (l.status_do === 8 || (typeof l.ket_status_do === 'string' && l.ket_status_do.toUpperCase().includes('COMPLETE') && !l.ket_status_do.toUpperCase().includes('INCOMPLETE')))
    ).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const messagesToday = logs.filter(l =>
      l && typeof l.received_at === 'string' && l.received_at.startsWith(todayStr)
    ).length;

    return {
      totalMessages,
      totalDO,
      activeAlarms,
      completedDO,
      messagesToday,
    };
  } catch (err) {
    console.error("Error computing dashboard stats:", err);
    return {
      totalMessages: 0,
      totalDO: 0,
      activeAlarms: 0,
      completedDO: 0,
      messagesToday: 0,
    };
  }
}
