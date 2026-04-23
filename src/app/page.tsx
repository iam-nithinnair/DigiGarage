"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import ModelCard from "@/components/ModelCard";
import ISOCard from "@/components/ISOCard";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const models = useStore((state) => state.models);
  const isoModels = useStore((state) => state.isoModels);

  const collectionSlice = models.slice(0, 3);
  const isoSlice = isoModels.slice(0, 2);
  const favoritesSlice = models.filter((m) => m.isFavorite).slice(0, 2);

  return (
    <main className="w-full">
      {/* hero-section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-8 md:px-20 overflow-hidden" id="hero-section">
        <div className="absolute inset-0 z-0">
          <Image
            fill
            className="object-cover opacity-60 brightness-75"
            alt="Close-up of a high-detail 1:18 scale red Ferrari racing car"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQqEqi2vEE-u2--OV92WPWgBQNNgW-v35Rpf_Ueo35pPRqecBYqVLKWZmHeOE36uYbVHpjXW4GDJR9x4Thu__6ASGoLxKcBOfEnLCh33jgBQ-i9tvSAb9fMQtcQh_qS8HqsrQVrQ30UG3lyclUzB_EM90BElZNExZOVCzVz5DgygFcgz2S39KE_I8hb0e-q6Z8iM9hW_YTTrbF3zK65solLxJv0oJi3YxtRB_I9zU8i0yglceSzR_xnwAQSwpkPUnsMwjZviXlu_Y"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-dim via-surface-dim/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-headline uppercase tracking-[0.2em] text-primary/80">Premium Heritage</span>
            <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-[0.9] text-on-surface">
              Your Digital Garage, <br />
              <span className="text-primary-container">Perfected.</span>
            </h1>
          </div>
          <p className="text-xl text-on-surface/70 font-body max-w-xl">
            Archiving automotive legends with surgical precision. The definitive platform for the modern scale model collector.
          </p>
          <div className="flex gap-4 pt-4">
            <Link 
              href="/collection" 
              aria-label="Explore the full scale model collection"
              className="px-8 py-4 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
            >
              Explore Collection
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* my-collections-section */}
      <section className="py-24 px-8 md:px-20 bg-surface flex flex-col gap-12" id="my-collections-section">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 max-w-[1440px] mx-auto w-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold font-headline tracking-tight">My Collections</h2>
            <div className="h-1 w-20 bg-primary-container"></div>
          </div>
          <div className="flex gap-2">
            <Link href="/collection" className="text-on-surface/60 hover:text-primary transition-colors font-headline text-sm font-bold tracking-widest uppercase">
              View All
            </Link>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-8 pb-8 no-scrollbar scroll-smooth max-w-[1440px] mx-auto w-full">
          {collectionSlice.map((model) => (
             <div key={model.id} className="min-w-[320px] md:min-w-[400px]">
               <ModelCard model={model} />
             </div>
          ))}
        </div>
      </section>

      {/* iso-section */}
      <section className="py-24 px-8 md:px-20 bg-surface-container-low flex flex-col gap-12" id="iso-section">
        <div className="flex flex-col gap-2 items-center text-center">
          <span className="text-sm font-headline uppercase tracking-[0.3em] text-[#FF4D4D]">Wishlist</span>
          <h2 className="text-5xl font-black font-headline tracking-tighter">In Search Of</h2>
          <Link href="/iso" className="text-primary-container hover:brightness-110 transition-colors font-headline text-sm font-bold tracking-widest uppercase mt-4">
              View All ISO
          </Link>
        </div>
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-4">
          {isoModels.length > 0 ? (
            isoModels.slice(0, 3).map(iso => (
              <div key={iso.id} className="bg-surface p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-surface-container-high transition-colors group">
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-bold font-headline">{iso.name}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="px-2 py-1 bg-surface-container-highest text-[10px] font-bold font-headline uppercase tracking-tighter">Target Price: {iso.targetPrice}</span>
                    <span className="px-2 py-1 bg-primary-container text-[10px] font-bold font-headline uppercase tracking-tighter">Rarity: {iso.rarity}</span>
                  </div>
                </div>
                <button 
                  aria-label={`Search sellers for ${iso.name}`}
                  className="px-6 py-3 border border-outline-variant/30 hover:bg-primary-container hover:text-white transition-all font-headline uppercase text-xs tracking-widest font-bold"
                >
                  Search Sellers
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-on-surface/60 font-body py-10">No items in your wishlist yet.</div>
          )}
        </div>
      </section>

      {/* favorites-section */}
      <section className="py-24 px-8 md:px-20 bg-surface flex flex-col gap-16 max-w-[1440px] mx-auto" id="favorites-section">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 w-full">
          <div className="flex flex-col gap-4">
            <h2 className="text-6xl font-black font-headline tracking-tighter text-on-surface">The Favorites</h2>
            <p className="text-base text-on-surface/60 max-w-2xl">The crown jewels of the collection. Curated for their historical significance, technical complexity, and sheer beauty.</p>
          </div>
          <Link href="/favorites" className="text-on-surface/60 hover:text-primary transition-colors font-headline text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              View All Favorites <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {favoritesSlice.map((model) => (
             <ModelCard key={model.id} model={model} />
           ))}
           {favoritesSlice.length === 0 && (
             <div className="text-on-surface/50 font-body">No favorites right now. Check back when you find a crown jewel!</div>
           )}
        </div>
      </section>
    </main>
  );
}
