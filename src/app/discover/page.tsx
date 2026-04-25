"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Search, Plus, Sparkles, CheckCircle2, Loader2, Filter, Globe, Database } from "lucide-react";
import { toast } from "sonner";

// Curated list for initial load
const CURATED_DATABASE = [
  { name: "Nissan Skyline GT-R (R34)", year: "2024", series: "HW J-Imports", image: "https://static.wikia.nocookie.net/hotwheels/images/a/a2/Nissan_Skyline_GT-R_%28R34%29_Blue_2024.jpg" },
  { name: "Porsche 911 GT3", year: "2023", series: "HW Exotics", image: "https://static.wikia.nocookie.net/hotwheels/images/0/05/Porsche_911_GT3_Blue_2023.jpg" },
  { name: "Tesla Cybertruck", year: "2024", series: "HW Rolling Metal", image: "https://static.wikia.nocookie.net/hotwheels/images/f/f0/Tesla_Cybertruck_Silver_2024.jpg" },
  { name: "McLaren F1", year: "2024", series: "HW: The '90s", image: "https://static.wikia.nocookie.net/hotwheels/images/3/36/McLaren_F1_Silver_2024.jpg" },
  { name: "Bugatti Bolide", year: "2024", series: "HW Exotics", image: "https://static.wikia.nocookie.net/hotwheels/images/2/2d/Bugatti_Bolide_Blue_2024.jpg" },
  { name: "Lamborghini Countach LP500 S", year: "2022", series: "HW Tooned", image: "https://static.wikia.nocookie.net/hotwheels/images/e/e5/Lamborghini_Countach_LP500_S_Red_2022.jpg" },
  { name: "Mazda RX-7 FD", year: "2024", series: "HW Drift", image: "https://static.wikia.nocookie.net/hotwheels/images/0/0a/Mazda_RX-7_FD_White_2024.jpg" },
  { name: "Shelby GT500", year: "2024", series: "Muscle Mania", image: "https://static.wikia.nocookie.net/hotwheels/images/4/4e/Shelby_GT500_Red_2024.jpg" }
];

interface WikiCar {
  name: string;
  year: string;
  series: string;
  image: string;
  isWiki?: boolean;
}

