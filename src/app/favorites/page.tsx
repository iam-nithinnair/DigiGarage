"use client";

import { useStore } from "@/store/useStore";
import ModelCard from "@/components/ModelCard";
import Image from "next/image";
import { Download, Heart, Maximize2, BarChart3, PlusCircle } from "lucide-react";

export default function FavoritesPage() {
  const models = useStore(state => state.models);
  const favorites = models.filter(m => m.isFavorite);

  const heroFavorite = favorites[0];
  const secondaryFavorite = favorites[1];
  const otherFavorites = favorites.slice(2);

  return (
    <main className="pt-32 pb-24 min-h-screen px-8 max-w-[1440px] mx-auto">
      {/* favorites-header */}
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6" id="favorites-header">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-primary-container"></div>
            <span className="font-label text-[10px] tracking-[0.2em] text-primary uppercase">Private Gallery</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
            The Crown <span className="text-primary-container">Jewels</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg">
            A curated sanctuary of your most prized acquisitions and sought-after engineering marvels. Precision defined, excellence preserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-label text-[10px] tracking-[0.1em] text-on-surface-variant/40 uppercase">Total Value</div>
            <div className="font-headline text-2xl font-bold text-on-surface">EST. $104.2M</div>
          </div>
          <div className="w-[1px] h-10 bg-outline-variant/15"></div>
          <button className="bg-surface-container-high hover:bg-surface-container-highest px-6 py-3 flex items-center gap-2 transition-all group">
            <Download size={16} className="text-on-surface-variant" />
            <span className="font-label text-[10px] tracking-widest uppercase">Export List</span>
          </button>
        </div>
      </header>

      {/* favorites-grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="favorites-grid">
        {heroFavorite ? (
          <div className="lg:col-span-8 group relative overflow-hidden bg-surface-container-low transition-all duration-300">
            <div className="aspect-[16/9] w-full relative">
              <Image 
                fill
                alt={heroFavorite.name} 
                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
                src={heroFavorite.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              {/* Action Overlay */}
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button className="w-12 h-12 bg-primary-container text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Heart size={24} fill="white" />
                </button>
                <button className="w-12 h-12 bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary-container transition-colors">
                  <Maximize2 size={24} />
                </button>
              </div>
            </div>
            <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex gap-4 mb-3">
                  <span className="bg-surface-bright px-3 py-1 font-label text-[10px] tracking-widest uppercase text-on-surface">Scale {heroFavorite.scale}</span>
                  <span className="bg-primary-container/10 border border-primary-container/20 px-3 py-1 font-label text-[10px] tracking-widest uppercase text-primary">Masterpiece</span>
                </div>
                <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface uppercase">{heroFavorite.name}</h2>
                <p className="font-body text-sm text-on-surface-variant/60 mt-2">{heroFavorite.year} • {heroFavorite.manufacturer} • {heroFavorite.series} Precision</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label text-[10px] tracking-widest text-on-surface-variant/40 uppercase mb-1">Market Valuation</span>
                <span className="font-headline text-3xl font-bold text-primary">$70,000,000+</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-surface-container-low flex items-center justify-center p-20 text-on-surface/50 font-body border border-dashed border-outline-variant/30">
            Select a masterpiece as your primary highlight.
          </div>
        )}

        {secondaryFavorite ? (
          <div className="lg:col-span-4 group flex flex-col bg-surface-container-low transition-all duration-300">
            <div className="aspect-square w-full relative overflow-hidden">
              <Image 
                fill
                alt={secondaryFavorite.name} 
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" 
                src={secondaryFavorite.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              {/* Action Overlay */}
              <div className="absolute top-4 right-4">
                <button className="w-10 h-10 bg-primary-container text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart size={20} fill="white" />
                </button>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="font-label text-[10px] tracking-widest text-primary uppercase mb-1">Modern Legend</div>
                <h3 className="font-headline text-2xl font-bold text-on-surface uppercase leading-tight">{secondaryFavorite.name}</h3>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant/10">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-[9px] font-label uppercase text-on-surface-variant/40 tracking-widest">Manufacturer</div>
                  <div className="text-xs font-headline font-semibold text-on-surface">{secondaryFavorite.manufacturer}</div>
                </div>
                <div>
                  <div className="text-[9px] font-label uppercase text-on-surface-variant/40 tracking-widest">Year</div>
                  <div className="text-xs font-headline font-semibold text-on-surface">{secondaryFavorite.year}</div>
                </div>
              </div>
              <button className="w-full py-4 bg-secondary-container hover:bg-primary-container transition-colors text-on-secondary-container hover:text-white font-label text-[10px] tracking-[0.2em] uppercase">
                Remove from Archive
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 bg-surface-container-low flex items-center justify-center p-20 text-on-surface/50 font-body border border-dashed border-outline-variant/30 text-center">
            Add more favorites to reveal secondary insights.
          </div>
        )}

        {/* Bento Stats Card */}
        <div className="lg:col-span-3 bg-surface-container-high p-8 flex flex-col justify-between aspect-square lg:aspect-auto min-h-[300px]">
          <BarChart3 className="text-primary-container w-10 h-10" />
          <div>
            <h4 className="font-headline text-3xl font-bold text-on-surface mb-2">Collection Density</h4>
            <p className="text-xs text-on-surface-variant/60 uppercase tracking-widest leading-relaxed">
              Your favorites represent {favorites.length > 0 ? Math.round((favorites.length / models.length) * 100) : 0}% of the total digital archive volume.
            </p>
          </div>
        </div>

        {/* Suggestion Card */}
        <div className="lg:col-span-9 bg-surface-container-low p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/3 aspect-video bg-surface-container-highest relative group cursor-pointer overflow-hidden">
            <Image 
              fill
              alt="Porsche 911 Singer" 
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMp9ZuTOC0cWdfBLAWbF9nH0gbLYeCv8_9eDpmPDQD7oADLrJYkM5J1_mLUGd33zh48McUUVigNNlgPIAyIv8wo-jKYXI4Jc_pP7OrDYDOjjWpiGJKez77UEQeWM6ULL5QzgUq1UyAJ4HWJZr1aR2_QySC9RtQqPbY6eF8nQtMhOis_f8PpiXBI-SsMBRvZA-8ykrDEWk5zh1MixOkaX-5xCpHTnEUK2LyKDSfPMjTopcVPtiztjrC0F4sfP_wOL1l5AbbsHi8Dw8"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/60">
              <PlusCircle className="text-white w-10 h-10" />
            </div>
          </div>
          <div className="flex-1">
            <div className="font-label text-[10px] tracking-[0.3em] text-on-surface-variant/40 uppercase mb-4">Curator Recommendation</div>
            <h3 className="font-headline text-3xl font-bold uppercase mb-4 leading-tight">Porsche 911 <span className="text-primary-container">Reimagined</span> by Singer</h3>
            <p className="font-body text-sm text-on-surface-variant/60 mb-6 max-w-md">Based on your interest in high-performance engineering, this restoration masterpiece belongs in your crown jewels.</p>
            <button className="border-b-2 border-primary-container pb-1 font-label text-[10px] tracking-widest uppercase hover:text-primary transition-colors">View Detailed Specs</button>
          </div>
        </div>

        {/* Other Favorites */}
        {otherFavorites.length > 0 && (
          <div className="lg:col-span-12 mt-12">
            <h3 className="font-headline text-2xl font-bold uppercase mb-8">Other Prized Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {otherFavorites.map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
