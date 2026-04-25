"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { X, DollarSign, Tag, Award, MapPin } from "lucide-react";
import { toast } from "sonner";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddModal({ isOpen, onClose }: AddModalProps) {
  const { addModel } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    manufacturer: "",
    series: "",
    scale: "1:18",
    image: "",
    purchase_price: "",
    condition: "Mint",
    grade: "",
    storage_location: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addModel({
        ...formData,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined
      });
      toast.success(`${formData.name} added to collection`);
      onClose();
      setFormData({
        name: "",
        year: "",
        manufacturer: "",
        series: "",
        scale: "1:18",
        image: "",
        purchase_price: "",
        condition: "Mint",
        grade: "",
        storage_location: ""
      });
    } catch (err) {
      toast.error("Failed to add model");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-surface-container-low border border-white/5 shadow-2xl p-8 rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Catalog New Acquisition</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Info */}
            <div className="space-y-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2 block">Casting Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-highest border-b border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm"
                  placeholder="e.g. Porsche 911 GT3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2 block">Year</label>
                  <input
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-surface-container-highest border-b border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2 block">Scale</label>
                  <select
                    value={formData.scale}
                    onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                    className="w-full bg-surface-container-highest border-b border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm appearance-none"
                  >
                    <option>1:18</option>
                    <option>1:43</option>
                    <option>1:64</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2 block">Manufacturer</label>
                <input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full bg-surface-container-highest border-b border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm"
                  placeholder="e.g. AUTOart"
                />
              </div>
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2 block">Image URL</label>
                <input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-surface-container-highest border-b border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Museum Specs */}
            <div className="space-y-4 bg-surface-dim/30 p-6 rounded-lg border border-white/5">
              <span className="font-label text-[9px] uppercase tracking-[0.2em] text-primary-container block mb-4">Museum Specifications</span>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={12} className="text-on-surface/40" />
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Purchase Price</label>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={12} className="text-on-surface/40" />
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Condition</label>
                </div>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm appearance-none"
                >
                  <option>Mint</option>
                  <option>Near Mint</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Restoration Required</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={12} className="text-on-surface/40" />
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Grade / Score</label>
                </div>
                <input
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm"
                  placeholder="e.g. 10/10 or MIB"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={12} className="text-on-surface/40" />
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Storage Location</label>
                </div>
                <input
                  value={formData.storage_location}
                  onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm"
                  placeholder="e.g. Shelf A-1 or Vault"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-headline font-bold text-xs tracking-widest uppercase hover:text-primary transition-colors"
            >
              Discard
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
