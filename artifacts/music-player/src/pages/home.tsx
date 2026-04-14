import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchSection } from "@/components/search-section";
import { ChartsSection } from "@/components/charts-section";
import { QueueSection } from "@/components/queue-section";
import { Search, Flame, ListMusic, Music2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black text-white pb-24 selection:bg-white/20">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10">
        <header className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <Music2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
        </header>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-8 w-full max-w-md">
            <TabsTrigger 
              value="search" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all flex-1 py-2.5"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all flex-1 py-2.5"
            >
              <Flame className="w-4 h-4 mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger 
              value="queue" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black transition-all flex-1 py-2.5"
            >
              <ListMusic className="w-4 h-4 mr-2" />
              Queue
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TabsContent value="search" className="m-0 focus-visible:outline-none">
              <SearchSection />
            </TabsContent>
            
            <TabsContent value="charts" className="m-0 focus-visible:outline-none">
              <ChartsSection />
            </TabsContent>
            
            <TabsContent value="queue" className="m-0 focus-visible:outline-none">
              <QueueSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
