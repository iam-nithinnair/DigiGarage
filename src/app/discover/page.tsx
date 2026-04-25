"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Search, Plus, Sparkles, CheckCircle2, Loader2, Globe, Database, ChevronDown, X, Info, Hash, AlertTriangle } from "lucide-react";
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
  const [selectedModel, setSelectedModel] = useState<WikiCar | null>(null);

  // Core parsing logic for the 2026 Master List
  const fetch2026MasterList = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch raw wikitext
      const revRes = await fetch(`https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=revisions&rvprop=content&titles=List_of_2026_Hot_Wheels`);
      const revData = await revRes.json();
      const pageId = Object.keys(revData.query.pages)[0];
      const content = revData.query.pages[pageId].revisions[0]['*'];

      // 2. Parse the table rows
      const rows = content.split('|-').slice(1); // Skip header
      const parsedCars: any[] = [];

      for (const row of rows) {
        const cells = row.split('\n|').map((c: string) => c.trim()).filter(Boolean);
        if (cells.length < 5) continue;

        // Cells: 0: Toy#, 1: Col#, 2: Name, 3: Series, 4: Series#, 5: Photo
        const collectorNumber = cells[1]?.replace(/^\|/, '').trim();
        
        // Clean name (remove [[ ]], pipe text, and (2nd color) etc)
        let rawName = cells[2]?.replace(/^\|/, '').replace(/\[\[|\]\]/g, '').split('|').pop() || "";
        const isVariation = rawName.includes('Color)');
        if (isVariation) continue; // We only want unique castings for the main list

        const series = cells[3]?.replace(/bgcolor=".*"\|/, '').replace(/\[\[|\]\]/g, '').split('|').pop() || "2026 Mainline";
        const seriesNumber = cells[4]?.trim();
        
        // Extract filename from [[File:Name.jpg|...]]
        const fileMatch = cells[5]?.match(/File:([^|\]]+)/);
        const fileName = fileMatch ? fileMatch[1] : null;

        if (fileName && fileName !== "Image Not Available.jpg") {
          parsedCars.push({
            name: rawName,
            year: "2026",
            series: series,
            fileName: fileName,
            collectorNumber,
            seriesNumber
          });
        }
        if (parsedCars.length >= 100) break; // Load first 100 for performance
      }

      // 3. Resolve filenames to real URLs (Batch resolve up to 50 at a time)
      const batchSize = 50;
      const finalCars: WikiCar[] = [];
      
      for (let i = 0; i < parsedCars.length; i += batchSize) {
        const batch = parsedCars.slice(i, i + batchSize);
        const titles = batch.map(c => `File:${c.fileName}`).join('|');
        const imgRes = await fetch(`https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(titles)}`);
        const imgData = await imgRes.json();
        
        const urlMap: Record<string, string> = {};
        if (imgData.query?.pages) {
          Object.values(imgData.query.pages).forEach((p: any) => {
            if (p.imageinfo?.[0]?.url) {
              urlMap[p.title] = p.imageinfo[0].url;
            }
          });
        }

        batch.forEach(c => {
          const url = urlMap[`File:${c.fileName}`];
          if (url) {
            finalCars.push({
              ...c,
              image: url
            });
          }
        });
      }

      setWikiResults(finalCars);
    } catch (error) {
      console.error("Master list fetch failed:", error);
      toast.error("Failed to load exact 2026 models");
    } finally {
      setIsLoading(false);
    }
  };

  // Search logic (Global fallback)
  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&exchars=200&generator=search&piprop=thumbnail&pithumbsize=1000&gsrlimit=40&gsrsearch=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.query?.pages) {
        const results: WikiCar[] = Object.values(data.query.pages)
          .sort((a: any, b: any) => a.index - b.index)
          .filter((page: any) => page.thumbnail)
          .map((page: any) => ({
            name: page.title,
            year: "N/A",
            series: "Global Archive",
            image: page.thumbnail.source,
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
      {/* Header Section */}
      <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-primary-container" size={20} />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">2026 Digital Showroom</span>
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-6 uppercase italic">
            Exact <span className="text-primary-container">Castings</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg text-lg">
            Direct synchronization with the official 2026 mainline catalog. Verify every silhouette, number, and deco before adding to your vault.
          </p>
        </div>

        <div className="relative w-full md:w-[500px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            aria-label="Search global Hot Wheels archive"
            placeholder="Search archive (e.g. Twin Mill, Skyline)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-5 pl-14 pr-8 focus:border-primary transition-all outline-none font-body text-base text-on-surface shadow-2xl"
          />
        </div>
      </header>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {isLoading ? (
          <div className="col-span-full py-40 flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-primary-container" size={64} />
            <p className="font-label text-sm uppercase tracking-[0.3em] text-on-surface/40 animate-pulse">Syncing Official 2026 Master List...</p>
          </div>
        ) : wikiResults.map((item, index) => {
          const inCollection = isAlreadyInCollection(item.name);
          const isAdding = addingId === item.name;

          return (
            <article 
              key={index}
              onClick={() => setSelectedModel(item)}
              className="bg-surface-container-low group hover:bg-surface-container transition-all duration-500 border border-white/5 relative overflow-hidden flex flex-col cursor-pointer shadow-lg"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
                <Image 
                  fill
                  unoptimized
                  alt={item.name}
                  src={item.image}
                  className="object-contain p-4 opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
                
                {inCollection && (
                  <div className="absolute top-4 left-4 bg-primary-container/90 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl z-20">
                    <CheckCircle2 size={12} />
                    <span className="font-label text-[9px] font-bold uppercase tracking-wider">In Vault</span>
                  </div>
                )}
                
                {item.collectorNumber && (
                   <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-on-surface/60 font-headline text-[10px] font-bold px-2 py-1 z-20 border border-white/5">
                     #{item.collectorNumber}
                   </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col border-t border-white/5">
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
                        : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-white active:scale-95 shadow-lg'
                      }
                      ${!user ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isAdding ? <Loader2 size={14} className="animate-spin" /> : inCollection ? 'Secured' : <><Plus size={14} /> Acquire</>}
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!isLoading && wikiResults.length === 0 && (
          <div className="col-span-full py-40 text-center bg-surface-container-low/50 border border-dashed border-white/10 rounded-2xl">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="text-on-surface/10" size={48} />
              <p className="text-on-surface/40 font-body italic text-xl">No exact matches found for your search.</p>
            </div>
          </div>
        )}
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setSelectedModel(null)}></div>
          <div className="relative w-full max-w-5xl bg-surface-container-low border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="w-full md:w-[55%] aspect-square relative bg-[#050505] flex items-center justify-center group/img">
              <Image 
                fill
                unoptimized
                alt={selectedModel.name}
                src={selectedModel.image}
                className="object-contain p-12 transition-transform duration-700 group-hover/img:scale-105"
              />
              <div className="absolute bottom-10 left-10 flex gap-4">
                 <div className="bg-primary/20 backdrop-blur-md px-4 py-2 border border-primary/30">
                    <span className="font-label text-[10px] uppercase text-primary font-black tracking-[0.2em]">Product Capture</span>
                 </div>
              </div>
            </div>
            <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col border-l border-white/5 bg-gradient-to-br from-surface-container-low to-background">
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-8 bg-primary"></div>
                    <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary font-bold">{selectedModel.series}</span>
                  </div>
                  <h2 className="font-headline text-5xl font-black text-on-surface tracking-tighter uppercase leading-[0.9]">{selectedModel.name}</h2>
                </div>
                <button onClick={() => setSelectedModel(null)} className="p-2 hover:bg-surface-bright rounded-full transition-all text-on-surface/20 hover:text-on-surface">
                  <X size={28} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-10 mb-16">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                   <div className="space-y-1">
                      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/30">Collector Number</span>
                      <p className="font-headline text-4xl font-bold text-on-surface italic">{selectedModel.collectorNumber || 'TBD'}<span className="text-on-surface/20 not-italic ml-2">/ 250</span></p>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                      <Hash size={20} className="text-primary-container" />
                   </div>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                   <div className="space-y-1">
                      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/30">Series Progress</span>
                      <p className="font-headline text-4xl font-bold text-on-surface">{selectedModel.seriesNumber || 'TBD'}</p>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                      <Database size={20} className="text-primary-container" />
                   </div>
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <button 
                  onClick={() => handleAdd(selectedModel)}
                  disabled={isAlreadyInCollection(selectedModel.name) || addingId === selectedModel.name || !user}
                  className={`w-full py-6 flex items-center justify-center gap-4 font-headline text-sm font-black tracking-[0.3em] uppercase transition-all duration-500
                    ${isAlreadyInCollection(selectedModel.name) 
                      ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                      : 'bg-primary-container text-on-primary-container hover:bg-white hover:text-black active:scale-[0.98] shadow-2xl'
                    }
                  `}
                >
                  {addingId === selectedModel.name ? <Loader2 size={20} className="animate-spin" /> : isAlreadyInCollection(selectedModel.name) ? 'Already Cataloged' : <><Plus size={20} /> Secure Acquisition</>}
                </button>
                <div className="flex justify-center items-center gap-2">
                   <Globe size={10} className="text-on-surface/20" />
                   <p className="text-[9px] font-label uppercase tracking-[0.2em] text-on-surface/20">Verified 2026 Mainline Prototype Data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
