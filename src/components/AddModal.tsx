"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { X } from "lucide-react";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddModal({ isOpen, onClose }: AddModalProps) {
  const { addModel } = useStore();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [series, setSeries] = useState("Die-Cast");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !year || !manufacturer) return;
    
    addModel({
      name,
      year,
      manufacturer,
      series,
      scale: "1:18", // Defaulting scale as it's not in the design spec
      image: "", // Empty so it uses the fallback placeholder
    });
    
    // Reset and close
    setName("");
    setYear("");
    setManufacturer("");
    setSeries("Die-Cast");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-xl bg-surface-container-high p-8 md:p-12 shadow-2xl">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-headline font-bold tracking-tight text-on-surface">New Acquisition</h2>
            <p className="text-on-surface/60 font-body text-sm mt-1">Register a new masterpiece to your curated collection.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-bright rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Model Name</label>
              <input 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/15 py-3 px-0 focus:border-primary focus:ring-0 placeholder:text-on-surface/20" 
                placeholder="e.g. Shelby GT500" 
                type="text" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Year</label>
              <input 
                required
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/15 py-3 px-0 focus:border-primary focus:ring-0 placeholder:text-on-surface/20" 
                placeholder="e.g. 1967" 
                type="text" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Manufacturer</label>
              <input 
                required
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/15 py-3 px-0 focus:border-primary focus:ring-0 placeholder:text-on-surface/20" 
                placeholder="e.g. AUTOart" 
                type="text" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Series</label>
              <select 
                value={series}
                onChange={e => setSeries(e.target.value)}
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/15 py-3 px-0 focus:border-primary focus:ring-0 appearance-none text-on-surface"
              >
                <option value="Die-Cast">Die-Cast</option>
                <option value="Resin">Resin</option>
                <option value="Composite">Composite</option>
              </select>
            </div>
          </div>
          
          <div className="pt-6 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-3 font-headline text-sm font-bold text-on-surface/60 hover:text-on-surface transition-colors"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="px-10 py-3 bg-primary-container text-on-primary-container font-headline font-bold text-sm tracking-wide hover:brightness-110"
            >
              CONFIRM ENTRY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
