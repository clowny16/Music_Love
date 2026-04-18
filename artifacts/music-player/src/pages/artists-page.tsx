import { useGetCharts } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function ArtistsPage() {
  const { data: charts, isLoading } = useGetCharts(
    { country: "US" },
    { query: { queryKey: ["charts", "US"] } }
  );

  const artists = (charts as any)?.topArtists || [];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-heading text-neutral-100 italic">
          Artists
        </h1>
        <p className="text-neutral-500 font-medium tracking-tight mt-2">
          Discover the creators behind your favorite sounds.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-square rounded-full bg-surface-container-highest" />
              <div className="h-4 bg-surface-container-highest rounded w-3/4 mx-auto" />
            </div>
          ))
        ) : (
          artists.map((artist: any) => (
            <div key={artist.browseId} className="group flex flex-col items-center text-center space-y-4 cursor-pointer">
              <div className="w-full aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-transparent group-hover:border-primary transition-all duration-500 relative">
                <img src={artist.thumbnails?.[1]?.url || artist.thumbnails?.[0]?.url} alt={artist.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-5xl">person</span>
                </div>
              </div>
              <div>
                <p className="font-black text-neutral-200 group-hover:text-primary transition-colors truncate w-full">{artist.title}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-1">{artist.subscribers || "Trending"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
