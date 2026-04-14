import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import {
  SearchMusicQueryParams,
  SearchMusicResponse,
  GetSongParams,
  GetSongResponse,
  GetChartsQueryParams,
  GetChartsResponse,
  GetSearchSuggestionsQueryParams,
  GetSearchSuggestionsResponse,
  GetWatchPlaylistParams,
  GetWatchPlaylistResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function runPython(script: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", ["-c", script]);
    let stdout = "";
    let stderr = "";
    python.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    python.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python error: ${stderr}`));
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error(`JSON parse error: ${stdout}`));
        }
      }
    });
  });
}

function normalizeThumbnails(thumbnails: Array<{ url: string; width?: number; height?: number }>) {
  if (!Array.isArray(thumbnails)) return [];
  return thumbnails.map((t) => ({
    url: t.url,
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

function normalizeTrack(item: Record<string, unknown>) {
  const artists = Array.isArray(item.artists)
    ? (item.artists as Array<{ name?: string; id?: string | null }>).map((a) => ({
        name: a.name ?? "Unknown",
        id: a.id ?? undefined,
      }))
    : [];
  const album = item.album as { name?: string; id?: string | null } | null ?? null;
  return {
    videoId: (item.videoId as string) ?? "",
    title: (item.title as string) ?? "Unknown",
    artists,
    album: album ? { name: album.name ?? "", id: album.id ?? undefined } : null,
    duration: (item.duration as string) ?? null,
    durationSeconds: (item.duration_seconds as number) ?? null,
    thumbnails: normalizeThumbnails(
      (item.thumbnails as Array<{ url: string; width?: number; height?: number }>) ?? []
    ),
    isExplicit: (item.isExplicit as boolean) ?? null,
  };
}

router.get("/music/search", async (req, res) => {
  const params = SearchMusicQueryParams.parse(req.query);
  const filter = params.filter ?? "songs";
  const script = `
import json
from ytmusicapi import YTMusic
yt = YTMusic()
try:
    results = yt.search(${JSON.stringify(params.q)}, filter=${JSON.stringify(filter)}, limit=20)
    print(json.dumps(results))
except Exception as e:
    print(json.dumps([]))
`;
  try {
    const raw = (await runPython(script)) as Array<Record<string, unknown>>;
    const tracks = raw.filter((r) => r.videoId).map(normalizeTrack);
    const response = SearchMusicResponse.parse({ results: tracks, query: params.q });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "search error");
    res.json({ results: [], query: params.q });
  }
});

router.get("/music/song/:videoId", async (req, res) => {
  const { videoId } = GetSongParams.parse(req.params);
  const script = `
import json
from ytmusicapi import YTMusic
yt = YTMusic()
try:
    info = yt.get_song(${JSON.stringify(videoId)})
    details = info.get('videoDetails', {})
    thumbnails = details.get('thumbnail', {}).get('thumbnails', [])
    artists_raw = details.get('author', 'Unknown')
    result = {
        'videoId': details.get('videoId', ''),
        'title': details.get('title', 'Unknown'),
        'artists': [{'name': artists_raw}],
        'album': None,
        'thumbnails': thumbnails,
        'duration': None,
        'duration_seconds': int(details.get('lengthSeconds', 0)),
        'youtubeUrl': 'https://www.youtube.com/watch?v=' + details.get('videoId', ''),
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'videoId': '', 'title': 'Unknown', 'artists': [{'name': 'Unknown'}], 'thumbnails': [], 'youtubeUrl': 'https://www.youtube.com/watch?v=' + ${JSON.stringify(videoId)}}))
`;
  try {
    const raw = (await runPython(script)) as Record<string, unknown>;
    const info = {
      videoId: (raw.videoId as string) ?? videoId,
      title: (raw.title as string) ?? "Unknown",
      artists: Array.isArray(raw.artists)
        ? (raw.artists as Array<{ name?: string }>).map((a) => ({ name: a.name ?? "Unknown" }))
        : [{ name: "Unknown" }],
      album: (raw.album as string) ?? null,
      thumbnails: normalizeThumbnails(
        (raw.thumbnails as Array<{ url: string; width?: number; height?: number }>) ?? []
      ),
      duration: (raw.duration as string) ?? null,
      durationSeconds: (raw.duration_seconds as number) ?? null,
      youtubeUrl: `https://www.youtube.com/watch?v=${(raw.videoId as string) ?? videoId}`,
    };
    const response = GetSongResponse.parse(info);
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "get song error");
    res.status(500).json({ error: "Failed to get song info" });
  }
});

router.get("/music/charts", async (req, res) => {
  const params = GetChartsQueryParams.parse(req.query);
  const country = params.country ?? "US";
  const script = `
import json
from ytmusicapi import YTMusic
yt = YTMusic()
try:
    charts = yt.get_charts(country=${JSON.stringify(country)})
    trending = []
    top_songs = []
    if 'trending' in charts and charts['trending']:
        t = charts['trending']
        items = t.get('items', []) if isinstance(t, dict) else []
        trending = items[:20]
    if 'songs' in charts and charts['songs']:
        s = charts['songs']
        items = s.get('items', []) if isinstance(s, dict) else []
        top_songs = items[:20]
    print(json.dumps({'trending': trending, 'topSongs': top_songs}))
except Exception as e:
    print(json.dumps({'trending': [], 'topSongs': []}))
`;
  try {
    const raw = (await runPython(script)) as { trending: Array<Record<string, unknown>>; topSongs: Array<Record<string, unknown>> };
    const trending = (raw.trending ?? []).filter((r) => r.videoId).map(normalizeTrack);
    const topSongs = (raw.topSongs ?? []).filter((r) => r.videoId).map(normalizeTrack);
    const response = GetChartsResponse.parse({ trending, topSongs, country });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "charts error");
    res.json({ trending: [], topSongs: [], country });
  }
});

router.get("/music/suggestions", async (req, res) => {
  const params = GetSearchSuggestionsQueryParams.parse(req.query);
  const script = `
import json
from ytmusicapi import YTMusic
yt = YTMusic()
try:
    suggestions = yt.get_search_suggestions(${JSON.stringify(params.q)})
    texts = [s['suggestion']['runs'][0]['text'] if isinstance(s, dict) and 'suggestion' in s else str(s) for s in suggestions[:8]]
    print(json.dumps(texts))
except Exception as e:
    print(json.dumps([]))
`;
  try {
    const raw = (await runPython(script)) as string[];
    const response = GetSearchSuggestionsResponse.parse({ suggestions: raw });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "suggestions error");
    res.json({ suggestions: [] });
  }
});

router.get("/music/watch/:videoId", async (req, res) => {
  const { videoId } = GetWatchPlaylistParams.parse(req.params);
  const script = `
import json
from ytmusicapi import YTMusic
yt = YTMusic()
try:
    playlist = yt.get_watch_playlist(${JSON.stringify(videoId)}, limit=20)
    tracks = playlist.get('tracks', [])
    playlist_id = playlist.get('playlistId', None)
    print(json.dumps({'tracks': tracks, 'playlistId': playlist_id}))
except Exception as e:
    print(json.dumps({'tracks': [], 'playlistId': None}))
`;
  try {
    const raw = (await runPython(script)) as { tracks: Array<Record<string, unknown>>; playlistId: string | null };
    const tracks = (raw.tracks ?? []).filter((r) => r.videoId).map(normalizeTrack);
    const response = GetWatchPlaylistResponse.parse({ tracks, playlistId: raw.playlistId ?? null });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "watch playlist error");
    res.json({ tracks: [], playlistId: null });
  }
});

export default router;
