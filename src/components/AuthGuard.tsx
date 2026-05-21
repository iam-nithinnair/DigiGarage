"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** If true, show a login prompt instead of just empty content for unauthenticated users */
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, isLoaded } = useAuthStore();

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary-container" size={48} />
        <p className="font-label text-sm uppercase tracking-[0.3em] text-on-surface/40 animate-pulse">Loading your collection...</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-8">
        <div className="bg-surface-container-low p-12 rounded-xl border border-white/5 text-center max-w-md">
          <LogIn className="text-primary-container mx-auto mb-6" size={48} />
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">Sign In Required</h2>
          <p className="text-on-surface/60 font-body mb-8">
            Please sign in to access your collection and start curating your digital garage.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
