import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AlbumPage from "@/pages/album-page";
import { PlayerProvider } from "@/contexts/player-context";
import { PlayerBar } from "@/components/player-bar";
import { NowPlayingModal } from "@/components/now-playing-modal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/album/:albumId">
        {(params) => <AlbumPage albumId={params.albumId} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <PlayerBar />
          <NowPlayingModal />
          <Toaster />
          <div id="youtube-player-container" style={{ position: "fixed", bottom: "-9999px", left: "-9999px", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }} />
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
