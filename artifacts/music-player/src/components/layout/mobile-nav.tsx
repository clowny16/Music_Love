import { Link, useLocation } from "wouter";

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-background/90 backdrop-blur-2xl border-t border-white/10 z-50 rounded-t-xl shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
      <TabItem href="/" active={location === "/"} icon="search" label="Search" />
      <TabItem href="/library" active={location === "/library"} icon="library_music" label="Library" />
      <TabItem href="/explore" active={location === "/explore"} icon="explore" label="Explore" />
      <TabItem href="/profile" active={location === "/profile"} icon="account_circle" label="Profile" />
    </nav>
  );
}

function TabItem({ href, active, icon, label }: { href: string; active: boolean; icon: string; label: string }) {
  return (
    <Link href={href}>
      <a className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
        active 
          ? "bg-primary-container text-on-primary-container rounded-xl px-4 py-1" 
          : "text-neutral-500 hover:text-primary"
      }`}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="font-body text-[10px] uppercase tracking-widest font-bold">{label}</span>
      </a>
    </Link>
  );
}
