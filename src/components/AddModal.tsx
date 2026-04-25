"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { X, DollarSign, Tag, Award, MapPin, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddModal({ isOpen, onClose }: AddModalProps) {
  const { addModel } = useStore();
  const [uploading, setUploading] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `cars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

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
      <div className="relative w-full max-w-3xl bg-surface-container-low border border-white/5 shadow-2xl p-8 rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Catalog New Acquisition</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Visual & Core Info */}
            <div className="space-y-6">
               {/* Image Upload Area */}
               <div className="relative aspect-video bg-surface-container-highest rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group">
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-all">
                          Change Image
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3 p-8 text-center">
                       {uploading ? <Loader2 className="animate-spin text-primary" size={32} /> : <Upload className="text-on-surface/20" size={32} />}
                       <div className="space-y-1">
                         <span className="block font-headline text-sm font-bold uppercase tracking-wider">Upload Masterpiece Photo</span>
                         <span className="block text-[10px] text-on-surface/40 uppercase tracking-widest">PNG, JPG up to 5MB</span>
                       </div>
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
               </div>

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
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2 block">Manufacturer</label>
                      <input
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        className="w-full bg-surface-container-highest border-b border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm"
                        placeholder="e.g. AUTOart"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2 block">Year</label>
                      <input
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full bg-surface-container-highest border-b border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm"
                        placeholder="2024"
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Museum Specs */}
            <div className="space-y-6">
              <div className="bg-surface-dim/30 p-6 rounded-lg border border-white/5 space-y-6">
                <span className="font-label text-[9px] uppercase tracking-[0.2em] text-primary-container block border-b border-white/5 pb-2">Technical Specifications</span>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={12} className="text-on-surface/40" />
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Purchase Price (₹)</label>
                    </div>
                    <input
                      type="number"
                      step="1"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon size={12} className="text-on-surface/40" />
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Scale</label>
                    </div>
                    <select
                      value={formData.scale}
                      onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option>1:18</option>
                      <option>1:43</option>
                      <option>1:64</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={12} className="text-on-surface/40" />
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Condition</label>
                  </div>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm appearance-none cursor-pointer"
                  >
                    <option>Mint</option>
                    <option>Near Mint</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Restoration Required</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={12} className="text-on-surface/40" />
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Grade</label>
                    </div>
                    <input
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm"
                      placeholder="e.g. MIB"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={12} className="text-on-surface/40" />
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Vault Location</label>
                    </div>
                    <input
                      value={formData.storage_location}
                      onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 p-2 outline-none focus:border-primary transition-colors text-sm"
                      placeholder="e.g. Shelf A-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-6 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-headline font-bold text-xs tracking-widest uppercase hover:text-primary transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-12 py-4 bg-primary-container text-on-primary-container font-headline font-bold text-sm tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-primary-container/20"
            >
              {uploading ? 'Processing Image...' : 'Catalog Acquisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
