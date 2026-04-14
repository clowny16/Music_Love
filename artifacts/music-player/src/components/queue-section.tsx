import { usePlayer } from "@/contexts/player-context";
import { TrackCard } from "./track-card";
import { ListMusic } from "lucide-react";

export function QueueSection() {
  const { queue, currentTrack, playTrack } = usePlayer();

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ListMusic className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Queue is empty</h3>
        <p className="text-white/40 text-sm max-w-xs">
          Play a song or search for music to build your queue.
        </p>
      </div>
    );
  }

  // Find where we are in the queue
  const currentIndex = currentTrack 
    ? queue.findIndex(t => t.videoId === currentTrack.videoId)
    : -1;

  const upcomingTracks = currentIndex >= 0 
    ? queue.slice(currentIndex + 1)
    : queue;

  const previousTracks = currentIndex > 0
    ? queue.slice(0, currentIndex)
    : [];

  return (
    <div className="space-y-10 pb-10 max-w-3xl mx-auto">
      {currentTrack && (
        <section>
          <h2 className="text-lg font-semibold text-white/80 mb-4 px-2 uppercase tracking-wider text-xs">Now Playing</h2>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2 shadow-lg shadow-black/50">
            <div onClick={() => playTrack(currentTrack)}>
              <TrackCard track={currentTrack} />
            </div>
          </div>
        </section>
      )}

      {upcomingTracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white/80 mb-4 px-2 uppercase tracking-wider text-xs">Up Next</h2>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
            {upcomingTracks.map((track, i) => (
              <div key={track.videoId + i} onClick={() => playTrack(track)}>
                <TrackCard track={track} index={currentIndex + 2 + i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {previousTracks.length > 0 && (
        <section className="opacity-50 hover:opacity-100 transition-opacity">
          <h2 className="text-lg font-semibold text-white/80 mb-4 px-2 uppercase tracking-wider text-xs">Previously Played</h2>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
            {previousTracks.map((track, i) => (
              <div key={track.videoId + i} onClick={() => playTrack(track)}>
                <TrackCard track={track} index={i + 1} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
