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
  GetAlbumParams,
  GetAlbumResponse,
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
          reject(new Error(`JSON parse error: ${stdout.slice(0, 200)}`));
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
    videos = charts.get('videos', [])
    artists_raw = charts.get('artists', [])
    
    chart_tracks = []
    featured_title = ''
    
    # Fetch tracks from the first featured playlist
    if videos:
        featured = videos[0]
        featured_title = featured.get('title', 'Top Charts')
        playlist_id = featured.get('playlistId', '')
        if playlist_id:
            try:
                pl = yt.get_playlist(playlist_id, limit=30)
                chart_tracks = pl.get('tracks', [])
            except:
                pass
    
    # Normalize artists
    top_artists = []
    for a in artists_raw[:20]:
        top_artists.append({
            'title': a.get('title', ''),
            'browseId': a.get('browseId', ''),
            'subscribers': a.get('subscribers', None),
            'thumbnails': a.get('thumbnails', []),
            'rank': a.get('rank', None),
            'trend': a.get('trend', None),
        })
    
    print(json.dumps({
        'chartTracks': chart_tracks,
        'topArtists': top_artists,
        'featuredTitle': featured_title,
        'country': ${JSON.stringify(country)}
    }))
except Exception as e:
    print(json.dumps({'chartTracks': [], 'topArtists': [], 'featuredTitle': 'Charts', 'country': ${JSON.stringify(country)}}))
`;
  try {
    const raw = (await runPython(script)) as {
      chartTracks: Array<Record<string, unknown>>;
      topArtists: Array<{ title: string; browseId: string; subscribers?: string; thumbnails: Array<{ url: string; width?: number; height?: number }>; rank?: string; trend?: string }>;
      featuredTitle: string;
      country: string;
    };
    const chartTracks = (raw.chartTracks ?? []).filter((r) => r.videoId).map(normalizeTrack);
    const topArtists = (raw.topArtists ?? []).map((a) => ({
      title: a.title,
      browseId: a.browseId,
      subscribers: a.subscribers ?? null,
      thumbnails: normalizeThumbnails(a.thumbnails ?? []),
      rank: a.rank ?? null,
      trend: a.trend ?? null,
    }));
    const response = GetChartsResponse.parse({
      chartTracks,
      topArtists,
      featuredTitle: raw.featuredTitle ?? "Top Charts",
      country,
    });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "charts error");
    res.json({ chartTracks: [], topArtists: [], featuredTitle: "Charts", country });
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
    texts = []
    for s in suggestions[:8]:
        if isinstance(s, str):
            texts.append(s)
        elif isinstance(s, dict):
            suggestion = s.get('suggestion', {})
            if isinstance(suggestion, dict):
                runs = suggestion.get('runs', [])
                text = ''.join(r.get('text', '') for r in runs if isinstance(r, dict))
                if text:
                    texts.append(text)
            elif isinstance(suggestion, str):
                texts.append(suggestion)
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

router.get("/music/album/:albumId", async (req, res) => {
  const { albumId } = GetAlbumParams.parse(req.params);
  const script = `
import json
from ytmusicapi import YTMusic
yt = YTMusic()
try:
    album = yt.get_album(${JSON.stringify(albumId)})
    tracks_raw = album.get('tracks', [])
    thumbnails = album.get('thumbnails', [])
    
    # Get artist name
    artists_raw = album.get('artists', [])
    artist = artists_raw[0].get('name', 'Unknown') if artists_raw else album.get('artist', 'Unknown')
    
    tracks = []
    for t in tracks_raw:
        vid = t.get('videoId', '')
        if not vid:
            continue
        t_artists = t.get('artists', [])
        if not t_artists:
            t_artists = artists_raw
        tracks.append({
            'videoId': vid,
            'title': t.get('title', 'Unknown'),
            'artists': t_artists,
            'album': {'name': album.get('title', ''), 'id': ${JSON.stringify(albumId)}},
            'duration': t.get('duration', None),
            'duration_seconds': t.get('duration_seconds', None),
            'thumbnails': thumbnails,
            'isExplicit': t.get('isExplicit', False),
        })
    
    result = {
        'albumId': ${JSON.stringify(albumId)},
        'title': album.get('title', 'Unknown Album'),
        'artist': artist,
        'year': str(album.get('year', '')) if album.get('year') else None,
        'thumbnails': thumbnails,
        'tracks': tracks,
        'trackCount': len(tracks),
        'description': album.get('description', None),
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'albumId': ${JSON.stringify(albumId)}, 'title': 'Unknown', 'artist': 'Unknown', 'year': None, 'thumbnails': [], 'tracks': [], 'trackCount': 0, 'description': None}))
`;
  try {
    const raw = (await runPython(script)) as {
      albumId: string;
      title: string;
      artist: string;
      year?: string | null;
      thumbnails: Array<{ url: string; width?: number; height?: number }>;
      tracks: Array<Record<string, unknown>>;
      trackCount: number;
      description?: string | null;
    };
    const tracks = (raw.tracks ?? []).filter((r) => r.videoId).map(normalizeTrack);
    const response = GetAlbumResponse.parse({
      albumId: raw.albumId,
      title: raw.title,
      artist: raw.artist,
      year: raw.year ?? null,
      thumbnails: normalizeThumbnails(raw.thumbnails ?? []),
      tracks,
      trackCount: raw.trackCount,
      description: raw.description ?? null,
    });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "album error");
    res.status(500).json({ error: "Failed to get album" });
  }
});

export default router;
