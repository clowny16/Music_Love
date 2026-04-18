import { getWatchPlaylist } from "@workspace/api-client-react";
import { useGetAlbum } from "@workspace/api-client-react/src/generated/api";
import { usePlayer } from "@/contexts/player-context";
import { TrackCard } from "@/components/track-card";
import { Play, Shuffle, ArrowLeft, Disc3 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@/hooks/use-navigate";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23111' rx='12'/%3E%3Ccircle cx='150' cy='150' r='60' fill='%23222'/%3E%3Ccircle cx='150' cy='150' r='20' fill='%23111'/%3E%3C/svg%3E";

interface AlbumPageProps {
  albumId: string;
}

export default function AlbumPage({ albumId }: AlbumPageProps) {
  const { data: album, isLoading, error } = useGetAlbum(albumId, {
    query: { queryKey: ["album", albumId] },
  });
  const { playTrack, setQueue } = usePlayer();
  const [imgError, setImgError] = useState(false);
  const { navigate } = useNavigate();

  const handlePlayAll = async () => {
    if (!album?.tracks?.length) return;
    playTrack(album.tracks[0]);
    setQueue(album.tracks);
  };

  const handleShuffle = () => {
    if (!album?.tracks?.length) return;
    const shuffled = [...album.tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0]);
    setQueue(shuffled);
  };

  const handleTrackClick = async (track: any, idx: number) => {
    playTrack(track);
    if (album?.tracks) {
      setQueue(album.tracks.slice(idx));
    }
    try {
      const res = await getWatchPlaylist(track.videoId);
      if (res?.tracks?.length) setQueue(res.tracks);
    } catch {}
  };

  const thumbnail = imgError
    ? FALLBACK_IMG
    : (album?.thumbnails?.[album.thumbnails.length > 1 ? album.thumbnails.length - 1 : 0]?.url || FALLBACK_IMG);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black text-white pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8 pt-10">
          <div className="animate-pulse">
            <div className="flex gap-6 mb-8">
              <div className="w-40 h-40 rounded-2xl bg-white/10 shrink-0"></div>
              <div className="flex-1 pt-4 space-y-3">
                <div className="h-6 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-lg mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center">
        <Disc3 className="w-12 h-12 text-white/20 mb-4" />
        <p className="text-white/50 text-sm">Album not found</p>
        <button onClick={() => navigate("/")} className="mt-4 text-white/40 hover:text-white text-sm transition-colors">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white pb-28 selection:bg-white/20">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Album header */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          <div className="shrink-0">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
              <img
                src={thumbnail}
                alt={album.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-end min-w-0">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Album</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-1 truncate">{album.title}</h1>
            <p className="text-white/60 text-sm mb-1">{album.artist}</p>
            {album.year && <p className="text-white/30 text-xs mb-4">{album.year} · {album.trackCount} songs</p>}
            {album.description && (
              <p className="text-white/30 text-xs mb-4 line-clamp-2">{album.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Play
              </button>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all border border-white/10"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
            </div>
          </div>
        </div>

        {/* Track list */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2">
          {album.tracks.map((track: any, i: number) => (
            <div key={track.videoId + i} onClick={() => handleTrackClick(track, i)}>
              <TrackCard track={track} index={i + 1} showIndex />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
