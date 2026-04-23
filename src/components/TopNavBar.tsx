"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Home, LayoutGrid, List, Heart, Search, User, Terminal, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function TopNavBar() {
  const pathname = usePathname();
  const { isLoaded, fetchData, user, signOut, initializeAuth } = useStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const base = "transition-colors ease-out duration-200 font-headline";
    if (isActive) {
      return `${base} text-[#D40000] border-b-2 border-[#D40000] pb-1`;
    }
    return `${base} text-[#e2e2e5] hover:text-[#D40000]`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#121416]/60 backdrop-blur-xl transition-all ease-out duration-200 border-b border-white/5">
      <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
        <div className="text-xl font-bold tracking-tighter text-[#e2e2e5] font-headline uppercase">THE DIGITAL CURATOR</div>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          <Link href="/" className={`${getLinkClass("/")} flex items-center gap-1 text-xs uppercase tracking-widest font-bold`}>
            <Home size={14} /> Home
          </Link>
          <Link href="/collection" className={`${getLinkClass("/collection")} flex items-center gap-1 text-xs uppercase tracking-widest font-bold`}>
            <LayoutGrid size={14} /> Collection
          </Link>
          <Link href="/discover" className={`${getLinkClass("/discover")} flex items-center gap-1 text-xs uppercase tracking-widest font-bold`}>
            <Search size={14} /> Discover
          </Link>
          <Link href="/iso" className={`${getLinkClass("/iso")} flex items-center gap-1 text-xs uppercase tracking-widest font-bold`}>
            <List size={14} /> ISO
          </Link>
          <Link href="/favorites" className={`${getLinkClass("/favorites")} flex items-center gap-1 text-xs uppercase tracking-widest font-bold`}>
            <Heart size={14} /> Favorites
          </Link>
          <Link href="/developer" className={`${getLinkClass("/developer")} flex items-center gap-1 text-xs uppercase tracking-widest font-bold`}>
            <Terminal size={14} /> Developer
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 hover:bg-[#282a2c]/50 rounded-full transition-all text-[#e2e2e5]"
            aria-label="Search Collection"
          >
            <Search size={20} />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] text-on-surface/40 uppercase tracking-widest font-label">Curator</span>
                <span className="text-xs text-on-surface font-headline font-bold">{user.email?.split('@')[0]}</span>
              </div>
              <Link 
                href="/profile"
                className="p-2 hover:bg-[#282a2c]/50 rounded-full transition-all text-[#e2e2e5]"
                title="Profile"
                aria-label="View Profile"
              >
                <User size={20} />
              </Link>
              <button 
                onClick={() => {
                  signOut();
                  toast.success("Session ended. Securely logged out.");
                }}
                className="p-2 hover:bg-error/10 rounded-full transition-all text-on-surface/60 hover:text-error"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="p-2 hover:bg-[#282a2c]/50 rounded-full transition-all text-[#e2e2e5]"
              aria-label="Login"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
