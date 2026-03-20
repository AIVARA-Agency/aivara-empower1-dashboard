# AIVARA Empower Dashboard

A modern analytics dashboard for monitoring SMS outbound/inbound delivery and RVM (Ringless Voicemail) campaign performance.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 with OKLCH-based light/dark theme
- **UI Components:** Shadcn/UI
- **Charts:** Recharts
- **Language:** TypeScript

## Features

- **Overview page** — KPI cards and analytics charts for SMS outbound, SMS inbound, and RVM campaigns
- **SMS Logs page** — Paginated raw log table with campaign and carrier breakdown charts
- **Dark/light mode** toggle
- **API proxy routes** to securely forward requests to upstream n8n webhooks (avoids CORS)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── dashboard/route.ts   # Proxy → n8n aggregated stats
│   │   └── sms/route.ts         # Proxy → n8n SMS logs
│   ├── page.tsx                 # Overview route (/)
│   ├── sms/page.tsx             # SMS Logs route (/sms)
│   ├── layout.tsx
│   └── globals.css              # Tailwind v4 + OKLCH theme
├── components/
│   ├── dashboard/               # Stats cards, charts, SMS table
│   ├── layout/                  # Sidebar, header, theme provider
│   └── ui/                      # Shadcn/UI primitives
├── hooks/
│   ├── use-dashboard.ts         # Overview data fetching
│   └── use-sms-logs.ts          # SMS logs + pagination
├── lib/utils.ts
└── types/index.ts
```

## Environment

The API proxy routes forward requests to the configured upstream endpoints in:
- `src/app/api/dashboard/route.ts`
- `src/app/api/sms/route.ts`

Update the `UPSTREAM` URLs in those files to point to your n8n webhook instance.
