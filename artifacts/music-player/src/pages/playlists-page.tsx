export default function PlaylistsPage() {
  const playlists = [
    { title: "Deep Focus", tracks: 24, color: "bg-blue-500" },
    { title: "Workout Beats", tracks: 18, color: "bg-red-500" },
    { title: "Late Night Chill", tracks: 42, color: "bg-purple-500" },
    { title: "Golden Era Hip Hop", tracks: 56, color: "bg-yellow-600" },
  ];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-heading text-neutral-100 italic">
          Playlists
        </h1>
        <p className="text-neutral-500 font-medium tracking-tight mt-2">
          Curated collections for every mood and moment.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {playlists.map((pl: any, i: number) => (
          <div key={i} className="group relative aspect-video rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-white/5">
            <div className={`absolute inset-0 ${pl.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
               <p className="text-xl font-black text-white font-heading">{pl.title}</p>
               <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">{pl.tracks} Tracks</p>
            </div>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
              <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
            </div>
          </div>
        ))}
        
        <button className="aspect-video rounded-[2rem] border-2 border-dashed border-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group">
          <span className="material-symbols-outlined text-4xl text-neutral-600 group-hover:text-primary transition-colors">add_circle</span>
          <span className="text-sm font-black text-neutral-600 group-hover:text-neutral-300 uppercase tracking-widest">Create New</span>
        </button>
      </div>
    </div>
  );
}
