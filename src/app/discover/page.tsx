"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";

import { Search, Plus, Sparkles, CheckCircle2, Loader2, Globe, Database, ChevronDown, X, Info, Hash, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WikiCar {
  name: string;
  year: string;
  series: string;
  image: string;
  collectorNumber?: string;
  seriesNumber?: string;
  fullTitle?: string;
}

export default function DiscoverPage() {
  const { addModel, models, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [wikiResults, setWikiResults] = useState<WikiCar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<WikiCar | null>(null);

  // Core parsing logic for the 2026 Master List
  const fetch2026MasterList = async () => {
    setIsLoading(true);
    try {
      const revRes = await fetch(`https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=revisions&rvprop=content&titles=List_of_2026_Hot_Wheels`);
      const revData = await revRes.json();
      const pageId = Object.keys(revData.query.pages)[0];
      const content = revData.query.pages[pageId].revisions[0]['*'];

      const rows = content.split('|-').slice(1);
      const parsedCars: any[] = [];

      for (const row of rows) {
        const cells = row.split('\n|').map((c: string) => c.trim()).filter(Boolean);
        if (cells.length < 5) continue;

        const collectorNumber = cells[1]?.replace(/^\|/, '').trim();
        const rawCell2 = cells[2]?.replace(/^\|/, '');
        
        const titleMatch = rawCell2.match(/\[\[([^|\]]+)/);
        const fullTitle = titleMatch ? titleMatch[1] : null;
        const displayName = rawCell2.replace(/\[\[|\]\]/g, '').split('|').pop() || "";
        
        if (displayName.includes('Color)')) continue;

        const rawSeries = cells[3]?.replace(/bgcolor=".*"\|/, '').replace(/\[\[|\]\]/g, '').split('|').pop() || "2026 Mainline";
        const series = rawSeries.replace(/<[^>]*>/g, '').replace(/\{\{[^}]*\}\}/g, '').trim();
        const fileMatch = cells[5]?.match(/File:([^|\]]+)/);
        const fileName = fileMatch ? fileMatch[1] : null;

        // If it's a real car image filename, use it
        if (fileName && fileName !== "Image Not Available.jpg") {
          parsedCars.push({
            name: displayName,
            year: "2026",
            series,
            fullTitle,
            fileName,
            collectorNumber
          });
        }
        if (parsedCars.length >= 80) break;
      }

      // Step 3: Exact Filename Resolution
      const finalCars: WikiCar[] = [];
      const batchSize = 40;

      for (let i = 0; i < parsedCars.length; i += batchSize) {
        const batch = parsedCars.slice(i, i + batchSize);
        const titles = batch.map(c => `File:${c.fileName}`).join('|');
        const imgRes = await fetch(`https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(titles)}`);
        const imgData = await imgRes.json();
        const pages = imgData.query?.pages || {};

        batch.forEach(c => {
          const filePage: any = Object.values(pages).find((p: any) => p.title.toLowerCase() === `file:${c.fileName?.toLowerCase()}`);
          const resolvedUrl = filePage?.imageinfo?.[0]?.url || "";

          if (resolvedUrl) {
            finalCars.push({
              ...c,
              image: resolvedUrl
            });
          }
        });
      }
      setWikiResults(finalCars);
    } catch (error) {
      console.error("Master list fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&exchars=200&generator=search&piprop=original&gsrlimit=40&gsrsearch=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.query?.pages) {
        const results: WikiCar[] = Object.values(data.query.pages)
          .sort((a: any, b: any) => a.index - b.index)
          .filter((page: any) => page.original?.source && !page.original.source.includes('Image_Not_Available'))
          .map((page: any) => ({
            name: page.title,
            year: "N/A",
            series: "Global Archive",
            image: page.original.source,
          }));
        setWikiResults(results);
      } else {
        setWikiResults([]);
      }
    } catch (error) {
      toast.error("Global search failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 3) {
      const timer = setTimeout(() => performSearch(searchQuery), 600);
      return () => clearTimeout(timer);
    } else if (searchQuery.length === 0) {
      fetch2026MasterList();
    }
  }, [searchQuery]);

  const isAlreadyInCollection = (name: string) => {
    return models.some(m => m.name.toLowerCase() === name.toLowerCase());
  };

  const handleAdd = async (model: WikiCar) => {
    if (!user) {
      toast.error("Sign in required");
      return;
    }
    setAddingId(model.name);
    try {
      await addModel({
        ...model,
        manufacturer: "Hot Wheels",
        scale: "1:64",
      });
      toast.success("Acquired successfully");
      if (selectedModel?.name === model.name) setSelectedModel(null);
    } catch (err) {
      toast.error("Failed to add");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full min-h-screen">
      <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-primary-container" size={20} />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">2026 Digital Archive</span>
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
            Product <span className="text-primary-container">Showroom</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg text-lg">
            Cataloging every unique 2026 casting with official prototype captures. No placeholders, just pure engineering.
          </p>
        </div>

        <div className="relative w-full md:w-[500px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            autoFocus
            aria-label="Search Hot Wheels castings from global archive"
            placeholder="Search archive (e.g. Twin Mill, Skyline)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-5 pl-14 pr-8 focus:border-primary transition-all outline-none font-body text-base text-on-surface shadow-2xl"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
        {isLoading ? (
          <div className="col-span-full py-40 flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-primary-container" size={64} />
            <p className="font-label text-sm uppercase tracking-[0.3em] text-on-surface/40 animate-pulse">Synchronizing Hi-Res Catalog...</p>
          </div>
        ) : wikiResults.map((item, index) => {
          const inCollection = isAlreadyInCollection(item.name);
          const isAdding = addingId === item.name;

          return (
            <article 
              key={index}
              onClick={() => setSelectedModel(item)}
              className="bg-surface-container-low group hover:bg-surface-container transition-all duration-500 border border-white/5 relative overflow-hidden flex flex-col cursor-pointer shadow-lg hover:shadow-primary/5"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#050505] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  alt={item.name}
                  src={item.image}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                
                {inCollection && (
                  <div className="absolute top-4 left-4 bg-primary-container/90 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl z-20">
                    <CheckCircle2 size={12} />
                    <span className="font-label text-[9px] font-bold uppercase tracking-wider">In Vault</span>
                  </div>
                )}
                
                {item.collectorNumber && (
                   <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-on-surface/60 font-headline text-[10px] font-bold px-2 py-1 z-20 border border-white/5 tracking-widest">
                     #{item.collectorNumber}
                   </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col border-t border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label text-[9px] tracking-[0.2em] text-primary uppercase font-bold truncate pr-4">{item.series}</span>
                </div>
                <h3 className="font-headline text-lg font-black text-on-surface uppercase mb-6 line-clamp-2 min-h-[3rem] leading-[1.1] group-hover:text-primary transition-colors">{item.name}</h3>
                
                <div className="mt-auto pt-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(item);
                    }}
                    disabled={inCollection || isAdding || !user}
                    className={`w-full py-3 flex items-center justify-center gap-2 font-headline text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300
                      ${inCollection 
                        ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                        : 'bg-primary-container text-on-primary-container hover:bg-white hover:text-black active:scale-95'
                      }
                    `}
                  >
                    {isAdding ? <Loader2 size={12} className="animate-spin" /> : inCollection ? 'Cataloged' : <><Plus size={12} /> Acquire</>}
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!isLoading && wikiResults.length === 0 && (
          <div className="col-span-full py-40 text-center bg-surface-container-low/50 border border-dashed border-white/10 rounded-3xl">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="text-on-surface/10" size={64} />
              <p className="text-on-surface/40 font-body italic text-xl max-w-sm mx-auto">No exact casting images found in this sector.</p>
            </div>
          </div>
        )}
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-background/98 backdrop-blur-2xl" onClick={() => setSelectedModel(null)}></div>
          <div className="relative w-full max-w-6xl bg-surface-container-low border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="w-full md:w-[60%] aspect-square relative bg-[#020202] flex items-center justify-center p-16 group/img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                alt={selectedModel.name}
                src={selectedModel.image}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-contain p-12 transition-transform duration-1000 group-hover/img:scale-105"
              />
            </div>
            <div className="w-full md:w-[40%] p-10 md:p-16 flex flex-col border-l border-white/5 bg-gradient-to-br from-surface-container-low to-background">
              <div className="flex justify-between items-start mb-16">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-12 bg-primary"></div>
                    <span className="font-label text-[11px] uppercase tracking-[0.5em] text-primary font-black">{selectedModel.series}</span>
                  </div>
                  <h2 className="font-headline text-6xl font-black text-on-surface tracking-tighter uppercase leading-[0.85]">{selectedModel.name}</h2>
                </div>
                <button onClick={() => setSelectedModel(null)} className="p-3 hover:bg-surface-bright rounded-full transition-all text-on-surface/20 hover:text-on-surface">
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-12 mb-16">
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                   <div className="space-y-1">
                      <span className="font-label text-[11px] uppercase tracking-[0.2em] text-on-surface/30 font-bold">Collector Sequence</span>
                      <p className="font-headline text-5xl font-black text-on-surface italic">{selectedModel.collectorNumber || 'TBD'}<span className="text-on-surface/20 not-italic ml-3 text-3xl">/ 250</span></p>
                   </div>
                </div>
              </div>

              <div className="mt-auto space-y-8">
                <button 
                  onClick={() => handleAdd(selectedModel)}
                  disabled={isAlreadyInCollection(selectedModel.name) || addingId === selectedModel.name || !user}
                  className={`w-full py-8 flex items-center justify-center gap-6 font-headline text-sm font-black tracking-[0.4em] uppercase transition-all duration-700
                    ${isAlreadyInCollection(selectedModel.name) 
                      ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                      : 'bg-primary-container text-on-primary-container hover:bg-white hover:text-black active:scale-[0.97] shadow-2xl'
                    }
                  `}
                >
                  {addingId === selectedModel.name ? <Loader2 size={24} className="animate-spin" /> : isAlreadyInCollection(selectedModel.name) ? 'Secured in Vault' : <><Plus size={24} /> Acquire Casting</>}
                </button>
                <p className="text-center text-[10px] font-label uppercase tracking-[0.3em] text-on-surface/10 font-bold italic">Official Mattel 2026 Reference Documentation</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
