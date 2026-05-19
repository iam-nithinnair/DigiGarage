"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = "Delete", onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative w-full max-w-sm bg-surface-container-high border border-white/10 shadow-2xl p-8 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-error/10 rounded-full">
            <AlertTriangle size={20} className="text-error" />
          </div>
          <h2 id="confirm-title" className="font-headline text-lg font-bold text-on-surface">{title}</h2>
        </div>
        <p id="confirm-message" className="text-on-surface/60 text-sm mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-6 py-2.5 font-headline text-xs tracking-widest uppercase font-bold text-on-surface/60 hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-error text-white font-headline text-xs tracking-widest uppercase font-bold hover:brightness-110 transition-all rounded-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
