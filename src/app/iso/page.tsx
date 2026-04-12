"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import ISOCard from "@/components/ISOCard";
import AddISOModal from "@/components/AddISOModal";
import { Plus } from "lucide-react";

export default function ISOPage() {
  const isoModels = useStore(state => state.isoModels);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="pb-24 px-8 max-w-[1440px] mx-auto w-full pt-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-2 block">Wishlist</span>
          <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter text-on-surface">ISO</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary-container text-on-primary-container font-headline font-bold px-8 py-4 flex items-center gap-2 hover:brightness-110 transition-all duration-200 active:scale-95 group">
          <Plus size={20} />
          ADD ISO
        </button>
      </header>
      
      <div className="max-w-5xl w-full flex flex-col gap-4">
        {isoModels.map(iso => (
          <ISOCard key={iso.id} iso={iso} />
        ))}
        {isoModels.length === 0 && (
          <div className="pt-10 text-on-surface/50 font-body text-center">Your ISO list is currently empty.</div>
        )}
      </div>

      <AddISOModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
