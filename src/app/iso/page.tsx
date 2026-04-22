"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import AddISOModal from "@/components/AddISOModal";
import { Plus, Trash2, Info } from "lucide-react";

export default function ISOPage() {
  const isoModels = useStore(state => state.isoModels);
  const removeISOModel = useStore(state => state.removeISOModel);
  const [isModalOpen, setModalOpen] = useState(false);

  const featuredISO = isoModels[0];
  const otherISOs = isoModels.slice(1);

  return (
    <main className="pt-24 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      {/* iso-header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-[#5e3f3a]/15 pb-8" id="iso-header">
        <div className="space-y-2">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Mission Brief</span>
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase italic">In Search Of</h1>
          <p className="text-on-surface/60 max-w-md font-light">Precision tracking for the world's rarest die-cast engineering marvels. Your hunt starts here.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-primary-container text-on-primary-container px-6 py-3 font-headline font-bold flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 group"
        >
          <Plus size={16} />
          <span>ADD TO ISO</span>
        </button>
      </section>

      {/* iso-list (Bento Grid Style) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6" id="iso-list">
        {featuredISO ? (
          <div className="md:col-span-8 group relative overflow-hidden bg-surface-container-low rounded-xl flex flex-col md:flex-row shadow-2xl transition-all duration-300 hover:bg-surface-container-high">
            <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-black relative">
              <Image 
                fill
                alt={featuredISO.name}
                className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxiGdEMZf3Ut9pLh9-TKLtf7y5aYyQLjWIw6FcJbmyd4X_e6K2vPB5n2F1T4ctT4gxSTX-0XL4N3BVtkXSUzPTe19hpfPIv-r7WBrrgEMQymtbKEJr31V6xJeTYiGhhwssvKqgaegOJcsG1riZevR45Se8Hcxt2Unte9lieOm7Ny7j4dfaJvh0VjnAfNq8xTIOPnWjaoG6_yRyKRzvIWJPmezwzq45vVTGtClQrcj44VxJQv0bn8DYfL0u6qurW5NSDZDYVAUIojA"
              />
            </div>
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-surface-bright px-3 py-1 font-label text-[10px] tracking-widest text-on-surface uppercase">Scale 1:18</span>
                  <span className="text-primary font-label text-[10px] tracking-tighter font-bold uppercase border border-primary/20 px-2 py-0.5">{featuredISO.rarity}</span>
                </div>
                <h2 className="text-3xl font-headline font-extrabold tracking-tighter uppercase mb-2">{featuredISO.name}</h2>
                <div className="flex gap-4 text-xs font-label uppercase text-on-surface/40 mb-6">
                  <span>Collector Edition</span>
                  <span>•</span>
                  <span>Premium Series</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-label text-on-surface/40 uppercase">Est. Value</span>
                  <span className="text-xl font-headline font-bold">{featuredISO.targetPrice}</span>
                </div>
                <button 
                  onClick={() => removeISOModel(featuredISO.id)}
                  className="flex items-center gap-2 text-error hover:text-white transition-colors group/btn"
                >
                  <Trash2 size={16} />
                  <span className="font-label text-[10px] uppercase tracking-widest">Remove Hunt</span>
                </button>
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 transition-all pointer-events-none"></div>
          </div>
        ) : (
          <div className="md:col-span-8 bg-surface-container-low rounded-xl flex items-center justify-center p-20 text-on-surface/50 font-body border border-dashed border-outline-variant/30">
            No active hunts. Start your mission by adding a model.
          </div>
        )}

        {/* Side Metric Card */}
        <div className="md:col-span-4 bg-primary-container p-8 flex flex-col justify-between relative overflow-hidden rounded-xl">
          <div className="absolute top-[-20px] right-[-20px] text-white/10 font-headline font-black text-9xl pointer-events-none italic">ISO</div>
          <div className="z-10">
            <h3 className="font-headline font-bold text-2xl mb-4 leading-tight uppercase">Curator's Insights</h3>
            <p className="text-on-primary-container/80 text-sm leading-relaxed">The collector market has seen a 22% increase in value this quarter. Recommended acquisition window: Q4 2024.</p>
          </div>
          <div className="z-10 flex flex-col gap-2 mt-8">
            <div className="flex justify-between border-b border-on-primary-container/20 pb-2">
              <span className="text-[10px] font-label uppercase opacity-60">Active Hunts</span>
              <span className="font-headline font-bold">{isoModels.length}</span>
            </div>
            <div className="flex justify-between border-b border-on-primary-container/20 pb-2">
              <span className="text-[10px] font-label uppercase opacity-60">Acquired this Month</span>
              <span className="font-headline font-bold">02</span>
            </div>
          </div>
        </div>

        {/* Other Items */}
        {otherISOs.map(iso => (
          <div key={iso.id} className="md:col-span-6 group bg-surface-container-low rounded-xl p-6 flex gap-6 hover:bg-surface-container-high transition-all border border-transparent hover:border-outline-variant/20">
            <div className="w-24 h-24 shrink-0 overflow-hidden bg-black rounded-lg relative">
               <div className="w-full h-full flex items-center justify-center bg-surface-container-highest text-on-surface/20">
                 <Info size={32} />
               </div>
            </div>
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-headline font-bold text-xl tracking-tight uppercase">{iso.name}</h3>
                  <span className="text-[10px] font-label text-primary font-bold uppercase tracking-wider">{iso.rarity}</span>
                </div>
                <div className="flex gap-2 text-[10px] font-label uppercase text-on-surface/40">
                  <span>Target: {iso.targetPrice}</span>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button 
                  onClick={() => removeISOModel(iso.id)}
                  className="text-[10px] font-label uppercase tracking-widest text-error/60 hover:text-error transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <AddISOModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
