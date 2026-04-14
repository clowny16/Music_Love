# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Python**: 3.11 (via `.pythonlibs`) — used for `ytmusicapi`

## Artifacts

### Music Player (`artifacts/music-player`)
- **Kind**: react-vite (web)
- **Preview path**: `/`
- **Purpose**: A dark-themed YouTube Music player
- **Features**: Search songs, search suggestions, top charts, queue management, YouTube IFrame playback

### API Server (`artifacts/api-server`)
- **Kind**: api
- **Preview path**: `/api`
- **Purpose**: Express backend serving music data via ytmusicapi (Python)
- **Routes**:
  - `GET /api/music/search?q=&filter=` — search songs
  - `GET /api/music/song/:videoId` — song details
  - `GET /api/music/charts?country=` — trending/top songs
  - `GET /api/music/suggestions?q=` — search suggestions
  - `GET /api/music/watch/:videoId` — watch queue

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
