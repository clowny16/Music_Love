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
- **Features**:
  - Search songs (with autocomplete suggestions)
  - Top Charts: real song tracks from featured playlists + top artists with trend indicators
  - Queue management (up next, previously played)
  - Recently played history (persisted to localStorage)
  - Liked songs library (persisted to localStorage, can play all)
  - Library tab: liked songs, recent albums grid, recent artists grid
  - Album detail page (tracklist, play/shuffle, art header)
  - Now Playing full-screen overlay (album art, controls, up next)
  - YouTube IFrame playback (invisible embedded player)
  - Player bar: progress seek, volume, like button, open Now Playing chevron

### API Server (`artifacts/api-server`)
- **Kind**: api
- **Preview path**: `/api`
- **Purpose**: Express backend serving music data via ytmusicapi (Python)
- **Routes**:
  - `GET /api/music/search?q=&filter=` — search songs/albums/artists
  - `GET /api/music/song/:videoId` — song details
  - `GET /api/music/charts?country=` — featured playlist tracks + top artists
  - `GET /api/music/suggestions?q=` — search suggestions
  - `GET /api/music/watch/:videoId` — watch queue/related tracks
  - `GET /api/music/album/:albumId` — album details and tracklist

## Charts API Notes

`ytmusicapi.get_charts(country)` returns:
- `videos`: list of featured playlists (title, playlistId, thumbnails)
- `artists`: top artists with rank/trend/subscribers
- NO direct song list — songs are fetched from `videos[0].playlistId` via `get_playlist`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/api-server run build` — build API server (required before restart)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
