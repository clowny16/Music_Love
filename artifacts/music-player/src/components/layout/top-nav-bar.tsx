import { Link, useLocation } from "wouter";

export function TopNavBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex justify-between items-center px-8 h-16 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="text-xl font-black tracking-tighter text-primary-container font-heading hover:opacity-80 transition-opacity">
              Sonic Architect
            </a>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/library" active={location === "/library"}>Library</NavLink>
            <NavLink href="/artists" active={location === "/artists"}>Artists</NavLink>
            <NavLink href="/playlists" active={location === "/playlists"}>Playlists</NavLink>
            <NavLink href="/docs" active={location === "/docs"}>Docs</NavLink>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-all duration-300 active:opacity-80 active:scale-95">
            notifications
          </button>
          <button className="material-symbols-outlined p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-all duration-300 active:opacity-80 active:scale-95">
            settings
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden ml-2 bg-surface-container-highest border border-white/10">
            <img 
              alt="User" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/a/default-user"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link href={href}>
      <a className={`text-sm font-bold font-heading tracking-tight transition-all duration-300 pb-1 border-b-2 ${
        active 
          ? "text-primary border-primary-container" 
          : "text-neutral-400 border-transparent hover:text-neutral-200"
      }`}>
        {children}
      </a>
    </Link>
  );
}
