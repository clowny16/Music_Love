import { useState, useEffect } from "react";
import { useSearchMusic, useGetSearchSuggestions } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { TrackCard } from "./track-card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePlayer } from "@/contexts/player-context";
import { getWatchPlaylist } from "@workspace/api-client-react";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [isOpen, setIsOpen] = useState(false);
  const { playTrack, setQueue } = usePlayer();
  
  const { data: searchResults, isLoading: isSearching } = useSearchMusic(
    { q: debouncedQuery, filter: 'songs' }, 
    { query: { enabled: debouncedQuery.length > 2, queryKey: ['search', debouncedQuery, 'songs'] } }
  );

  const { data: suggestions } = useGetSearchSuggestions(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 1, queryKey: ['suggestions', debouncedQuery] } }
  );

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
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl mx-auto">
        <Popover open={isOpen && (suggestions?.suggestions?.length || 0) > 0} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                placeholder="Search songs, artists, albums..."
                className="pl-11 pr-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-white/10 transition-all text-base shadow-sm"
              />
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 animate-spin" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl" align="start">
            {suggestions?.suggestions.map((s, i) => (
              <div 
                key={i} 
                className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                onClick={() => {
                  setQuery(s);
                  setIsOpen(false);
                }}
              >
                <Search className="w-3.5 h-3.5 opacity-50" />
                {s}
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="pt-4">
        {isSearching && debouncedQuery.length > 2 && !searchResults ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center p-3 rounded-lg border border-white/5">
                <div className="w-12 h-12 rounded bg-white/5 animate-pulse shrink-0 mr-4" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : searchResults?.results ? (
          searchResults.results.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Top Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                {searchResults.results.map((track, i) => (
                  <div key={track.videoId + i} onClick={() => handleSelectTrack(track)}>
                    <TrackCard track={track} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
              <p className="text-white/50 text-sm">Try searching for something else.</p>
            </div>
          )
        ) : debouncedQuery.length > 0 ? (
          <div className="text-center py-20 text-white/40">Keep typing to search...</div>
        ) : (
          <div className="text-center py-20 text-white/40">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <p>Search for your favorite tracks to start playing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
