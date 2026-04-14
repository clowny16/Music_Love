import { usePlayer } from "@/contexts/player-context";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, Heart } from "lucide-react";
import { useState, useEffect } from "react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23222' rx='6'/%3E%3Ccircle cx='28' cy='28' r='10' fill='%23444'/%3E%3Ccircle cx='28' cy='28' r='4' fill='%23222'/%3E%3C/svg%3E";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack, isPlaying, currentTime, duration, volume,
    pause, resume, seekTo, setVolume, nextTrack, previousTrack,
    toggleLike, isLiked, setNowPlayingOpen,
  } = usePlayer();

  const [localTime, setLocalTime] = useState(currentTime);
  const [isSeeking, setIsSeeking] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isSeeking) setLocalTime(currentTime);
  }, [currentTime, isSeeking]);

  useEffect(() => {
    setImgError(false);
  }, [currentTrack?.videoId]);

  const thumbnail = imgError ? FALLBACK_IMG : (currentTrack?.thumbnails?.[currentTrack.thumbnails.length > 1 ? 1 : 0]?.url || FALLBACK_IMG);
  const liked = currentTrack ? isLiked(currentTrack.videoId) : false;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/96 backdrop-blur-xl border-t border-white/[0.06]">
      {/* Progress bar - thin line at very top */}
      <div className="h-[2px] bg-white/5 w-full">
        <div
          className="h-full bg-white/40 transition-all duration-500"
          style={{ width: duration > 0 ? `${(localTime / duration) * 100}%` : "0%" }}
        />
      </div>

      <div className="flex items-center px-4 h-[68px] gap-4">
        {/* Track Info */}
        <div
          className="flex items-center w-[30%] min-w-0 cursor-pointer group"
          onClick={() => currentTrack && setNowPlayingOpen(true)}
        >
          <div className="w-11 h-11 bg-white/5 rounded-md overflow-hidden mr-3 shrink-0 shadow-md">
            <img
              src={currentTrack ? thumbnail : FALLBACK_IMG}
              alt={currentTrack?.title || ""}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
          {currentTrack ? (
            <div className="flex flex-col min-w-0 mr-2">
              <h4 className="text-[13px] font-medium text-white truncate group-hover:underline decoration-white/40 underline-offset-2">
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-white/50 truncate mt-0.5">
                {currentTrack.artists?.map((a: { name?: string }) => a.name).join(", ")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse"></div>
              <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse"></div>
            </div>
          )}
          {currentTrack && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
              className={`p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0 ${liked ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[500px] mx-auto">
          <div className="flex items-center gap-5 mb-1.5">
            <button
              onClick={previousTrack}
              disabled={!currentTrack}
              className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => isPlaying ? pause() : resume()}
              disabled={!currentTrack}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 hover:scale-105 transition-all shadow-md disabled:opacity-30"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={nextTrack}
              disabled={!currentTrack}
              className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="flex items-center w-full gap-2">
            <span className="text-[10px] text-white/40 w-8 text-right tabular-nums">{formatTime(localTime)}</span>
            <Slider
              value={[localTime]}
              max={duration || 100}
              step={0.5}
              onPointerDown={() => setIsSeeking(true)}
              onValueChange={(val) => setLocalTime(val[0])}
              onValueCommit={(val) => { setIsSeeking(false); seekTo(val[0]); }}
              disabled={!currentTrack}
              className="flex-1 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:opacity-0 [&:hover_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity [&_[data-orientation=horizontal]]:h-[3px] [&:hover_[data-orientation=horizontal]]:h-[4px] [&_[data-orientation=horizontal]]:transition-all"
            />
            <span className="text-[10px] text-white/40 w-8 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume + Open Now Playing */}
        <div className="flex items-center justify-end w-[25%] min-w-0 gap-2">
          <button onClick={() => setVolume(volume > 0 ? 0 : 80)} className="text-white/40 hover:text-white transition-colors shrink-0">
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="w-20">
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:opacity-0 [&:hover_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity [&_[data-orientation=horizontal]]:h-[3px]"
            />
          </div>
          <button
            onClick={() => currentTrack && setNowPlayingOpen(true)}
            disabled={!currentTrack}
            className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 shrink-0"
            title="Now Playing"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
