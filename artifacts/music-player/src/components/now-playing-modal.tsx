import { usePlayer } from "@/contexts/player-context";
import { Slider } from "@/components/ui/slider";
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

  if (!nowPlayingOpen || !currentTrack) return null;

  const thumbnail = imgError
    ? FALLBACK_IMG
    : (currentTrack?.thumbnails?.[currentTrack.thumbnails.length > 1 ? currentTrack.thumbnails.length - 1 : 0]?.url || FALLBACK_IMG);

  const liked = isLiked(currentTrack.videoId);
  const progressPercent = duration > 0 ? (localTime / duration) * 100 : 0;
  
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0c0c0c] flex flex-col items-center justify-between py-12 px-6 overflow-hidden animate-in fade-in zoom-in-95 duration-500"
    >
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0">
        <img src={thumbnail} className="w-full h-full object-cover opacity-20 blur-[120px] scale-150" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0c0c0c]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center relative z-10">
        <button 
          onClick={() => setNowPlayingOpen(false)}
          className="material-symbols-outlined p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          expand_more
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">Now Playing</p>
          <p className="text-sm font-bold text-neutral-400 font-heading">{currentTrack.album?.name || "Single"}</p>
        </div>
        <button className="material-symbols-outlined p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
          more_vert
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl gap-12 relative z-10">
        <div className="relative group">
           <div 
            className={`w-64 h-64 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-1000 ${isPlaying ? "scale-105" : "scale-100 grayscale-[0.2]"}`}
          >
            <img src={thumbnail} className="w-full h-full object-cover" alt={currentTrack.title} />
          </div>
          {/* Decorative Ring */}
          <div className={`absolute -inset-4 border border-primary/20 rounded-[2.5rem] -z-10 transition-all duration-1000 ${isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90"}`} />
        </div>

        <div className="text-center space-y-2 max-w-2xl px-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white font-heading animate-in slide-in-from-bottom-4 duration-700">
            {currentTrack.title}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <p className="text-xl md:text-2xl font-bold text-primary transition-colors hover:text-white cursor-pointer">
              {currentTrack.artists?.[0]?.name}
            </p>
            <button 
              onClick={() => toggleLike(currentTrack)}
              className={`material-symbols-outlined text-2xl transition-all ${liked ? "text-primary fill-current scale-110" : "text-neutral-600 hover:text-neutral-200"}`}
              style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </button>
          </div>
        </div>
      </main>

      {/* Footer / Controls */}
      <footer className="w-full max-w-3xl space-y-8 relative z-10">
        <div className="space-y-4">
          <Slider
            value={[localTime]}
            max={duration || 100}
            step={1}
            onPointerDown={() => setIsSeeking(true)}
            onValueChange={(val) => setLocalTime(val[0])}
            onValueCommit={(val) => { setIsSeeking(false); seekTo(val[0]); }}
            className="cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[data-orientation=horizontal]]:h-1 hover:[&_[data-orientation=horizontal]]:h-2 transition-all"
          />
          <div className="flex justify-between text-xs font-black text-neutral-500 tabular-nums tracking-widest">
            <span>{formatTime(localTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button className="material-symbols-outlined text-neutral-500 hover:text-white transition-colors text-3xl">
            shuffle
          </button>
          
          <div className="flex items-center gap-12">
            <button 
              onClick={previousTrack}
              className="material-symbols-outlined text-4xl text-neutral-300 hover:text-white transition-all active:scale-75"
            >
              skip_previous
            </button>
            <button 
              onClick={() => isPlaying ? pause() : resume()}
              className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-2xl shadow-primary-container/20 hover:scale-110 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-5xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            <button 
              onClick={nextTrack}
              className="material-symbols-outlined text-4xl text-neutral-300 hover:text-white transition-all active:scale-75"
            >
              skip_next
            </button>
          </div>

          <button className="material-symbols-outlined text-neutral-500 hover:text-white transition-colors text-3xl">
            repeat
          </button>
        </div>

        {/* Extra Actions */}
        <div className="flex justify-center gap-10 pt-4">
          <button className="flex flex-col items-center gap-2 group transition-all">
            <span className="material-symbols-outlined text-neutral-500 group-hover:text-primary transition-colors">lyrics</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-600 group-hover:text-neutral-300 mt-1">Lyrics</span>
          </button>
          <button className="flex flex-col items-center gap-2 group transition-all">
            <span className="material-symbols-outlined text-neutral-500 group-hover:text-primary transition-colors">playlist_play</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-600 group-hover:text-neutral-300 mt-1">Up Next</span>
          </button>
          <button className="flex flex-col items-center gap-2 group transition-all" onClick={() => setVolume(volume === 0 ? 80 : 0)}>
            <span className="material-symbols-outlined text-neutral-500 group-hover:text-primary transition-colors">
              {volume === 0 ? "volume_off" : "volume_up"}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-600 group-hover:text-neutral-300 mt-1">Audio</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
