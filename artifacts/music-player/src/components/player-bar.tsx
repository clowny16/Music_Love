import { usePlayer } from "@/contexts/player-context";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack
  } = usePlayer();

  const [localTime, setLocalTime] = useState(currentTime);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = (val: number[]) => {
    setIsSeeking(false);
    seekTo(val[0]);
  };

  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(100);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 flex items-center px-4 z-50">
      {/* Track Info */}
      <div className="flex items-center w-1/4 min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 bg-white/5 rounded-md overflow-hidden mr-4 shrink-0 shadow-lg">
              <img 
                src={currentTrack.thumbnails?.[0]?.url || ""} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0 pr-4">
              <h4 className="text-sm font-medium text-white truncate hover:underline cursor-pointer transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/60 truncate hover:text-white/80 cursor-pointer transition-colors mt-0.5">
                {currentTrack.artists?.map(a => a.name).join(", ")}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center text-white/40 text-sm">
            <div className="w-14 h-14 bg-white/5 rounded-md mr-4 animate-pulse"></div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-white/5 rounded animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-[600px] mx-auto">
        <div className="flex items-center gap-6 mb-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={previousTrack} disabled={!currentTrack}>
            <SkipBack className="w-4 h-4 fill-current" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-md"
            onClick={togglePlay}
            disabled={!currentTrack}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={nextTrack} disabled={!currentTrack}>
            <SkipForward className="w-4 h-4 fill-current" />
          </Button>
        </div>
        
        <div className="flex items-center w-full gap-3">
          <span className="text-xs text-white/50 w-10 text-right tabular-nums">
            {formatTime(localTime)}
          </span>
          <Slider 
            value={[localTime]} 
            max={duration || 100} 
            step={1}
            onPointerDown={handleSeekStart}
            onValueChange={(val) => setLocalTime(val[0])}
            onValueCommit={handleSeekEnd}
            disabled={!currentTrack}
            className="flex-1 cursor-pointer [&_[role=slider]]:opacity-0 [&:hover_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity [&_[data-orientation=horizontal]]:h-1 [&:hover_[data-orientation=horizontal]]:h-1.5 [&_[data-orientation=horizontal]]:transition-all"
          />
          <span className="text-xs text-white/50 w-10 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end w-1/4 min-w-[150px] gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-transparent" onClick={toggleMute}>
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <div className="w-24">
          <Slider 
            value={[volume]} 
            max={100} 
            step={1}
            onValueChange={handleVolumeChange}
            className="cursor-pointer [&_[role=slider]]:opacity-0 [&:hover_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity [&_[data-orientation=horizontal]]:h-1 [&:hover_[data-orientation=horizontal]]:h-1.5 [&_[data-orientation=horizontal]]:transition-all"
          />
        </div>
      </div>
    </div>
  );
}
