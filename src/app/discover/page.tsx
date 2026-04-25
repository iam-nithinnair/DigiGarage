"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Search, Plus, Sparkles, CheckCircle2, Loader2, Globe, Database, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface WikiCar {
  name: string;
  year: string;
  series: string;
  image: string;
}

export default function DiscoverPage() {
  const { addModel, models, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [wikiResults, setWikiResults] = useState<WikiCar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState<number | null>(null);
  
  // Ref to track if we've reached the user's requested 250 limit
  const resultsCount = wikiResults.length;

  const fetchModels = async (currentOffset: number | null = null, isNewSearch: boolean = false) => {
    if (isNewSearch) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const isDefault = searchQuery.length < 3;
      const effectiveQuery = isDefault ? "2025 Hot Wheels mainline" : searchQuery;
      
      let url = `https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=pageimages&generator=search&piprop=thumbnail&pithumbsize=800&gsrlimit=50&gsrsearch=${encodeURIComponent(effectiveQuery)}`;
      
      if (currentOffset) {
        url += `&gsroffset=${currentOffset}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.query?.pages) {
        const newResults: WikiCar[] = Object.values(data.query.pages)
          .sort((a: any, b: any) => a.index - b.index)
          .filter((page: any) => {
             const title = page.title.toLowerCase();
             return !title.startsWith('list of') && 
                    !title.includes('category:') && 
                    !title.includes('template:') &&
                    !title.includes('talk:') &&
                    page.thumbnail;
          })
          .map((page: any) => ({
            name: page.title,
            year: isDefault ? "2025" : "N/A",
            series: "Global Database",
            image: page.thumbnail.source,
          }));

        if (isNewSearch) {
          setWikiResults(newResults);
        } else {
          setWikiResults(prev => [...prev, ...newResults]);
        }

        // Set next offset if available, up to 250 models
        if (data.continue?.gsroffset && (isNewSearch ? newResults.length : (wikiResults.length + newResults.length)) < 250) {
          setOffset(data.continue.gsroffset);
        } else {
          setOffset(null);
        }
      } else {
        if (isNewSearch) setWikiResults([]);
        setOffset(null);
      }
    } catch (error) {
      console.error("Wiki search failed:", error);
      toast.error("Could not reach global database");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load & search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModels(null, true);
    }, searchQuery.length >= 3 ? 600 : 0);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
            <Globe className="text-primary-container" size={20} />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Global Archive</span>
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
            Discover <span className="text-primary-container">Castings</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg text-lg">
            Cataloging the 250 Mainline models for 2025. Search through thousands of historical models and legendary silhouettes in real-time.
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full lg:w-auto">
          <div className="relative w-full md:w-[500px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              autoFocus
              aria-label="Search Hot Wheels castings from global archive"
              placeholder="Search entire history (e.g. Skyline, Supra)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-5 pl-14 pr-8 focus:border-primary transition-all outline-none font-body text-base text-on-surface shadow-2xl"
            />
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {isLoading ? (
          <div className="col-span-full py-40 flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-primary-container" size={64} />
            <p className="font-label text-sm uppercase tracking-[0.3em] text-on-surface/40 animate-pulse">Initializing 2025 Archive...</p>
          </div>
        ) : wikiResults.map((item, index) => {
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
                  unoptimized
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
                
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white/60 p-2 rounded-full">
                  <Globe size={12} />
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label text-[9px] tracking-widest text-primary-container uppercase font-bold truncate pr-4">Global Database</span>
                  <span className="font-label text-[9px] tracking-widest text-on-surface/40 uppercase font-bold">{item.year}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface uppercase mb-6 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => handleAdd(item)}
                    disabled={inCollection || isAdding || !user}
                    aria-label={inCollection ? `${item.name} is already in your collection` : `Acquire ${item.name}`}
                    className={`w-full py-3 flex items-center justify-center gap-2 font-headline text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                      ${inCollection 
                        ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                        : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-white active:scale-95 shadow-lg shadow-primary-container/10'
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

        {/* Load More Button */}
        {offset && !isLoading && (
          <div className="col-span-full py-12 flex justify-center border-t border-white/5 mt-12">
            <button 
              onClick={() => fetchModels(offset)}
              disabled={isLoadingMore}
              className="group flex flex-col items-center gap-4 text-on-surface/40 hover:text-primary transition-all"
            >
              {isLoadingMore ? (
                <Loader2 className="animate-spin text-primary" size={32} />
              ) : (
                <>
                  <div className="p-4 bg-surface-container-high rounded-full group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
                    <ChevronDown size={24} />
                  </div>
                  <span className="font-label text-[10px] uppercase tracking-[0.3em] font-bold">Load More Models</span>
                </>
              )}
            </button>
          </div>
        )}

        {!isLoading && wikiResults.length === 0 && (
          <div className="col-span-full py-40 text-center bg-surface-container-low/50 border border-dashed border-white/10 rounded-2xl">
            <div className="flex flex-col items-center gap-4">
              <Database className="text-on-surface/10" size={48} />
              <p className="text-on-surface/40 font-body italic text-xl max-w-sm mx-auto">
                {searchQuery.length < 3 && searchQuery.length > 0
                  ? "Type at least 3 characters to search the global Hot Wheels history"
                  : `No legendary castings found matching "${searchQuery}"`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-on-surface/30 font-label text-[10px] uppercase tracking-widest flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Globe size={10}/> Total Models Loaded: {wikiResults.length}</span>
          <div className="w-[1px] h-3 bg-white/10"></div>
          <span className="flex items-center gap-1.5">Powered by Hot Wheels Fandom Wiki API</span>
        </div>
        {!user && (
          <p className="text-primary-container font-label text-[10px] uppercase tracking-widest font-bold animate-pulse bg-primary-container/10 px-4 py-2 rounded-full">
            Sign in to start acquiring new pieces
          </p>
        )}
      </footer>
    </main>
  );
}
