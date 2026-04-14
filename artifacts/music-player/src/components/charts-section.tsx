import { useGetCharts } from "@workspace/api-client-react";
import { TrackCard } from "./track-card";
import { usePlayer } from "@/contexts/player-context";
import { getWatchPlaylist } from "@workspace/api-client-react";

export function ChartsSection() {
  const { data: charts, isLoading } = useGetCharts(
    { country: 'US' },
    { query: { queryKey: ['charts', 'US'] } }
  );

  const { playTrack, setQueue } = usePlayer();

  const handleSelectTrack = async (track: any, tracks: any[]) => {
    playTrack(track);
    try {
      const res = await getWatchPlaylist(track.videoId);
      if (res && res.tracks) {
        setQueue(res.tracks);
      } else {
        setQueue(tracks);
      }
    } catch (e) {
      setQueue(tracks);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-white/10 rounded-md"></div>
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!charts) return null;

  return (
    <div className="space-y-12 pb-10">
      {charts.topSongs && charts.topSongs.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Top Songs</h2>
            <span className="text-sm text-white/40">US Charts</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
            {charts.topSongs.slice(0, 10).map((track, i) => (
              <div key={track.videoId + i} onClick={() => handleSelectTrack(track, charts.topSongs)}>
                <TrackCard track={track} index={i + 1} showIndex />
              </div>
            ))}
          </div>
        </section>
      )}

      {charts.trending && charts.trending.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Trending Now</h2>
            <span className="text-sm text-white/40">Global</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
            {charts.trending.slice(0, 10).map((track, i) => (
              <div key={track.videoId + i} onClick={() => handleSelectTrack(track, charts.trending)}>
                <TrackCard track={track} index={i + 1} showIndex />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
