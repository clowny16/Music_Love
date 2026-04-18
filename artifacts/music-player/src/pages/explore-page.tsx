import { useGetCharts } from "@workspace/api-client-react";
import { TrackCard } from "@/components/track-card";

export default function ExplorePage() {
  const { data: charts, isLoading } = useGetCharts(
    { country: "US" },
    { query: { queryKey: ["charts", "US"] } }
  );

  const trending = (charts as any)?.chartTracks || [];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-heading text-neutral-100 italic">
          Explore
        </h1>
        <p className="text-neutral-500 font-medium tracking-tight mt-2">
          What's trending now in the Sonic Architect universe.
        </p>
      </header>

      <section className="space-y-6">
        <h3 className="text-xl font-black font-heading flex items-center gap-3">
          <span className="w-2 h-6 bg-primary-container rounded-full" />
          Trending Globally
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface-container-low rounded-3xl animate-pulse" />
            ))
          ) : (
            trending.slice(0, 30).map((track: any, i: number) => (
              <TrackCard key={track.videoId + i} track={track} index={i + 1} showIndex />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
