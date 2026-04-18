import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Compass, 
  Library, 
  History, 
  Music,
  HelpCircle,
  Info
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex-col py-6 space-y-4 z-40 border-r border-white/5">
      <div className="px-6 mb-8 mt-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary-container/20">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>music_note</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-100 font-heading leading-tight">Sonic Architect</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Music Studio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem 
          href="/" 
          active={location === "/"} 
          icon={<span className="material-symbols-outlined">dashboard</span>} 
          label="Dashboard" 
        />
        <NavItem 
          href="/explore" 
          active={location === "/explore"} 
          icon={<span className="material-symbols-outlined">explore</span>} 
          label="Explore" 
        />
        <NavItem 
          href="/library" 
          active={location === "/library"} 
          icon={<span className="material-symbols-outlined">library_music</span>} 
          label="Collection" 
        />
        <NavItem 
          href="/history" 
          active={location === "/history"} 
          icon={<span className="material-symbols-outlined">history</span>} 
          label="Recent" 
        />
      </nav>

      <div className="px-6 pb-4">
        <button className="w-full py-3 bg-primary-container text-on-primary-container text-sm font-bold rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary-container/20">
          Sync Library
        </button>
      </div>

      <div className="px-6 pt-4 border-t border-white/5 space-y-1">
        <FooterItem href="#" icon={<span className="material-symbols-outlined text-sm">help_outline</span>} label="Support" />
        <FooterItem href="#" icon={<span className="material-symbols-outlined text-sm">info</span>} label="About" />
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <a className={`flex items-center px-6 py-3 gap-3 transition-all duration-200 group ${
        active 
          ? "bg-surface-container-high text-primary border-r-4 border-primary-container" 
          : "text-neutral-500 hover:bg-surface-container-high hover:text-neutral-200"
      }`}>
        <span className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
          {icon}
        </span>
        <span className="text-sm font-bold font-heading">{label}</span>
      </a>
    </Link>
  );
}

function FooterItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} className="flex items-center py-2 gap-3 text-neutral-500 hover:text-neutral-200 transition-colors text-sm font-medium">
      {icon}
      {label}
    </a>
  );
}
