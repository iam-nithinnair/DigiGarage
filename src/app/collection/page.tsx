"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import ModelCard from "@/components/ModelCard";
import AddModal from "@/components/AddModal";
import { Plus, ChevronDown } from "lucide-react";

export default function CollectionPage() {
  const models = useStore(state => state.models);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  
  const [sortParam, setSortParam] = useState("Name: A-Z");
  const [seriesFilter, setSeriesFilter] = useState<string[]>([]);
  const [manFilter, setManFilter] = useState<string[]>([]);

  // Sorting and Filtering logic
  let displayedModels = [...models];

  if (seriesFilter.length > 0) {
    displayedModels = displayedModels.filter(m => seriesFilter.includes(m.series));
  }

  if (manFilter.length > 0) {
    displayedModels = displayedModels.filter(m => manFilter.includes(m.manufacturer));
  }

  displayedModels.sort((a, b) => {
    switch(sortParam) {
      case "Year: Newest First":
        return Number(b.year) - Number(a.year);
      case "Year: Oldest First":
        return Number(a.year) - Number(b.year);
      case "Name: Z-A":
        return b.name.localeCompare(a.name);
      case "Name: A-Z":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const toggleSeries = (s: string) => {
    setSeriesFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleMan = (m: string) => {
    setManFilter(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  return (
    <main className="pb-24 px-8 max-w-[1440px] mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pt-12">
        <div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-2 block">Archive Overview</span>
          <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter text-on-surface">My Collection</h1>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="bg-primary-container text-on-primary-container font-headline font-bold px-8 py-4 flex items-center gap-2 hover:brightness-110 transition-all duration-200 active:scale-95 group">
          <Plus size={20} />
          ADD TO COLLECTION
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-64 space-y-10 shrink-0">
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 mb-6">Sort By</h3>
            <div className="relative">
              <select value={sortParam} onChange={(e) => setSortParam(e.target.value)} className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/15 text-on-surface font-headline py-3 px-0 focus:border-primary-container focus:ring-0 appearance-none cursor-pointer">
                <option>Name: A-Z</option>
                <option>Name: Z-A</option>
                <option>Year: Newest First</option>
                <option>Year: Oldest First</option>
              </select>
              <ChevronDown size={20} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface/40" />
            </div>
          </div>
          
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 mb-6">Series</h3>
            <div className="space-y-3">
              {['Die-Cast', 'Resin', 'Composite'].map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={seriesFilter.includes(s)} onChange={() => toggleSeries(s)} className="w-5 h-5 bg-surface-container-high border-none text-primary-container rounded-sm focus:ring-offset-background" />
                  <span className="font-headline text-sm group-hover:text-primary transition-colors">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 mb-6">Manufacturer</h3>
            <div className="space-y-3">
              {Array.from(new Set(models.map(m => m.manufacturer))).map(m => (
                <label key={m} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={manFilter.includes(m)} onChange={() => toggleMan(m)} className="w-5 h-5 bg-surface-container-high border-none text-primary-container rounded-sm focus:ring-offset-background" />
                  <span className="font-headline text-sm group-hover:text-primary transition-colors">{m}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Collection Grid */}
        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayedModels.map(model => (
              <ModelCard key={model.id} model={model} />
            ))}
            {displayedModels.length === 0 && (
              <div className="col-span-full pt-10 text-on-surface/50 font-body text-center">No models found for these filters.</div>
            )}
          </div>
        </section>
      </div>

      <AddModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
    </main>
  );
}