export default function DiscoverPage() {
  const { addModel, models, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeries, setActiveSeries] = useState("All");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [wikiResults, setWikiResults] = useState<WikiCar[]>([]);
  const [isLoadingWiki, setIsLoadingWiki] = useState(false);
  const [searchMode, setSearchMode] = useState<'curated' | 'global'>('curated');

  // Debounced Wiki Search
  useEffect(() => {
    if (searchMode !== 'global' || searchQuery.length < 3) {
      setWikiResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingWiki(true);
      try {
        const response = await fetch(
          `https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=pageimages&generator=search&piprop=thumbnail&pithumbsize=600&gsrsearch=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        
        if (data.query?.pages) {
          const results: WikiCar[] = Object.values(data.query.pages).map((page: any) => ({
            name: page.title,
            year: "N/A",
            series: "Global Database",
            image: page.thumbnail?.source || "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=600&auto=format&fit=crop",
            isWiki: true
          }));
          setWikiResults(results);
        } else {
          setWikiResults([]);
        }
      } catch (error) {
        console.error("Wiki search failed:", error);
        toast.error("Could not reach global database");
      } finally {
        setIsLoadingWiki(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);

  const seriesOptions = useMemo(() => {
    const series = Array.from(new Set(CURATED_DATABASE.map(m => m.series)));
    return ["All", ...series.sort()];
  }, []);

  const displayModels = useMemo(() => {
    if (searchMode === 'global') return wikiResults;

    return CURATED_DATABASE.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.series.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeries = activeSeries === "All" || m.series === activeSeries;
      return matchesSearch && matchesSeries;
    });
  }, [searchQuery, activeSeries, searchMode, wikiResults]);

  const isAlreadyInCollection = (name: string) => {
    return models.some(m => m.name.toLowerCase() === name.toLowerCase());
  };

  const handleAdd = async (model: WikiCar) => {
    if (!user) {
      toast.error("Please sign in to acquire models");
      return;
    }
    setAddingId(model.name);
    
    try {
      await addModel({
        name: model.name,
        year: model.year,
        manufacturer: "Hot Wheels",
        series: model.series,
        scale: "1:64",
        image: model.image
      });
      toast.success(`${model.name} added to your collection!`);
    } catch (err) {
      toast.error("Failed to add model");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full min-h-screen">
      {/* Header Section */}
      <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-primary-container" size={20} />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Discovery Engine</span>
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
            {searchMode === 'curated' ? 'Curated' : 'Global'} <span className="text-primary-container">Archive</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg text-lg">
            {searchMode === 'curated' 
              ? "Hand-picked legendary castings for your collection. Precise, detailed, and ready for acquisition."
              : "Accessing the Hot Wheels Fandom database. Thousands of historical models at your fingertips."}
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full lg:w-auto">
          {/* Mode Switcher */}
          <div className="flex bg-surface-container rounded-full p-1 self-start lg:self-end border border-white/5">
            <button 
              onClick={() => setSearchMode('curated')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${searchMode === 'curated' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface/40 hover:text-on-surface'}`}
            >
              <Database size={14} /> Curated
            </button>
            <button 
              onClick={() => setSearchMode('global')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${searchMode === 'global' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface/40 hover:text-on-surface'}`}
            >
              <Globe size={14} /> Global Wiki
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {searchMode === 'curated' && (
              <div className="relative group min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={16} />
                <select 
                  value={activeSeries}
                  aria-label="Filter by Hot Wheels series"
                  onChange={(e) => setActiveSeries(e.target.value)}
                  className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-4 pl-12 pr-10 focus:border-primary transition-all outline-none font-body text-sm appearance-none cursor-pointer text-on-surface"
                >
                  {seriesOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text"
                aria-label="Search Hot Wheels castings"
                placeholder={searchMode === 'curated' ? "Search curated list..." : "Search entire history (e.g. Skyline)..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-4 pl-12 pr-6 focus:border-primary transition-all outline-none font-body text-sm text-on-surface"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {isLoadingWiki ? (
          <div className="col-span-full py-32 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary-container" size={48} />
            <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface/40">Querying Global Archive...</p>
          </div>
        ) : displayModels.map((item, index) => {
          const inCollection = isAlreadyInCollection(item.name);
          const isAdding = addingId === item.name;

          return (
            <article 
              key={index}
              className="bg-surface-container-low group hover:bg-surface-container transition-all duration-500 border border-white/5 relative overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-black/40">
                <Image 
                  fill
                  unoptimized // Wiki images can be finicky with Next.js image optimization
                  alt={item.name}
                  src={item.image}
                  className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
                
                {inCollection && (
                  <div className="absolute top-4 left-4 bg-primary-container/90 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                    <CheckCircle2 size={12} />
                    <span className="font-label text-[9px] font-bold uppercase tracking-wider">In Collection</span>
                  </div>
                )}

                {item.isWiki && (
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white/60 p-2 rounded-full" title="From Global Database">
                    <Globe size={12} />
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label text-[9px] tracking-widest text-primary-container uppercase font-bold line-clamp-1">{item.series}</span>
                  <span className="font-label text-[9px] tracking-widest text-on-surface/40 uppercase font-bold">{item.year}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface uppercase mb-6 line-clamp-2 min-h-[3.5rem] leading-tight">{item.name}</h3>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => handleAdd(item)}
                    disabled={inCollection || isAdding || !user}
                    aria-label={inCollection ? `${item.name} is already in your collection` : `Acquire ${item.name}`}
                    className={`w-full py-3 flex items-center justify-center gap-2 font-headline text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                      ${inCollection 
                        ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                        : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-white active:scale-95'
                      }
                      ${!user ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isAdding ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : inCollection ? (
                      'Owned'
                    ) : (
                      <>
                        <Plus size={14} />
                        Acquire
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!isLoadingWiki && displayModels.length === 0 && (
          <div className="col-span-full py-32 text-center bg-surface-container-low border border-dashed border-white/5">
            <p className="text-on-surface/40 font-body italic text-xl mb-4">
              {searchMode === 'global' && searchQuery.length < 3 
                ? "Type at least 3 characters to search the global history"
                : "No legendary castings found matching your criteria"}
            </p>
            <button 
              onClick={() => {setSearchQuery(""); setActiveSeries("All");}}
              className="text-primary-container hover:text-primary font-label text-xs uppercase tracking-widest font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-on-surface/30 font-label text-[10px] uppercase tracking-widest flex items-center gap-4">
          <span>{searchMode === 'curated' ? `Curated Archive: ${displayModels.length} models` : `Global Search active`}</span>
          <div className="w-[1px] h-3 bg-white/10"></div>
          <span className="flex items-center gap-1.5"><Globe size={10}/> Powered by Fandom API</span>
        </div>
        {!user && (
          <p className="text-primary-container font-label text-[10px] uppercase tracking-widest font-bold animate-pulse">
            Sign in to start acquiring new pieces
          </p>
        )}
      </footer>
    </main>
  );
}
