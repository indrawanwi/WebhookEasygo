export type DurationData = {
  value: number | null;
  text: string | null;
};

export type EventData = {
  eventNm: string | null;
  addr: string | null;
  lon: number | null;
  lat: number | null;
  odometer: number | null;
  geo_nm: string | null;
  geo_code: string | null;
  geo_id: number | null;
  tgl_event?: string | null;
};

export type AlarmData = {
  id: number | null;
  eventNm: string | null;
  addr: string | null;
  lon: number | null;
  lat: number | null;
  geo_nm: string | null;
  geo_code: string | null;
  geo_id: number | null;
  start_time: string | null;
  stop_time: string | null;
  duration: DurationData | null;
};

export type LocationDO = {
  geo_nm: string | null;
  geo_code: string | null;
  geo_id: number | null;
  tgl_masuk: string | null;
  tgl_keluar: string | null;
  tgl_unlock: string | null;
  tgl_lock: string | null;
  duration: DurationData | null;
  validIn?: boolean;
};

export type DestinationDO = {
  geo_nm: string | null;
  geo_code: string | null;
  geo_id: number | null;
  tgl_masuk: string | null;
  tgl_keluar: string | null;
  tgl_unlock: string | null;
  tgl_lock: string | null;
  start_bongkar: string | null;
  selesai_bongkar: string | null;
  duration: DurationData | null;
  no_sj: string | null;
  Complete: boolean | null;
  desc: string | null;
  cust_telegram: string | null;
  cust_email: string | null;
  auth_rfid: string | null;
  lon: string | null;
  lat: string | null;
};

export type JourneyInfo = {
  start_time: string | null;
  stop_time: string | null;
  start_odometer: number | null;
  stop_odometer: number | null;
  total_km: number | null;
  durasi: DurationData | null;
  durasi_driving: DurationData | null;
  durasi_parking: DurationData | null;
  durasi_idle: DurationData | null;
};

export type H2HDOReply = {
  do_id: number | null;
  nopol: string | null;
  status_do: number | null;
  ket_status_do: string | null;
  no_do: string | null;
  no_sj: string | null;
  direction_status: "START" | "STOP" | string | null;
  tipe_data: "UPDATE_STATUS" | "ALARM" | "EVENT" | "UPDATE_INFO" | string;
  ket_tipe_data: string | null;
  distance_km: number | null;
  current_temperatur1: number | null;
  even: EventData | null;
  alarm: AlarmData | null;
  asal: LocationDO | null;
  tujuan: DestinationDO | null;
  info_asal_complete: JourneyInfo | null;
  info_asal_tujuan: JourneyInfo | null;
  info_tujuan_asal: JourneyInfo | null;
};

export type WebhookLogItem = {
  id: string;
  do_id: number | null;
  nopol: string | null;
  no_do: string | null;
  no_sj: string | null;
  status_do: number | null;
  ket_status_do: string | null;
  tipe_data: string | null;
  ket_tipe_data: string | null;
  direction_status: string | null;
  distance_km: number | null;
  temperature: number | null;
  payload_json: H2HDOReply;
  event_time: string | null;
  received_at: string;
};
