"use client";

import { useStore, ISOModel } from "@/store/useStore";

interface ISOCardProps {
  iso: ISOModel;
}

export default function ISOCard({ iso }: ISOCardProps) {
  const { removeISOModel } = useStore();

  return (
    <div className="bg-surface p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-surface-container-high transition-colors group">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold font-headline">{iso.name}</h3>
        <div className="flex gap-4 mt-2">
          <span className="px-2 py-1 bg-surface-container-highest text-[10px] font-bold font-headline uppercase tracking-tighter">Target Price: {iso.targetPrice}</span>
          <span className="px-2 py-1 bg-primary-container text-[10px] font-bold font-headline uppercase tracking-tighter">Rarity: {iso.rarity}</span>
        </div>
      </div>
      <button 
        onClick={() => removeISOModel(iso.id)}
        className="px-6 py-3 border border-outline-variant/30 hover:bg-error hover:border-error hover:text-white transition-all font-headline uppercase text-xs tracking-widest font-bold"
      >
        Remove
      </button>
    </div>
  );
}
