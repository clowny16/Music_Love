import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchSection } from "@/components/search-section";
import { ChartsSection } from "@/components/charts-section";
import { QueueSection } from "@/components/queue-section";
import { LibrarySection } from "@/components/library-section";
import { Search, Flame, ListMusic, Library, Music2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black text-white pb-28 selection:bg-white/20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
        <header className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Music2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Studio</h1>
        </header>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-8 w-full overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="search"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all flex-1 py-2 text-sm whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Search
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all flex-1 py-2 text-sm whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              Charts
            </TabsTrigger>
            <TabsTrigger
              value="queue"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all flex-1 py-2 text-sm whitespace-nowrap"
            >
              <ListMusic className="w-3.5 h-3.5 mr-1.5" />
              Queue
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all flex-1 py-2 text-sm whitespace-nowrap"
            >
              <Library className="w-3.5 h-3.5 mr-1.5" />
              Library
            </TabsTrigger>
          </TabsList>

          <div className="mt-2">
            <TabsContent value="search" className="m-0 focus-visible:outline-none animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <SearchSection />
            </TabsContent>
            <TabsContent value="charts" className="m-0 focus-visible:outline-none animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <ChartsSection />
            </TabsContent>
            <TabsContent value="queue" className="m-0 focus-visible:outline-none animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <QueueSection />
            </TabsContent>
            <TabsContent value="library" className="m-0 focus-visible:outline-none animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <LibrarySection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
