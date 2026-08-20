import { PrismaClient } from '@prisma/client';
import { WebhookLogItem, H2HDOReply } from './types';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function saveWebhookLog(payload: H2HDOReply): Promise<WebhookLogItem> {
  const p: any = (payload && typeof payload === 'object') ? payload : {};
  const eventTime = p.even?.tgl_event || p.alarm?.start_time || p.asal?.tgl_masuk || new Date().toISOString();
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const doId = p.do_id !== null && p.do_id !== undefined ? BigInt(p.do_id) : null;
  const nopol = p.nopol || null;
  const noDo = p.no_do || null;
  const noSj = p.no_sj || null;
  const statusDo = p.status_do !== undefined && p.status_do !== null ? Number(p.status_do) : null;
  const ketStatusDo = p.ket_status_do || (p.status_do !== undefined && p.status_do !== null ? `Status ${p.status_do}` : null);
  const tipeData = p.tipe_data || null;
  const ketTipeData = p.ket_tipe_data || p.even?.eventNm || p.alarm?.eventNm || null;
  const directionStatus = p.direction_status || null;
  const distanceKm = typeof p.distance_km === 'number' ? p.distance_km : null;
  const temperature = typeof p.current_temperatur1 === 'number' ? p.current_temperatur1 : null;
  const receivedAtDate = new Date();

  const created = await prisma.webhookLog.create({
    data: {
      id,
      do_id: doId,
      nopol,
      no_do: noDo,
      no_sj: noSj,
      status_do: statusDo,
      ket_status_do: ketStatusDo,
      tipe_data: tipeData,
      ket_tipe_data: ketTipeData,
      direction_status: directionStatus,
      distance_km: distanceKm,
      temperature,
      payload_json: p as any,
      event_time: eventTime ? new Date(eventTime) : null,
      received_at: receivedAtDate,
    },
  });

  return {
    id: created.id,
    do_id: created.do_id ? Number(created.do_id) : null,
    nopol: created.nopol,
    no_do: created.no_do,
    no_sj: created.no_sj,
    status_do: created.status_do,
    ket_status_do: created.ket_status_do,
    tipe_data: created.tipe_data,
    ket_tipe_data: created.ket_tipe_data,
    direction_status: created.direction_status,
    distance_km: created.distance_km,
    temperature: created.temperature,
    payload_json: created.payload_json as unknown as H2HDOReply,
    event_time: created.event_time ? created.event_time.toISOString() : null,
    received_at: created.received_at.toISOString(),
  };
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

export async function getWebhookLogById(id: string): Promise<WebhookLogItem | null> {
  const item = await prisma.webhookLog.findUnique({ where: { id } });
  if (!item) return null;
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

export async function getDashboardStats(): Promise<{
  totalMessages: number;
  totalDO: number;
  activeAlarms: number;
  completedDO: number;
  messagesToday: number;
}> {
  try {
    const totalMessages = await prisma.webhookLog.count();
    const uniqueDOsResult = await prisma.webhookLog.groupBy({
      by: ['do_id'],
      where: { do_id: { not: null } },
    });
    const totalDO = uniqueDOsResult.length;

    const alarmLogs = await prisma.webhookLog.findMany({
      where: { tipe_data: 'ALARM' },
      select: { do_id: true, ket_tipe_data: true, direction_status: true, received_at: true },
      orderBy: { received_at: 'desc' },
    });

    const alarmMap = new Map<string, string>();
    alarmLogs.forEach(l => {
      if (l.do_id && l.ket_tipe_data && l.direction_status) {
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

    const completedDO = await prisma.webhookLog.count({
      where: {
        OR: [
          { status_do: 8 },
          { ket_status_do: { contains: 'COMPLETE', mode: 'insensitive' } },
        ],
      },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const messagesToday = await prisma.webhookLog.count({
      where: {
        received_at: { gte: startOfToday },
      },
    });

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
