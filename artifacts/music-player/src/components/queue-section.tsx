import type { ReactNode } from "react";
import { usePlayer } from "@/contexts/player-context";
import { TrackCard } from "./track-card";
import { ListMusic, History } from "lucide-react";
import { useState } from "react";

export function QueueSection() {
  const { queue, recentlyPlayed, currentTrack, playTrack } = usePlayer();
  const [tab, setTab] = useState<"queue" | "recent">("queue");

  const currentIndex = currentTrack
    ? queue.findIndex((t) => t.videoId === currentTrack.videoId)
    : -1;

  const upcomingTracks = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;
  const previousTracks = currentIndex > 0 ? queue.slice(0, currentIndex) : [];

  const displayRecent = recentlyPlayed.slice(0, 30);

  return (
    <div className="pb-10 max-w-3xl mx-auto">
      {/* Tab selector */}
      <div className="flex items-center gap-1 mb-6 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("queue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "queue" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
        >
          <ListMusic className="w-4 h-4" />
          Queue {queue.length > 0 && <span className="text-xs opacity-60">({queue.length})</span>}
        </button>
        <button
          onClick={() => setTab("recent")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "recent" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
        >
          <History className="w-4 h-4" />
          Recently Played {displayRecent.length > 0 && <span className="text-xs opacity-60">({displayRecent.length})</span>}
        </button>
      </div>

      {tab === "queue" && (
        <>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-5">
                <ListMusic className="w-9 h-9 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Your queue is empty</h3>
              <p className="text-white/40 text-sm max-w-xs">Play a song to start building your queue.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {currentTrack && (
                <section>
                  <SectionLabel>Now Playing</SectionLabel>
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2 shadow-lg shadow-black/50">
                    <TrackCard track={currentTrack} />
                  </div>
                </section>
              )}

              {upcomingTracks.length > 0 && (
                <section>
                  <SectionLabel>Up Next · {upcomingTracks.length} songs</SectionLabel>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
                    {upcomingTracks.map((track, i) => (
                      <div key={track.videoId + i} onClick={() => playTrack(track)}>
                        <TrackCard track={track} index={currentIndex + 2 + i} showIndex />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {previousTracks.length > 0 && (
                <section className="opacity-40 hover:opacity-70 transition-opacity">
                  <SectionLabel>Previously in Queue</SectionLabel>
                  <div className="bg-white/[0.015] border border-white/5 rounded-2xl p-2">
                    {previousTracks.map((track, i) => (
                      <div key={track.videoId + i} onClick={() => playTrack(track)}>
                        <TrackCard track={track} index={i + 1} showIndex />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {tab === "recent" && (
        <>
          {displayRecent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-5">
                <History className="w-9 h-9 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No history yet</h3>
              <p className="text-white/40 text-sm max-w-xs">Songs you play will appear here.</p>
            </div>
          ) : (
            <section>
              <SectionLabel>Recently Played · {displayRecent.length} songs</SectionLabel>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
                {displayRecent.map((track, i) => (
                  <div key={track.videoId + i} onClick={() => playTrack(track)}>
                    <TrackCard track={track} index={i + 1} showIndex />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-3 px-1">{children}</p>
  );
}
