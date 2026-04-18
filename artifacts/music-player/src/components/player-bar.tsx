import { usePlayer } from "@/contexts/player-context";
import { Slider } from "@/components/ui/slider";
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

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-[60] animate-in slide-in-from-bottom-10 backdrop-blur-3xl bg-surface-container-low/80 border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Progress Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div 
          className="h-full bg-primary-container transition-all duration-300"
          style={{ width: duration > 0 ? `${(localTime / duration) * 100}%` : "0%" }}
        />
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1 group" onClick={() => setNowPlayingOpen(true)}>
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0 relative">
            <img 
              src={thumbnail} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              onError={() => setImgError(true)}
            />
            {!isPlaying && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white">play_arrow</span></div>}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-neutral-100 truncate text-sm px-1 font-heading">{currentTrack.title}</h4>
            <p className="text-xs text-neutral-500 truncate px-1 font-medium">{currentTrack.artists?.[0]?.name || "Unknown Artist"}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
            className={`material-symbols-outlined transition-all p-2 rounded-full hover:bg-white/5 ${liked ? "text-primary fill-current" : "text-neutral-500 hover:text-neutral-200"}`}
            style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
          <div className="flex items-center gap-6">
            <button 
              onClick={previousTrack}
              className="material-symbols-outlined text-neutral-500 hover:text-neutral-100 transition-colors text-2xl active:scale-75"
            >
              skip_previous
            </button>
            <button 
              onClick={() => isPlaying ? pause() : resume()}
              className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-xl shadow-primary-container/20 hover:scale-110 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            <button 
              onClick={nextTrack}
              className="material-symbols-outlined text-neutral-500 hover:text-neutral-100 transition-colors text-2xl active:scale-75"
            >
              skip_next
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full px-2">
            <span className="text-[10px] font-bold text-neutral-500 tabular-nums w-8 text-right">{formatTime(localTime)}</span>
            <Slider
              value={[localTime]}
              max={duration || 100}
              step={1}
              onPointerDown={() => setIsSeeking(true)}
              onValueChange={(val) => setLocalTime(val[0])}
              onValueCommit={(val) => { setIsSeeking(false); seekTo(val[0]); }}
              className="flex-1 cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&_[data-orientation=horizontal]]:h-1 hover:[&_[data-orientation=horizontal]]:h-1.5 transition-all"
            />
            <span className="text-[10px] font-bold text-neutral-500 tabular-nums w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & More */}
        <div className="flex items-center justify-end gap-3 flex-1">
          <div className="hidden sm:flex items-center gap-2 group/vol">
            <button onClick={() => setVolume(volume > 0 ? 0 : 80)} className="material-symbols-outlined text-neutral-500 hover:text-neutral-100 transition-colors text-xl">
              {volume === 0 ? "volume_off" : volume < 50 ? "volume_down" : "volume_up"}
            </button>
            <div className="w-20 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(val) => setVolume(val[0])}
                className="cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5 [&_[role=slider]]:border-0 [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-white/10"
              />
            </div>
          </div>
          <button 
            className="material-symbols-outlined text-neutral-500 hover:text-neutral-100 p-2 rounded-full hover:bg-white/5 transition-all"
            onClick={() => setNowPlayingOpen(true)}
          >
            fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
