import { Track } from "@workspace/api-client-react";
import { usePlayer } from "@/contexts/player-context";
import { useState } from "react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23222'/%3E%3Ccircle cx='24' cy='24' r='10' fill='%23444'/%3E%3Ccircle cx='24' cy='24' r='4' fill='%23222'/%3E%3C/svg%3E";

interface TrackCardProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
}

export function TrackCard({ track, index, showIndex = false }: TrackCardProps) {
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
      className={`group flex items-center p-3 gap-4 rounded-3xl transition-all duration-300 cursor-pointer border-2 ${isCurrent ? "bg-surface-container-high border-primary-container/20 shadow-lg shadow-black/40" : "bg-surface-container-low border-transparent hover:bg-surface-container-high hover:border-white/10"}`}
      onClick={handlePlay}
    >
      {showIndex && (
        <div className="w-8 flex justify-center text-sm font-black text-neutral-600 group-hover:text-primary transition-colors tabular-nums">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-[2.5px] h-3">
              <div className="w-[3px] bg-primary animate-[bounce_1s_infinite]" style={{ height: "100%" }} />
              <div className="w-[3px] bg-primary animate-[bounce_1s_0.2s_infinite]" style={{ height: "60%" }} />
              <div className="w-[3px] bg-primary animate-[bounce_1s_0.4s_infinite]" style={{ height: "80%" }} />
            </div>
          ) : (
            <span>{index}</span>
          )}
        </div>
      )}

      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 relative shrink-0">
        <img
          src={thumbnail}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <span className="material-symbols-outlined text-white text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isCurrent && isPlaying ? "pause" : "play_arrow"}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`font-black text-sm truncate font-heading transition-colors ${isCurrent ? "text-primary" : "text-neutral-200 group-hover:text-white"}`}>
          {track.title}
        </h4>
        <p className="text-xs text-neutral-500 truncate font-semibold mt-0.5">
          {track.artists?.map((a: { name?: string }) => a.name).join(", ")}
          {track.album?.name && <span className="text-neutral-700"> · {track.album.name}</span>}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`material-symbols-outlined transition-all p-2 rounded-full hover:bg-white/5 ${liked ? "text-primary fill-current" : "text-neutral-600 hover:text-neutral-200"}`}
          style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
        >
          favorite
        </button>
        {track.duration && (
          <span className="text-[10px] font-black text-neutral-600 tabular-nums w-12 text-right tracking-widest whitespace-nowrap">
            {track.duration}
          </span>
        )}
      </div>
    </div>
  );
}
