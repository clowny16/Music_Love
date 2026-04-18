import { useMemo, useState } from "react";
import { useGetCharts, Track } from "@workspace/api-client-react";
const TopArtist = {} as any;
import { usePlayer } from "@/contexts/player-context";
import { SearchSection } from "@/components/search-section";
import { TrackCard } from "@/components/track-card";
import { Link } from "wouter";

export default function Home() {
  const { data: charts, isLoading: isChartsLoading } = useGetCharts(
    { country: "US" },
    { query: { queryKey: ["charts", "US"] } }
  );
  const { likedSongs, playTrack, setQueue } = usePlayer();

  // Create "Saved Albums" from featured charts
  const albums = useMemo(() => {
    const albumMap = new Map();
    (charts as any)?.chartTracks?.forEach((t: Track) => {
      if (t.album?.id && !albumMap.has(t.album.id)) {
        albumMap.set(t.album.id, {
          id: t.album.id,
          title: t.album.name,
          artist: t.artists?.[0]?.name || "Various Artists",
          thumbnail: t.thumbnails?.[0]?.url
        });
      }
    });
    return Array.from(albumMap.values()).slice(0, 10);
  }, [charts]);

  // Create "Subscribed Artists" from top artists
  const artists = (charts as any)?.topArtists?.slice(0, 8) || [];

  return (
    <div className="space-y-12 pb-16 animate-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-heading text-neutral-100">
            Library Manager
          </h1>
          <p className="text-neutral-500 font-medium tracking-tight">
            Discover new talents and manage your studio collection.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none py-3 px-6 bg-surface-container-highest hover:bg-surface-container-high text-neutral-200 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 border border-white/5 shadow-lg">
            <span className="material-symbols-outlined text-xl text-primary">file_upload</span>
            Import Files
          </button>
          <button className="material-symbols-outlined p-3 bg-primary-container text-on-primary-container rounded-full shadow-xl shadow-primary-container/20 hover:scale-110 active:scale-95 transition-all">
            add
          </button>
        </div>
      </header>

      {/* Hero Search */}
      <section className="bg-surface-container-low rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse" />
        <div className="relative z-10 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 font-heading">Find your next inspiration</h2>
          <SearchSection />
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Saved Albums Section */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black font-heading flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Saved Albums
            </h3>
            <Link href="/library">
              <a className="text-sm font-bold text-primary hover:underline">View All</a>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {isChartsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-surface-container-highest rounded-2xl animate-pulse" />
              ))
            ) : (
              albums.map((album) => (
                <Link key={album.id} href={`/album/${album.id}`}>
                  <a className="group space-y-3">
                    <div className="aspect-square relative rounded-2xl overflow-hidden shadow-lg shadow-black/40 border border-white/5 transition-all group-hover:scale-[1.03] group-hover:shadow-primary-container/20">
                      <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all">play_circle</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 px-1">
                      <p className="font-bold text-neutral-200 text-sm truncate">{album.title}</p>
                      <p className="text-xs text-neutral-500 font-medium truncate">{album.artist}</p>
                    </div>
                  </a>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Subscribed Artists Section */}
        <aside className="lg:col-span-4 space-y-6">
          <h3 className="text-xl font-black font-heading flex items-center gap-3">
            <span className="w-2 h-6 bg-secondary-container rounded-full" />
            Top Artists
          </h3>
          <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5 space-y-4">
            {isChartsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container-highest rounded w-3/4" />
                    <div className="h-3 bg-surface-container-highest rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              artists.map((artist: TopArtist) => (
                <div key={artist.browseId} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all shrink-0">
                    <img src={artist.thumbnails?.[0]?.url} alt={artist.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-neutral-200 truncate group-hover:text-primary transition-colors">{artist.title}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                      {artist.subscribers || "Trending Artist"}
                    </p>
                  </div>
                  <button className="material-symbols-outlined text-neutral-600 group-hover:text-primary transition-colors">favorite</button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Liked Songs Strip */}
      <section className="mt-16 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black font-heading flex items-center gap-3">
            <span className="w-2 h-6 bg-primary-container rounded-full" />
            Liked Tracks
          </h3>
          <button 
            onClick={() => {
              const tracks = likedSongs.map(s => s.track);
              if (tracks.length) {
                playTrack(tracks[0]);
                setQueue(tracks);
              }
            }}
            className="text-sm font-bold bg-white text-black px-6 py-2 rounded-full hover:scale-105 transition-all shadow-xl shadow-white/10"
          >
            Play Collection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {likedSongs.length > 0 ? (
            likedSongs.slice(0, 9).map((song, i) => (
              <div key={song.track.videoId + i} onClick={() => playTrack(song.track)} className="cursor-pointer">
                <TrackCard track={song.track} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-surface-container-low rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center opacity-50">
              <span className="material-symbols-outlined text-6xl mb-4 text-primary">music_off</span>
              <p className="text-xl font-bold font-heading">Your collection is empty</p>
              <p className="text-neutral-500">Liked songs will appear here</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
