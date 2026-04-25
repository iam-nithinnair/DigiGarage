"use client";

import Image from "next/image";
import { useStore, Model } from "@/store/useStore";
import Link from "next/link";
import { Heart, Trash2, BadgeCheck, MapPin, Tag } from "lucide-react";

interface ModelCardProps {
  model: Model;
}

export default function ModelCard({ model }: ModelCardProps) {
  const { toggleFavorite, removeModel } = useStore();

  return (
    <article className="group bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] flex flex-col h-full border border-white/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-lowest shrink-0">
        {model.image ? (
          <Image
            fill
            alt={model.name}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            src={model.image}
          />
        ) : (
          <div className="w-full h-full bg-surface-variant flex items-center justify-center font-headline text-on-surface/50">No Image</div>
        )}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button 
            onClick={() => toggleFavorite(model.id)}
            aria-label={model.isFavorite ? `Unfavorite ${model.name}` : `Favorite ${model.name}`}
            className={`p-2 bg-background/60 backdrop-blur-md rounded-full transition-colors ${model.isFavorite ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
          >
             <Heart size={18} fill={model.isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        {/* Museum Condition Tag */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
          {model.condition && (
            <span className="bg-primary-container/90 backdrop-blur-md text-on-primary-container font-label text-[8px] px-2 py-0.5 tracking-widest uppercase font-bold shadow-lg">
              {model.condition}
            </span>
          )}
        </div>

        <div className="absolute bottom-4 left-4 z-10">
          <span className="bg-surface-bright text-on-surface font-label text-[10px] px-2 py-1 tracking-wider uppercase">
            {model.series}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-headline text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{model.name}</h3>
            <p className="text-on-surface/60 text-sm font-label uppercase tracking-widest">{model.year} • {model.manufacturer}</p>
          </div>
          <span className="font-headline font-bold text-lg text-primary">{model.scale}</span>
        </div>

        {/* Hobby Metrics */}
        <div className="flex flex-wrap gap-3 mb-6">
          {model.purchase_price !== undefined && (
            <div className="flex items-center gap-1.5 text-on-surface/40">
              <Tag size={12} className="text-primary-container" />
              <span className="font-label text-[10px] uppercase tracking-tighter">${model.purchase_price.toFixed(2)}</span>
            </div>
          )}
          {model.storage_location && (
            <div className="flex items-center gap-1.5 text-on-surface/40">
              <MapPin size={12} className="text-primary-container" />
              <span className="font-label text-[10px] uppercase tracking-tighter">{model.storage_location}</span>
            </div>
          )}
          {model.grade && (
            <div className="flex items-center gap-1.5 text-on-surface/40 border-l border-white/10 pl-3">
              <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface/60">GRADE: {model.grade}</span>
            </div>
          )}
        </div>

        <div className="pt-4 mt-auto flex items-center justify-between border-t border-outline-variant/15">
          <button 
            onClick={() => removeModel(model.id)}
            aria-label={`Remove ${model.name} from collection`}
            className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface/40 hover:text-error transition-colors flex items-center gap-1 group/btn"
          >
            <Trash2 size={14} />
            Remove
          </button>
          <BadgeCheck size={20} className="text-on-surface/20" />
        </div>
      </div>
    </article>
  );
}
