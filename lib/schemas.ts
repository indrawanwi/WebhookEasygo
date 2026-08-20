import { z } from 'zod';

export const DurationDataSchema = z.object({
  value: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
}).passthrough().nullable().optional();

export const EventDataSchema = z.object({
  eventNm: z.string().nullable().optional(),
  addr: z.string().nullable().optional(),
  lon: z.number().nullable().optional(),
  lat: z.number().nullable().optional(),
  odometer: z.number().nullable().optional(),
  geo_nm: z.string().nullable().optional(),
  geo_code: z.string().nullable().optional(),
  geo_id: z.number().nullable().optional(),
  tgl_event: z.string().nullable().optional(),
}).passthrough().nullable().optional();

export const AlarmDataSchema = z.object({
  id: z.number().nullable().optional(),
  eventNm: z.string().nullable().optional(),
  addr: z.string().nullable().optional(),
  lon: z.number().nullable().optional(),
  lat: z.number().nullable().optional(),
  geo_nm: z.string().nullable().optional(),
  geo_code: z.string().nullable().optional(),
  geo_id: z.number().nullable().optional(),
  start_time: z.string().nullable().optional(),
  stop_time: z.string().nullable().optional(),
  duration: DurationDataSchema,
}).passthrough().nullable().optional();

export const LocationDOSchema = z.object({
  geo_nm: z.string().nullable().optional(),
  geo_code: z.string().nullable().optional(),
  geo_id: z.number().nullable().optional(),
  tgl_masuk: z.string().nullable().optional(),
  tgl_keluar: z.string().nullable().optional(),
  tgl_unlock: z.string().nullable().optional(),
  tgl_lock: z.string().nullable().optional(),
  duration: DurationDataSchema,
  validIn: z.boolean().optional(),
}).passthrough().nullable().optional();

export const DestinationDOSchema = z.object({
  geo_nm: z.string().nullable().optional(),
  geo_code: z.string().nullable().optional(),
  geo_id: z.number().nullable().optional(),
  tgl_masuk: z.string().nullable().optional(),
  tgl_keluar: z.string().nullable().optional(),
  tgl_unlock: z.string().nullable().optional(),
  tgl_lock: z.string().nullable().optional(),
  start_bongkar: z.string().nullable().optional(),
  selesai_bongkar: z.string().nullable().optional(),
  duration: DurationDataSchema,
  no_sj: z.string().nullable().optional(),
  Complete: z.boolean().nullable().optional(),
  desc: z.string().nullable().optional(),
  cust_telegram: z.string().nullable().optional(),
  cust_email: z.string().nullable().optional(),
  auth_rfid: z.string().nullable().optional(),
  lon: z.union([z.string(), z.number()]).nullable().optional(),
  lat: z.union([z.string(), z.number()]).nullable().optional(),
}).passthrough().nullable().optional();

export const JourneyInfoSchema = z.object({
  start_time: z.string().nullable().optional(),
  stop_time: z.string().nullable().optional(),
  start_odometer: z.number().nullable().optional(),
  stop_odometer: z.number().nullable().optional(),
  total_km: z.number().nullable().optional(),
  durasi: DurationDataSchema,
  durasi_driving: DurationDataSchema,
  durasi_parking: DurationDataSchema,
  durasi_idle: DurationDataSchema,
}).passthrough().nullable().optional();

export const H2HDOReplySchema = z.object({
  do_id: z.union([z.number(), z.string().transform(v => parseInt(v, 10))]).nullable().optional(),
  nopol: z.string().nullable().optional(),
  status_do: z.number().nullable().optional(),
  ket_status_do: z.string().nullable().optional(),
  no_do: z.string().nullable().optional(),
  no_sj: z.string().nullable().optional(),
  direction_status: z.string().nullable().optional(),
  tipe_data: z.string(),
  ket_tipe_data: z.string().nullable().optional(),
  distance_km: z.number().nullable().optional(),
  current_temperatur1: z.number().nullable().optional(),
  even: EventDataSchema,
  alarm: AlarmDataSchema,
  asal: LocationDOSchema,
  tujuan: DestinationDOSchema,
  info_asal_complete: JourneyInfoSchema,
  info_asal_tujuan: JourneyInfoSchema,
  info_tujuan_asal: JourneyInfoSchema,
}).passthrough();
