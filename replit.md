# Smart Food Tour

## Overview

Smart Food Tour — Nền tảng du lịch ẩm thực thông minh. Kết hợp bản đồ tương tác, giả lập GPS bằng click, phát audio giới thiệu quán, hỗ trợ 15 ngôn ngữ và chatbox AI.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/smart-food-tour)
- **Backend**: Express 5 (artifacts/api-server)
- **Database**: Hardcoded data in artifacts/api-server/src/data/ (no DB needed for now)
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Maps**: React-Leaflet / Leaflet
- **State**: Zustand
- **Animations**: Framer Motion
- **Audio**: Web Speech API (TTS)

## Architecture

### Backend — 3-Layer Architecture

```
artifacts/api-server/src/
├── data/          # Data layer — hardcoded venue and language data
│   ├── venues.ts  # 8 food venues in HCM City with multilingual content
│   └── languages.ts # 15 supported languages
├── services/      # Service layer — business logic
│   ├── venueService.ts  # Venue queries, localization, distance calc
│   └── chatService.ts   # AI chatbox response logic
└── routes/        # Route layer — HTTP handlers
    ├── venues.ts  # GET /api/venues, /api/venues/nearby, /api/venues/:id, /api/audio/:venueId
    ├── languages.ts # GET /api/languages
    └── chat.ts    # POST /api/chat/message
```

### Frontend Pages

- `/` — Language selection (15 languages with flags + search)
- `/map` — Main map with fake GPS (click to move), audio triggers, venue list sidebar
- `/venue/:id` — Venue detail with menu, gallery, reviews, play audio button
- Chatbox — Floating FAB on all pages with quick replies

## Key Features

- **Fake GPS**: Click anywhere on the map to move your simulated location
- **Auto Audio**: When within audioRadius of a venue, Web Speech API reads the venue transcript
- **15 Languages**: All content (venue names, descriptions, audio) in selected language
- **Chatbox**: Keyword-based AI chat responses with venue suggestions

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── smart-food-tour/    # React frontend (port 23200, preview at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   └── api-zod/            # Generated Zod schemas from OpenAPI
├── pnpm-workspace.yaml
└── tsconfig.json
```

## API Endpoints

- `GET /api/venues?lang=en&category=vietnamese&lat=10.77&lng=106.70` — All venues
- `GET /api/venues/nearby?lat=X&lng=Y&radius=100&lang=en` — Nearby venues
- `GET /api/venues/:id?lang=en` — Venue detail
- `GET /api/audio/:venueId?lang=en` — Audio transcript for venue
- `GET /api/languages` — Supported languages list
- `POST /api/chat/message` — Chat with AI assistant

## Running

- Frontend: `pnpm --filter @workspace/smart-food-tour run dev`
- Backend: `pnpm --filter @workspace/api-server run dev`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
