import { useState, useEffect, useRef } from "react";
import { useSearchMusic, useGetSearchSuggestions } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { TrackCard } from "./track-card";
import { usePlayer } from "@/contexts/player-context";
import { getWatchPlaylist } from "@workspace/api-client-react";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playTrack, setQueue } = usePlayer();
  
  const { data: searchResults, isLoading: isSearching } = useSearchMusic(
    { q: debouncedQuery, filter: 'songs' }, 
    { query: { enabled: debouncedQuery.length > 2, queryKey: ['search', debouncedQuery, 'songs'] } }
  );

  const { data: suggestions } = useGetSearchSuggestions(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 2, queryKey: ['suggestions', debouncedQuery] } }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTrack = async (track: any) => {
    playTrack(track);
    try {
      const res = await getWatchPlaylist(track.videoId);
      if (res && res.tracks) {
        setQueue(res.tracks);
      }
    } catch (e) {
      console.error("Failed to load queue", e);
    }
    setIsFocused(false);
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-primary transition-colors">search</span>
        <input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder="Artist, tracks, or mood..."
          className="w-full h-16 pl-14 pr-6 bg-surface-container-highest/50 border-2 border-transparent focus:border-primary/30 rounded-3xl text-neutral-100 font-bold placeholder:text-neutral-600 focus:outline-none focus:bg-surface-container-highest transition-all shadow-xl"
        />
        {isSearching && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && (suggestions?.suggestions?.length ?? 0) > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-surface-container-high border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[70] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col">
            {suggestions?.suggestions.map((s: string, i: number) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(s);
                  setIsFocused(false);
                }}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl text-left group transition-all"
              >
                <span className="material-symbols-outlined text-neutral-500 group-hover:text-primary">history</span>
                <span className="text-sm font-bold text-neutral-300 group-hover:text-white">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults?.results && (
        <div className="mt-12 space-y-6 animate-in slide-in-from-bottom-6 duration-700">
           <div className="flex items-center justify-between">
            <h3 className="text-xl font-black font-heading flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-full shadow-[0_0_10px_#ffb3af]" />
              Found For You
            </h3>
            <button onClick={() => setQuery("")} className="text-sm font-bold text-neutral-500 hover:text-primary transition-colors">Clear Results</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {searchResults.results.map((track: any, i: number) => (
              <div key={track.videoId + i} onClick={() => handleSelectTrack(track)} className="cursor-pointer">
                <TrackCard track={track} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
