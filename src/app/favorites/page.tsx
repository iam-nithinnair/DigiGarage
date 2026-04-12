"use client";

import { useStore } from "@/store/useStore";
import ModelCard from "@/components/ModelCard";

export default function FavoritesPage() {
  const models = useStore(state => state.models);
  const favorites = models.filter(m => m.isFavorite);

  return (
    <main className="pb-24 px-8 max-w-[1440px] mx-auto w-full pt-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-2 block">Curated Selection</span>
          <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter text-on-surface">The Favorites</h1>
          <p className="text-on-surface/60 font-body max-w-2xl mt-4">The crown jewels of the collection. Curated for their historical significance, technical complexity, and sheer beauty.</p>
        </div>
      </header>

      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {favorites.map(model => (
             <ModelCard key={model.id} model={model} />
          ))}
          {favorites.length === 0 && (
            <div className="col-span-full pt-10 text-on-surface/50 font-body text-center">No favorites items found. Heart some from the collection.</div>
          )}
        </div>
      </section>
    </main>
  );
}
