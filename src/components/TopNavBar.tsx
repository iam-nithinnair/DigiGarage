"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Home, LayoutGrid, List, Heart, Search, User, Terminal } from "lucide-react";

export default function TopNavBar() {
  const pathname = usePathname();
  const { isLoaded, fetchData } = useStore();

  useEffect(() => {
    if (!isLoaded) {
      fetchData();
    }
  }, [isLoaded, fetchData]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const base = "transition-colors ease-out duration-200 font-headline";
    if (isActive) {
      return `${base} text-[#D40000] border-b-2 border-[#D40000] pb-1`;
    }
    return `${base} text-[#e2e2e5] hover:text-[#D40000]`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#121416]/60 backdrop-blur-xl transition-all ease-out duration-200">
      <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
        <div className="text-xl font-bold tracking-tighter text-[#e2e2e5] font-headline">THE DIGITAL CURATOR</div>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          <Link href="/" className={`${getLinkClass("/")} flex items-center gap-1`}>
            <Home size={16} /> Home
          </Link>
          <Link href="/collection" className={`${getLinkClass("/collection")} flex items-center gap-1`}>
            <LayoutGrid size={16} /> Collection
          </Link>
          <Link href="/iso" className={`${getLinkClass("/iso")} flex items-center gap-1`}>
            <List size={16} /> ISO
          </Link>
          <Link href="/favorites" className={`${getLinkClass("/favorites")} flex items-center gap-1`}>
            <Heart size={16} /> Favorites
          </Link>
          <Link href="/developer" className={`${getLinkClass("/developer")} flex items-center gap-1`}>
            <Terminal size={16} /> Developer
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#282a2c]/50 rounded-full transition-all text-[#e2e2e5]">
            <Search size={20} />
          </button>
          <button className="p-2 hover:bg-[#282a2c]/50 rounded-full transition-all text-[#e2e2e5]">
            <User size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
