import { useGetCharts } from "@workspace/api-client-react";
import { TrackCard } from "./track-card";
import { usePlayer } from "@/contexts/player-context";
import { getWatchPlaylist } from "@workspace/api-client-react";
import { TopArtist } from "@workspace/api-client-react";
import { useState } from "react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23222' rx='30'/%3E%3Ccircle cx='30' cy='24' r='10' fill='%23444'/%3E%3Cellipse cx='30' cy='46' rx='16' ry='10' fill='%23444'/%3E%3C/svg%3E";

export function ChartsSection() {
  const { data: charts, isLoading } = useGetCharts(
    { country: "US" },
    { query: { queryKey: ["charts", "US"] } }
  );
  const { playTrack, setQueue } = usePlayer();
  const [tab, setTab] = useState<"songs" | "artists">("songs");

  const handleSelectTrack = async (track: any, tracks: any[]) => {
    playTrack(track);
    try {
      const res = await getWatchPlaylist(track.videoId);
      if (res?.tracks?.length) {
        setQueue(res.tracks);
      } else {
        setQueue(tracks);
      }
    } catch {
      setQueue(tracks);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded-md"></div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const hasSongs = (charts as any)?.chartTracks && (charts as any).chartTracks.length > 0;
  const hasArtists = (charts as any)?.topArtists && (charts as any).topArtists.length > 0;

  if (!hasSongs && !hasArtists) {
    return (
      <div className="text-center py-20 text-white/40 text-sm">
        Charts data unavailable right now.
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Tab selector */}
      <div className="flex items-center gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("songs")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === "songs" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
        >
          Top Songs
        </button>
        <button
          onClick={() => setTab("artists")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === "artists" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
        >
          Top Artists
        </button>
      </div>

      {tab === "songs" && hasSongs && charts && (
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-bold text-white tracking-tight">{charts.featuredTitle}</h2>
            <span className="text-xs text-white/30 uppercase tracking-wider">US · {charts.chartTracks.length} tracks</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
            {(charts as any).chartTracks.slice(0, 30).map((track: any, i: number) => (
              <div
                key={track.videoId + i}
                onClick={() => handleSelectTrack(track, charts.chartTracks)}
              >
                <TrackCard track={track} index={i + 1} showIndex />
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "artists" && hasArtists && charts && (
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-bold text-white tracking-tight">Top Artists</h2>
            <span className="text-xs text-white/30 uppercase tracking-wider">US · Trending</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {((charts as any)?.topArtists || []).slice(0, 20).map((artist: any, i: number) => (
              <ArtistCard key={artist.browseId + i} artist={artist as any} rank={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ArtistCard({ artist, rank }: { artist: TopArtist; rank: number }) {
  const [imgError, setImgError] = useState(false);
  const thumbnail = imgError ? FALLBACK_IMG : (artist.thumbnails?.[artist.thumbnails.length > 1 ? 1 : 0]?.url || FALLBACK_IMG);

  const trendColor =
    artist.trend === "up" ? "text-green-400" :
    artist.trend === "down" ? "text-red-400" :
    "text-white/30";

  const trendIcon = artist.trend === "up" ? "↑" : artist.trend === "down" ? "↓" : "—";

  return (
    <div className="group flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer text-center">
      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
        <img
          src={thumbnail}
          alt={artist.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute top-0 left-0 w-5 h-5 bg-black/80 rounded-br-lg flex items-center justify-center">
          <span className="text-[9px] text-white/60 font-bold">{rank}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-white truncate w-full">{artist.title}</p>
      {artist.subscribers && (
        <p className="text-xs text-white/40 mt-0.5">{artist.subscribers}</p>
      )}
      {artist.trend && (
        <span className={`text-xs mt-1 font-medium ${trendColor}`}>{trendIcon}</span>
      )}
    </div>
  );
}
