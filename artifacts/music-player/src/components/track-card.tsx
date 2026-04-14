import { Track } from "@workspace/api-client-react";
import { usePlayer } from "@/contexts/player-context";
import { Play, Heart } from "lucide-react";
import { useState } from "react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23222'/%3E%3Ccircle cx='24' cy='24' r='10' fill='%23444'/%3E%3Ccircle cx='24' cy='24' r='4' fill='%23222'/%3E%3C/svg%3E";

interface TrackCardProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  compact?: boolean;
}

export function TrackCard({ track, index, showIndex = false, compact = false }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, toggleLike, isLiked } = usePlayer();
  const [imgError, setImgError] = useState(false);
  const isCurrent = currentTrack?.videoId === track.videoId;
  const liked = isLiked(track.videoId);

  const thumbnail = imgError ? FALLBACK_IMG : (track.thumbnails?.[track.thumbnails.length > 1 ? 1 : 0]?.url || FALLBACK_IMG);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(track);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track);
  };

  return (
    <div
      className={`group flex items-center ${compact ? "p-2" : "p-3"} rounded-lg hover:bg-white/5 transition-all duration-150 cursor-pointer border border-transparent hover:border-white/5 ${isCurrent ? "bg-white/5 border-white/5" : ""}`}
      onClick={handlePlay}
    >
      {showIndex && (
        <div className="w-8 flex justify-center text-sm text-white/40 group-hover:text-white mr-2 tabular-nums shrink-0">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-[2px] h-3">
              <div className="w-[3px] bg-white rounded-full animate-[bounce_0.8s_0.1s_ease-in-out_infinite]" style={{ height: "100%" }}></div>
              <div className="w-[3px] bg-white rounded-full animate-[bounce_0.8s_0.25s_ease-in-out_infinite]" style={{ height: "66%" }}></div>
              <div className="w-[3px] bg-white rounded-full animate-[bounce_0.8s_0.4s_ease-in-out_infinite]" style={{ height: "100%" }}></div>
            </div>
          ) : (
            <>
              <span className="group-hover:hidden">{index}</span>
              <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current" />
            </>
          )}
        </div>
      )}

      <div className={`relative ${compact ? "w-10 h-10" : "w-12 h-12"} rounded-md bg-white/10 overflow-hidden shrink-0 mr-3`}>
        <img
          src={thumbnail}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {!showIndex && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
            <Play className="w-4 h-4 text-white fill-current" />
          </div>
        )}
        {isCurrent && !showIndex && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {isPlaying ? (
              <div className="flex items-end gap-[2px] h-3">
                <div className="w-[3px] bg-white rounded-full animate-[bounce_0.8s_0.1s_ease-in-out_infinite]" style={{ height: "100%" }}></div>
                <div className="w-[3px] bg-white rounded-full animate-[bounce_0.8s_0.25s_ease-in-out_infinite]" style={{ height: "66%" }}></div>
                <div className="w-[3px] bg-white rounded-full animate-[bounce_0.8s_0.4s_ease-in-out_infinite]" style={{ height: "100%" }}></div>
              </div>
            ) : (
              <Play className="w-4 h-4 text-white fill-current" />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className={`${compact ? "text-xs" : "text-sm"} font-medium truncate ${isCurrent ? "text-white" : "text-white/90 group-hover:text-white"} transition-colors`}>
          {track.title}
        </div>
        <div className={`${compact ? "text-[10px]" : "text-xs"} text-white/50 truncate mt-0.5 group-hover:text-white/70 transition-colors`}>
          {track.artists?.map((a: { name?: string }) => a.name).join(", ")}
          {!compact && track.album?.name ? <span className="text-white/30"> · {track.album.name}</span> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleLike}
          className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${liked ? "text-white" : "text-white/40"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
        </button>
        {track.duration && !compact && (
          <span className="text-xs text-white/30 tabular-nums w-10 text-right">{track.duration}</span>
        )}
      </div>
      {compact && track.duration && (
        <span className="text-[10px] text-white/30 ml-2 tabular-nums">{track.duration}</span>
      )}
    </div>
  );
}
