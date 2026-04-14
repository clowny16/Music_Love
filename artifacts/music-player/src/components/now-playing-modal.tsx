import { usePlayer } from "@/contexts/player-context";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, X, Heart, Volume2, VolumeX, ListMusic } from "lucide-react";
import { useState, useEffect } from "react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23111'/%3E%3Ccircle cx='200' cy='200' r='80' fill='%23222'/%3E%3Ccircle cx='200' cy='200' r='30' fill='%23111'/%3E%3C/svg%3E";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NowPlayingModal() {
  const {
    currentTrack, isPlaying, currentTime, duration, volume,
    pause, resume, seekTo, setVolume, nextTrack, previousTrack,
    toggleLike, isLiked, nowPlayingOpen, setNowPlayingOpen, queue,
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

  if (!nowPlayingOpen) return null;

  const thumbnail = imgError
    ? FALLBACK_IMG
    : (currentTrack?.thumbnails?.[currentTrack.thumbnails.length > 1 ? currentTrack.thumbnails.length - 1 : 0]?.url || FALLBACK_IMG);

  const liked = currentTrack ? isLiked(currentTrack.videoId) : false;
  const progressPercent = duration > 0 ? (localTime / duration) * 100 : 0;
  const currentIdx = currentTrack ? queue.findIndex((t) => t.videoId === currentTrack.videoId) : -1;
  const upNext = currentIdx >= 0 && currentIdx < queue.length - 1 ? queue[currentIdx + 1] : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <button
        onClick={() => setNowPlayingOpen(false)}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-4xl mx-auto px-8 flex flex-col md:flex-row items-center gap-12">
        {/* Album Art */}
        <div className="flex-shrink-0">
          <div
            className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
            style={{
              boxShadow: isPlaying ? "0 0 80px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.8)" : "0 40px 80px rgba(0,0,0,0.8)",
              transform: isPlaying ? "scale(1.02)" : "scale(1)",
              transition: "all 0.5s ease",
            }}
          >
            <img
              src={thumbnail}
              alt={currentTrack?.title || ""}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-white truncate leading-tight">
                  {currentTrack?.title || "Nothing playing"}
                </h2>
                <p className="text-white/50 mt-1 text-sm truncate">
                  {currentTrack?.artists?.map((a: { name?: string }) => a.name).join(", ") || ""}
                </p>
                {currentTrack?.album?.name && (
                  <p className="text-white/30 mt-0.5 text-xs truncate">{currentTrack.album.name}</p>
                )}
              </div>
              {currentTrack && (
                <button
                  onClick={() => toggleLike(currentTrack)}
                  className={`p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 ${liked ? "text-white" : "text-white/30"}`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <Slider
              value={[localTime]}
              max={duration || 100}
              step={0.5}
              onPointerDown={() => setIsSeeking(true)}
              onValueChange={(val) => setLocalTime(val[0])}
              onValueCommit={(val) => { setIsSeeking(false); seekTo(val[0]); }}
              disabled={!currentTrack}
              className="mb-2 cursor-pointer [&_[data-orientation=horizontal]]:h-1 [&:hover_[data-orientation=horizontal]]:h-1.5 [&_[data-orientation=horizontal]]:transition-all"
            />
            <div className="flex justify-between text-xs text-white/40 tabular-nums">
              <span>{formatTime(localTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <button
              onClick={previousTrack}
              disabled={!currentTrack}
              className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button
              onClick={() => isPlaying ? pause() : resume()}
              disabled={!currentTrack}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 hover:scale-105 transition-all shadow-lg disabled:opacity-30"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
            <button
              onClick={nextTrack}
              disabled={!currentTrack}
              className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setVolume(volume > 0 ? 0 : 80)} className="text-white/40 hover:text-white transition-colors">
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="flex-1 cursor-pointer [&_[data-orientation=horizontal]]:h-1"
            />
            <span className="text-xs text-white/30 w-8 text-right tabular-nums">{volume}</span>
          </div>

          {/* Up Next */}
          {upNext && (
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <ListMusic className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/30 uppercase tracking-wider">Up Next</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={upNext.thumbnails?.[0]?.url || FALLBACK_IMG}
                  alt={upNext.title}
                  className="w-9 h-9 rounded object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                />
                <div className="min-w-0">
                  <p className="text-sm text-white/70 truncate">{upNext.title}</p>
                  <p className="text-xs text-white/30 truncate">{upNext.artists?.map((a: { name?: string }) => a.name).join(", ")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          className="h-full bg-white/40 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
