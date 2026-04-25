"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Search, Plus, Sparkles, CheckCircle2, Loader2, Globe, Database, ChevronDown, X, Info, Hash } from "lucide-react";
import { toast } from "sonner";

interface WikiCar {
  name: string;
  year: string;
  series: string;
  image: string;
  collectorNumber?: string;
  seriesNumber?: string;
}

export default function DiscoverPage() {
  const { addModel, models, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [wikiResults, setWikiResults] = useState<WikiCar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<WikiCar | null>(null);

  const fetchModels = async (currentOffset: number | null = null, isNewSearch: boolean = false) => {
    if (isNewSearch) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const isDefault = searchQuery.length < 3;
      const effectiveQuery = isDefault ? "2026 Hot Wheels mainline" : searchQuery;
      
      // We use generator=search to find pages, and pageimages for thumbnails
      // Added 'extracts' to try and get snippet data if needed
      let url = `https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&exchars=100&generator=search&piprop=thumbnail&pithumbsize=800&gsrlimit=50&gsrsearch=${encodeURIComponent(effectiveQuery)}`;
      
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
          .map((page: any) => {
            // Attempt to find a number like 123/250 in the extract
            const collectorMatch = page.extract?.match(/(\d{1,3})\/250/);
            const seriesMatch = page.extract?.match(/(\d{1,2})\/\d{1,2}/);

            return {
              name: page.title,
              year: isDefault ? "2026" : "N/A",
              series: "2026 Mainline",
              image: page.thumbnail.source,
              collectorNumber: collectorMatch ? collectorMatch[1] : undefined,
              seriesNumber: seriesMatch ? seriesMatch[0] : undefined
            };
          });

        if (isNewSearch) {
          setWikiResults(newResults);
        } else {
          setWikiResults(prev => [...prev, ...newResults]);
        }

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
      if (selectedModel?.name === model.name) setSelectedModel(null);
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
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">2026 Archive</span>
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
            Discover <span className="text-primary-container">Castings</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg text-lg">
            Cataloging the 250 Mainline models for 2026. Explore legendary silhouettes and high-detail captures from the global archive.
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
            <p className="font-label text-sm uppercase tracking-[0.3em] text-on-surface/40 animate-pulse">Accessing 2026 Master List...</p>
          </div>
        ) : wikiResults.map((item, index) => {
          const inCollection = isAlreadyInCollection(item.name);
          const isAdding = addingId === item.name;

          return (
            <article 
              key={index}
              onClick={() => setSelectedModel(item)}
              className="bg-surface-container-low group hover:bg-surface-container transition-all duration-500 border border-white/5 relative overflow-hidden flex flex-col cursor-pointer"
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
                
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info size={12} />
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label text-[9px] tracking-widest text-primary-container uppercase font-bold truncate pr-4">{item.series}</span>
                  <span className="font-label text-[9px] tracking-widest text-on-surface/40 uppercase font-bold">{item.year}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface uppercase mb-6 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                
                <div className="mt-auto">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(item);
                    }}
                    disabled={inCollection || isAdding || !user}
                    className={`w-full py-3 flex items-center justify-center gap-2 font-headline text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                      ${inCollection 
                        ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                        : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-white active:scale-95 shadow-lg shadow-primary-container/10'
                      }
                      ${!user ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isAdding ? <Loader2 size={14} className="animate-spin" /> : inCollection ? 'Owned' : <><Plus size={14} /> Acquire</>}
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
              {isLoadingMore ? <Loader2 className="animate-spin text-primary" size={32} /> : 
                <>
                  <div className="p-4 bg-surface-container-high rounded-full group-hover:bg-primary-container group-hover:text-on-primary-container transition-all"><ChevronDown size={24} /></div>
                  <span className="font-label text-[10px] uppercase tracking-[0.3em] font-bold">Load More 2026 Models</span>
                </>
              }
            </button>
          </div>
        )}
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setSelectedModel(null)}></div>
          <div className="relative w-full max-w-4xl bg-surface-container-low border border-white/5 shadow-2xl flex flex-col md:flex-row overflow-hidden rounded-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-1/2 aspect-square relative bg-black">
              <Image 
                fill
                unoptimized
                alt={selectedModel.name}
                src={selectedModel.image}
                className="object-contain p-8"
              />
              <button 
                onClick={() => setSelectedModel(null)}
                className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-primary-container transition-colors md:hidden"
              >
                <X size={20} />
              </button>
            </div>
            <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <span className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">{selectedModel.series}</span>
                  <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight uppercase leading-none">{selectedModel.name}</h2>
                </div>
                <button onClick={() => setSelectedModel(null)} className="hidden md:block p-2 hover:bg-surface-bright rounded-full transition-colors text-on-surface/40">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-on-surface/30">
                    <Hash size={12} />
                    <span className="font-label text-[10px] uppercase tracking-widest">Collector #</span>
                  </div>
                  <p className="font-headline text-2xl font-bold">{selectedModel.collectorNumber || 'TBD'} / 250</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-on-surface/30">
                    <Sparkles size={12} />
                    <span className="font-label text-[10px] uppercase tracking-widest">Series #</span>
                  </div>
                  <p className="font-headline text-2xl font-bold">{selectedModel.seriesNumber || 'TBD'}</p>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <button 
                  onClick={() => handleAdd(selectedModel)}
                  disabled={isAlreadyInCollection(selectedModel.name) || addingId === selectedModel.name || !user}
                  className={`w-full py-5 flex items-center justify-center gap-3 font-headline text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300
                    ${isAlreadyInCollection(selectedModel.name) 
                      ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                      : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-white active:scale-95 shadow-2xl'
                    }
                  `}
                >
                  {addingId === selectedModel.name ? <Loader2 size={18} className="animate-spin" /> : isAlreadyInCollection(selectedModel.name) ? 'Already in Collection' : <><Plus size={18} /> Acquire This Casting</>}
                </button>
                <p className="text-center text-[9px] font-label uppercase tracking-widest text-on-surface/20">Official 2026 Mattel Release Data</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Metrics */}
      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-on-surface/30 font-label text-[10px] uppercase tracking-widest flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Globe size={10}/> 2026 Archive: {wikiResults.length} Models Loaded</span>
        </div>
        {!user && (
          <p className="text-primary-container font-label text-[10px] uppercase tracking-widest font-bold animate-pulse bg-primary-container/10 px-4 py-2 rounded-full">
            Sign in to start acquiring 2026 pieces
          </p>
        )}
      </footer>
    </main>
  );
}
