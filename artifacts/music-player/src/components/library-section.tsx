import type { ReactNode } from "react";
import { usePlayer } from "@/contexts/player-context";
import { TrackCard } from "./track-card";
import { Heart, Disc3, Music2, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@/hooks/use-navigate";

interface LikedSong {
  track: any;
  likedAt: number;
}

export function LibrarySection() {
  const { likedSongs, recentlyPlayed, playTrack, setQueue } = usePlayer();
  const { navigate } = useNavigate();
  const [activeView, setActiveView] = useState<"overview" | "liked">("overview");

  // Collect unique albums from recently played
  const albumMap = new Map<string, { id: string; name: string; artist: string; thumbnail: string }>();
  for (const track of recentlyPlayed) {
    if (track.album?.id && track.album?.name && !albumMap.has(track.album.id)) {
      albumMap.set(track.album.id, {
        id: track.album.id,
        name: track.album.name,
        artist: track.artists?.[0]?.name ?? "Unknown",
        thumbnail: track.thumbnails?.[track.thumbnails.length > 1 ? 1 : 0]?.url ?? "",
      });
    }
  }
  const recentAlbums = Array.from(albumMap.values()).slice(0, 12);

  // Collect unique artists from recently played
  const artistMap = new Map<string, { id?: string; name: string; thumbnail: string }>();
  for (const track of recentlyPlayed) {
    for (const a of track.artists ?? []) {
      if (a.name && !artistMap.has(a.name)) {
        artistMap.set(a.name, {
          id: a.id,
          name: a.name,
          thumbnail: track.thumbnails?.[0]?.url ?? "",
        });
      }
    }
  }
  const recentArtists = Array.from(artistMap.values()).slice(0, 12);

  const handlePlayLiked = () => {
    const tracks = likedSongs.map((s: LikedSong) => s.track);
    if (tracks.length > 0) {
      playTrack(tracks[0]);
      setQueue(tracks);
    }
  };

  if (activeView === "liked") {
    return (
      <div className="pb-10 max-w-3xl mx-auto">
        <button
          onClick={() => setActiveView("overview")}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Library
        </button>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Liked Songs</h2>
              <p className="text-sm text-white/40">{likedSongs.length} songs</p>
            </div>
          </div>
          {likedSongs.length > 0 && (
            <button
              onClick={handlePlayLiked}
              className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Play All
            </button>
          )}
        </div>
        {likedSongs.length === 0 ? (
          <EmptyState icon={<Heart className="w-9 h-9 text-white/20" />} title="No liked songs" desc="Heart a song while it's playing to save it here." />
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
            {[...likedSongs].reverse().map((s: LikedSong, i: number) => (
              <div key={s.track.videoId + i} onClick={() => { playTrack(s.track); setQueue(likedSongs.map((ls: LikedSong) => ls.track)); }}>
                <TrackCard track={s.track} index={i + 1} showIndex />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6">Your Library</h2>

      {/* Liked Songs Card */}
      <div
        onClick={() => setActiveView("liked")}
        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer mb-8"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shrink-0">
          <Heart className="w-7 h-7 text-white fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">Liked Songs</p>
          <p className="text-sm text-white/40">{likedSongs.length} songs</p>
        </div>
        <span className="text-white/20 group-hover:text-white/40 transition-colors">→</span>
      </div>

      {/* Recent Albums */}
      {recentAlbums.length > 0 && (
        <section className="mb-8">
          <SectionLabel icon={<Disc3 className="w-4 h-4" />}>Recent Albums</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recentAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => navigate(`/album/${album.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Artists */}
      {recentArtists.length > 0 && (
        <section className="mb-8">
          <SectionLabel icon={<Users className="w-4 h-4" />}>Recent Artists</SectionLabel>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {recentArtists.map((artist) => (
              <ArtistChip key={artist.name} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {recentAlbums.length === 0 && recentArtists.length === 0 && likedSongs.length === 0 && (
        <div className="py-20">
          <EmptyState icon={<Music2 className="w-9 h-9 text-white/20" />} title="Your library is empty" desc="Play some music and your collection will appear here." />
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="text-white/30">{icon}</span>}
      <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{children}</p>
    </div>
  );
}

function AlbumCard({ album, onClick }: { album: { name: string; artist: string; thumbnail: string }; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23222' rx='8'/%3E%3Ccircle cx='60' cy='60' r='24' fill='%23444'/%3E%3Ccircle cx='60' cy='60' r='8' fill='%23222'/%3E%3C/svg%3E";
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white/5 ring-1 ring-white/5 group-hover:ring-white/15 transition-all">
        <img
          src={imgErr ? FALLBACK : (album.thumbnail || FALLBACK)}
          alt={album.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgErr(true)}
        />
      </div>
      <p className="text-sm font-medium text-white/90 truncate">{album.name}</p>
      <p className="text-xs text-white/40 truncate mt-0.5">{album.artist}</p>
    </div>
  );
}

function ArtistChip({ artist }: { artist: { name: string; thumbnail: string } }) {
  const [imgErr, setImgErr] = useState(false);
  const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23222' rx='30'/%3E%3Ccircle cx='30' cy='24' r='10' fill='%23444'/%3E%3C/svg%3E";
  return (
    <div className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/10">
        <img
          src={imgErr ? FALLBACK : (artist.thumbnail || FALLBACK)}
          alt={artist.name}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
        />
      </div>
      <p className="text-xs text-white/70 text-center leading-tight">{artist.name}</p>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-5">{icon}</div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-white/40 text-sm max-w-xs">{desc}</p>
    </div>
  );
}
