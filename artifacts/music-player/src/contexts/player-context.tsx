import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Track } from "@workspace/api-client-react";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (level: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<any>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(100);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        const newPlayer = new window.YT.Player("youtube-player-container", {
          height: "200",
          width: "300",
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
            widget_referrer: window.location.origin
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
                    setCurrentTime(event.target.getCurrentTime());
                  }, 1000);
                }
              } else {
                setIsPlaying(false);
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                
                if (event.data === window.YT.PlayerState.ENDED) {
                  // Play next automatically
                  nextTrackRef.current();
                }
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    if (playerRef.current) {
      playerRef.current.loadVideoById(track.videoId);
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const resume = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.playVideo();
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((level: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(level);
    }
    setVolumeState(level);
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const currentIdx = currentTrack ? queue.findIndex(t => t.videoId === currentTrack.videoId) : -1;
      if (currentIdx >= 0 && currentIdx < queue.length - 1) {
        playTrack(queue[currentIdx + 1]);
      } else if (currentIdx === -1) {
        playTrack(queue[0]);
      }
    }
  }, [queue, currentTrack, playTrack]);

  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const previousTrack = useCallback(() => {
    if (queue.length > 0) {
      const currentIdx = currentTrack ? queue.findIndex(t => t.videoId === currentTrack.videoId) : -1;
      if (currentIdx > 0) {
        playTrack(queue[currentIdx - 1]);
      } else if (currentTime > 3 && playerRef.current) {
        playerRef.current.seekTo(0, true);
      }
    }
  }, [queue, currentTrack, currentTime, playTrack]);

  const setQueue = useCallback((tracks: Track[]) => {
    setQueueState(tracks);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueueState(prev => {
      if (!prev.find(t => t.videoId === track.videoId)) {
        return [...prev, track];
      }
      return prev;
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        currentTime,
        duration,
        volume,
        playTrack,
        pause,
        resume,
        seekTo,
        setVolume,
        nextTrack,
        previousTrack,
        setQueue,
        addToQueue
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
