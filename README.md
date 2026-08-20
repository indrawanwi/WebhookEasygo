# H2H DO Listener & Viewer

A production-ready **H2H DO Listener & Viewer** Next.js application built with App Router, TypeScript, Prisma ORM (PostgreSQL), Tailwind CSS, and a modern **Bento Grid** design system.

Features:
- **Webhook Listener (`POST /api/webhook`)**: Responds with fast JSON payload without blocking sync bottlenecks.
- **JSON Payload Viewer**: Syntax highlighting, collapsible trees, raw text view, copy buttons, and parsed data tabs.
- **Bento Summary Dashboard**: Live webhook status, messages metrics, active alarms, completed DO count, and vehicle catalog.
- **Live Telemetry Event Stream**: Chronological real-time stream with semantic icons and status indicators.
- **Detailed Journey Analytics**: 3 Bento cards tracking lifecycle metrics (Origin → Complete, Origin → Destination, Destination → Origin).
- **Interactive OpenStreetMap Visualization**: Dynamic Leaflet maps for event and alarm GPS coordinates.
- **Active Alarms Catalog**: Monitor and track START vs STOP alarm resolutions.
- **Vehicle Catalog & History**: License plate telemetry chronology.
- **Built-in Webhook Tester**: Interactive 2-column test console with 6 sample presets.

---

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS, CSS Variables for Bento layout
- **Icons**: Lucide Icons
- **Database**: PostgreSQL (Vercel Postgres, Neon, Supabase) via Prisma ORM
- **Maps**: OpenStreetMap (Leaflet client-side dynamic rendering)
- **Validation**: Zod schema validation with `.passthrough()` for upstream flexibility

---

## 🚀 Quick Start & Development

### 1. Environment Configuration
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/h2h_db?schema=public"
WEBHOOK_SECRET=""
NEXT_PUBLIC_APP_NAME="H2H DO Listener & Viewer"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Database Client & Migration
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Webhook API Testing

### Endpoint
```txt
POST /api/webhook
Content-Type: application/json
```

### Test via cURL (Open Access)
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "do_id": 1088054,
    "status_do": 2,
    "no_do": "2004914333",
    "no_sj": "2005141774",
    "ket_status_do": "OTW Tujuan",
    "nopol": "F 1234 FC",
    "direction_status": "START",
    "tipe_data": "ALARM",
    "ket_tipe_data": "TUJUAN LAIN",
    "distance_km": 198.0,
    "current_temperatur1": 0.0,
    "even": null,
    "alarm": {
      "id": 19315,
      "eventNm": "TUJUAN LAIN",
      "addr": "Jl. Maospati - Solo, Kedunglengki, Pengkol, Mantingan, Ngawi, Jawa Timur 63261",
      "lon": 111.20394897460937,
      "lat": -7.373449802398682,
      "geo_nm": "GUDANG XXI",
      "geo_code": "1600930000,0000000160",
      "geo_id": 45223,
      "start_time": "2026-08-19T13:29:23+07:00",
      "stop_time": "2026-08-19T14:31:21+07:00",
      "duration": {
        "value": 3718.0,
        "text": "1 jam, 1 menit"
      }
    },
    "asal": null,
    "tujuan": null
  }'
```

### Test via cURL (With Secret Token)
If `WEBHOOK_SECRET` is set in your environment:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d @payload.json
```

### Expected Response
```json
{
  "success": true,
  "received": true,
  "timestamp": "2026-08-19T09:30:00.000Z"
}
```

---

## ⚡ Deployment to Vercel

1. Push your repository to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Connect a Vercel Postgres / Neon database, or add `DATABASE_URL` under Environment Variables.
4. (Optional) Set `WEBHOOK_SECRET` variable in Vercel settings.
5. Deploy! Vercel will automatically run `prisma generate` and `next build`.
