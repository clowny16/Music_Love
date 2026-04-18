import { usePlayer } from "@/contexts/player-context";
import { TrackCard } from "@/components/track-card";
import { Link } from "wouter";
import { useMemo } from "react";

export default function LibraryPage() {
  const { likedSongs, recentlyPlayed, playTrack, setQueue } = usePlayer();

  const handlePlayLiked = () => {
    const tracks = likedSongs.map(s => s.track);
    if (tracks.length > 0) {
      playTrack(tracks[0]);
      setQueue(tracks);
    }
  };

  const recentAlbums = useMemo(() => {
    const map = new Map();
    recentlyPlayed.forEach((t: any) => {
      if (t.album?.id && !map.has(t.album.id)) {
        map.set(t.album.id, {
          id: t.album.id,
          title: t.album.name,
          artist: t.artists?.[0]?.name || "Unknown Artist",
          thumbnail: t.thumbnails?.[1]?.url || t.thumbnails?.[0]?.url
        });
      }
    });
    return Array.from(map.values()).slice(0, 8);
  }, [recentlyPlayed]);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-heading text-neutral-100 italic">
            Your Collection
          </h1>
          <p className="text-neutral-500 font-medium tracking-tight mt-2">
            Managing {likedSongs.length} tracks and {recentAlbums.length} recently visited albums.
          </p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handlePlayLiked}
            disabled={likedSongs.length === 0}
            className="px-8 py-3 bg-primary-container text-on-primary-container rounded-full font-bold shadow-xl shadow-primary-container/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            Play All Liked
          </button>
        </div>
      </header>

      {/* Liked Songs Grid */}
      <section className="space-y-6">
        <h3 className="text-xl font-black font-heading flex items-center gap-3">
          <span className="w-2 h-6 bg-primary rounded-full shadow-[0_0_10px_#ffb3af]" />
          Liked Tracks
        </h3>
        
        {likedSongs.length === 0 ? (
          <div className="py-20 bg-surface-container-low rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4 text-primary">heart_broken</span>
            <p className="text-xl font-bold font-heading">No likes yet</p>
            <p className="text-neutral-500">Tap the heart on a song to save it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...likedSongs].reverse().map((song: any, i: number) => (
              <div key={song.track.videoId + i} onClick={() => playTrack(song.track)} className="cursor-pointer">
                <TrackCard track={song.track} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Albums */}
      {recentAlbums.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-black font-heading flex items-center gap-3">
            <span className="w-2 h-6 bg-secondary-container rounded-full" />
            Recents
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recentAlbums.map((album: any) => (
              <Link key={album.id} href={`/album/${album.id}`}>
                <a className="group space-y-3">
                  <div className="aspect-square relative rounded-2xl overflow-hidden shadow-lg border border-white/5 transition-all group-hover:scale-[1.05] group-hover:shadow-primary/20">
                    <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all">play_arrow</span>
                    </div>
                  </div>
                  <div className="px-1 overflow-hidden">
                    <p className="font-bold text-neutral-200 text-xs truncate">{album.title}</p>
                    <p className="text-[10px] text-neutral-500 font-medium truncate">{album.artist}</p>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
