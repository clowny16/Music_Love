import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Track } from "@workspace/api-client-react";

const MAX_HISTORY = 50;

interface LikedSong {
  track: Track;
  likedAt: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  recentlyPlayed: Track[];
  likedSongs: LikedSong[];
  currentTime: number;
  duration: number;
  volume: number;
  nowPlayingOpen: boolean;
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (level: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  toggleLike: (track: Track) => void;
  isLiked: (videoId: string) => boolean;
  setNowPlayingOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

function loadLikedSongs(): LikedSong[] {
  try {
    const raw = localStorage.getItem("liked_songs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLikedSongs(songs: LikedSong[]) {
  try {
    localStorage.setItem("liked_songs", JSON.stringify(songs));
  } catch {}
}

function loadRecentlyPlayed(): Track[] {
  try {
    const raw = localStorage.getItem("recently_played");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentlyPlayed(tracks: Track[]) {
  try {
    localStorage.setItem("recently_played", JSON.stringify(tracks.slice(0, MAX_HISTORY)));
  } catch {}
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<any>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => loadRecentlyPlayed());
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>(() => loadLikedSongs());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const currentTrackRef = useRef<Track | null>(null);

  const addToRecentlyPlayed = useCallback((track: Track) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.videoId !== track.videoId);
      const updated = [track, ...filtered].slice(0, MAX_HISTORY);
      saveRecentlyPlayed(updated);
      return updated;
    });
  }, []);

  const playTrack = useCallback(async (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    addToRecentlyPlayed(track);
    
    // Set the track as the first item in the queue and fetch more (Autoplay)
    setQueueState([track]);

    if (playerRef.current) {
      playerRef.current.loadVideoById(track.videoId);
    }

    try {
      // Auto-populate queue with related tracks
      const res = await fetch(`/api/music/watch/${track.videoId}`).then(r => r.json());
      if (res && res.tracks) {
        setQueueState(prev => {
          const combined = [...prev, ...res.tracks.filter((t: Track) => t.videoId !== track.videoId)];
          // Deduplicate
          const seen = new Set();
          return combined.filter(t => {
            const duplicate = seen.has(t.videoId);
            seen.add(t.videoId);
            return !duplicate;
          }).slice(0, 50);
        });
      }
    } catch (e) {
      console.error("Failed to fetch related tracks", e);
    }
  }, [addToRecentlyPlayed]);

  const pause = useCallback(() => {
    if (playerRef.current) playerRef.current.pauseVideo();
  }, []);

  const resume = useCallback(() => {
    if (playerRef.current) playerRef.current.playVideo();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((level: number) => {
    if (playerRef.current) playerRef.current.setVolume(level);
    setVolumeState(level);
  }, []);

  const nextTrack = useCallback(() => {
    const q = [...queue]; // Use the latest queue from state
    const ct = currentTrackRef.current;
    if (!ct || q.length === 0) return;

    const currentIdx = q.findIndex((t) => t.videoId === ct.videoId);
    
    if (currentIdx >= 0 && currentIdx < q.length - 1) {
      const next = q[currentIdx + 1];
      setCurrentTrack(next);
      if (playerRef.current) {
        playerRef.current.loadVideoById(next.videoId);
      }
    } else if (q.length > 0) {
      // End of queue: maybe fetch more? For now just reset
      // or loop
    }
  }, [queue]); // Depend on queue state

  const previousTrack = useCallback(() => {
    if (currentTime > 3 && playerRef.current) {
      playerRef.current.seekTo(0, true);
      setCurrentTime(0);
      return;
    }
    setQueueState((q) => {
      setCurrentTrack((ct) => {
        const currentIdx = ct ? q.findIndex((t) => t.videoId === ct.videoId) : -1;
        if (currentIdx > 0) {
          const prev = q[currentIdx - 1];
          addToRecentlyPlayed(prev);
          if (playerRef.current) playerRef.current.loadVideoById(prev.videoId);
          return prev;
        }
        return ct;
      });
      return q;
    });
  }, [currentTime, addToRecentlyPlayed]);

  // Sync ref with state
  useEffect(() => {
    currentTrackRef.current = currentTrack;
    
    // Media Session API for mobile/background control
    if ('mediaSession' in navigator && currentTrack) {
      const track = currentTrack;
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album?.name || 'YouTube Music',
        artwork: track.thumbnails.map(t => ({
          src: t.url || '',
          sizes: `${t.width}x${t.height}`,
          type: 'image/jpeg'
        }))
      });
    }
  }, [currentTrack]);

  // Media Session Action Handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => resume());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => previousTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seekTo(details.seekTime);
      });
    }
  }, [resume, pause, nextTrack, previousTrack, seekTo]);

  const nextTrackRef = useRef(nextTrack);
  useEffect(() => { nextTrackRef.current = nextTrack; }, [nextTrack]);

  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        const newPlayer = new window.YT.Player("youtube-player-container", {
          height: "1",
          width: "1",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            rel: 0,
            showinfo: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
              playerRef.current = event.target;
              event.target.setVolume(volume);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setDuration(event.target.getDuration());
                if (!intervalRef.current) {
                  intervalRef.current = window.setInterval(() => {
                    if (playerRef.current) {
                      setCurrentTime(playerRef.current.getCurrentTime());
                    }
                  }, 500);
                }
              } else {
                setIsPlaying(false);
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                if (event.data === window.YT.PlayerState.ENDED) {
                  nextTrackRef.current();
                }
              }
            },
          },
        });
        void newPlayer;
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const setQueue = useCallback((tracks: Track[]) => { setQueueState(tracks); }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueueState((prev) => {
      if (!prev.find((t) => t.videoId === track.videoId)) return [...prev, track];
      return prev;
    });
  }, []);

  const toggleLike = useCallback((track: Track) => {
    setLikedSongs((prev) => {
      const exists = prev.find((s) => s.track.videoId === track.videoId);
      const updated = exists
        ? prev.filter((s) => s.track.videoId !== track.videoId)
        : [...prev, { track, likedAt: Date.now() }];
      saveLikedSongs(updated);
      return updated;
    });
  }, []);

  const isLiked = useCallback((videoId: string) => {
    return likedSongs.some((s) => s.track.videoId === videoId);
  }, [likedSongs]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, isPlaying, queue, recentlyPlayed, likedSongs,
        currentTime, duration, volume, nowPlayingOpen,
        playTrack, pause, resume, seekTo, setVolume,
        nextTrack, previousTrack, setQueue, addToQueue,
        toggleLike, isLiked, setNowPlayingOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
