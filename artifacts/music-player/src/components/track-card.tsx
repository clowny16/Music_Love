import { Track } from "@workspace/api-client-react";
import { usePlayer } from "@/contexts/player-context";
import { Play } from "lucide-react";

interface TrackCardProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
}

export function TrackCard({ track, index, showIndex = false }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const isCurrent = currentTrack?.videoId === track.videoId;

  const handlePlay = () => {
    if (isCurrent) return;
    playTrack(track);
  };

  return (
    <div
      className={`group flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 ${isCurrent ? "bg-white/5 border-white/5" : ""}`}
      onClick={handlePlay}
    >
      {showIndex && (
        <div className="w-8 flex justify-center text-sm text-white/50 group-hover:text-white mr-2 tabular-nums">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-0.5 h-full bg-white animate-pulse" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-0.5 h-2/3 bg-white animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-0.5 h-full bg-white animate-pulse" style={{ animationDelay: "0.3s" }}></div>
            </div>
          ) : (
            <span className="group-hover:hidden">{index}</span>
          )}
          <Play className={`w-4 h-4 hidden group-hover:block ${isCurrent && isPlaying ? "!hidden" : ""}`} />
        </div>
      )}

      <div className="relative w-12 h-12 rounded bg-white/10 overflow-hidden shrink-0 mr-4">
        <img
          src={track.thumbnails?.[0]?.url || ""}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!showIndex && (
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-opacity">
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className={`text-sm font-medium truncate ${isCurrent ? "text-white" : "text-white/90 group-hover:text-white"}`}>
          {track.title}
        </div>
        <div className="text-xs text-white/50 truncate mt-0.5 group-hover:text-white/70">
          {track.artists?.map((a: { name?: string }) => a.name).join(", ")}
          {track.album?.name ? ` • ${track.album.name}` : ""}
        </div>
      </div>

      {track.duration && (
        <div className="text-xs text-white/40 ml-4 tabular-nums w-12 text-right">
          {track.duration}
        </div>
      )}
    </div>
  );
}
