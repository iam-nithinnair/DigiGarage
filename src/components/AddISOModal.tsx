"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useIsoStore } from "@/store/useIsoStore";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddISOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddISOModal({ isOpen, onClose }: AddISOModalProps) {
  const { addIsoModel } = useIsoStore();
  const [name, setName] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [rarity, setRarity] = useState("Common");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setTargetPrice("");
      setRarity("Common");
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus trap + Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>('input, button, select');
      first?.focus();
    }, 50);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetPrice) return;

    try {
      await addIsoModel({
        name,
        targetprice: targetPrice,
        rarity,
      });
      toast.success(`${name} added to ISO list`);
      setName("");
      setTargetPrice("");
      setRarity("Common");
      onClose();
    } catch {
      toast.error("Failed to add ISO model");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="add-iso-title" className="relative w-full max-w-xl bg-surface-container-high p-5 sm:p-8 md:p-12 shadow-2xl">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 id="add-iso-title" className="text-3xl font-headline font-bold tracking-tight text-on-surface">New ISO</h2>
            <p className="text-on-surface/60 font-body text-sm mt-1">Add a new holy grail to your hunt list.</p>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="p-2 hover:bg-surface-bright rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="iso-name" className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Model Name</label>
            <input
              id="iso-name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/15 py-3 px-0 focus:border-primary focus:ring-0 placeholder:text-on-surface/20"
              placeholder="e.g. Mclaren F1"
              type="text"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="iso-price" className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Target Price</label>
              <input
                id="iso-price"
                required
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/15 py-3 px-0 focus:border-primary focus:ring-0 placeholder:text-on-surface/20"
                placeholder="e.g. ₹5,000"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="iso-rarity" className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Rarity</label>
              <select
                id="iso-rarity"
                value={rarity}
                onChange={e => setRarity(e.target.value)}
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/15 py-3 px-0 focus:border-primary focus:ring-0 appearance-none text-on-surface"
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Ultra-Rare">Ultra-Rare</option>
                <option value="Legendary">Legendary</option>
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
              ADD TO LIST
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
