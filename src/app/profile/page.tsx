"use client";

import { useStore } from "@/store/useStore";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, ShoppingCart, Radar, LogOut, Edit3, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, models, isoModels, signOut, isLoaded } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login");
    }
  }, [user, isLoaded, router]);

  if (!user) return null;

  const recentAcquisitions = models.slice(0, 2);

  return (
    <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 md:px-12 py-32 flex flex-col gap-12">
      {/* Header Section */}
      <header className="flex flex-col gap-4">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tight uppercase">Curator Profile</h1>
        <p className="font-body text-on-surface/40 text-lg max-w-2xl">Manage your collection identity, review acquisition metrics, and access settings.</p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-[auto]">
        {/* Identity Card */}
        <section className="col-span-1 md:col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl relative overflow-hidden group hover:bg-surface-container transition-colors duration-500 flex flex-col sm:flex-row p-8 lg:p-12 gap-8 items-center sm:items-start border border-white/5 shadow-2xl">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 relative border-4 border-white/5">
            <Image 
              fill
              alt={user.email || "Curator"} 
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdQhVtGwaiP0cwO6TO7noyJO7zIUwFZIqAik1uJTOpfBWe5kqW3NWA8ZwenfMCckCBiG8Dq5f1Nu4YhiSm3tP11rErZrDDX2dAi6XvL0B1Sg5I43shH4zYxvSn48lboD6ySTUcGSC68bhKofG3oJx_HcrW7sN0m6R8y5YxT1sUgh6_0HsZuPTqSmtqQ8VfcYkzbxZlYfGxg1cS7l8RLCKtsj1G3FdX_37fjeQBEsPyy58nlGqexauGsRADOfgTkPSJ7BEn9ByDDSo"
            />
          </div>
          <div className="flex flex-col flex-grow justify-center sm:justify-start h-full py-4 text-center sm:text-left z-10">
            <div className="bg-surface-container-highest text-on-surface-variant font-label text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-none self-center sm:self-start mb-4">Master Curator</div>
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-on-surface mb-2 uppercase tracking-tight">{user.email?.split('@')[0]}</h2>
            <p className="font-body text-on-surface/40 mb-8">Member since {new Date(user.created_at).getFullYear()} • Tier 3 Collector</p>
            <div className="mt-auto flex gap-4 justify-center sm:justify-start">
              <button className="bg-surface-container-high text-on-surface-variant font-label text-xs uppercase tracking-wider px-6 py-3 rounded-none hover:bg-surface-container-highest transition-colors border border-white/5 flex items-center gap-2">
                <Edit3 size={14} />
                Edit Profile
              </button>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container rounded-full blur-[100px] opacity-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        </section>

        {/* Quick Stats */}
        <section className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between border border-white/5 hover:bg-surface-container transition-colors duration-500 shadow-2xl">
          <h3 className="font-headline text-sm text-on-surface/30 uppercase tracking-[0.15em] mb-6">Metrics</h3>
          <div className="space-y-6 flex-grow">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Grid3X3 className="text-primary-container" size={20} />
                <span className="font-body font-medium">Total Collections</span>
              </div>
              <span className="font-headline text-2xl font-bold text-on-surface">{models.length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <ShoppingCart className="text-primary-container" size={20} />
                <span className="font-body font-medium">Favorites</span>
              </div>
              <span className="font-headline text-2xl font-bold text-on-surface">{models.filter(m => m.isFavorite).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Radar className="text-primary-container" size={20} />
                <span className="font-body font-medium">ISO Targets</span>
              </div>
              <span className="font-headline text-2xl font-bold text-on-surface">{isoModels.length}</span>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="col-span-1 md:col-span-6 lg:col-span-6 bg-surface-container-low rounded-xl p-8 border border-white/5 hover:bg-surface-container transition-colors duration-500 shadow-2xl">
          <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
            <h3 className="font-headline text-xl text-on-surface uppercase tracking-tight font-bold">Recent Acquisitions</h3>
            <Link href="/collection" className="font-label text-xs text-primary-container hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentAcquisitions.length > 0 ? recentAcquisitions.map((model) => (
              <div key={model.id} className="flex items-center gap-4 bg-surface-dim p-4 rounded-lg border border-white/5">
                <div className="w-16 h-12 bg-surface-container-highest rounded overflow-hidden relative shadow-inner">
                  <Image 
                    fill
                    alt={model.name} 
                    className="object-cover" 
                    src={model.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBejTqFREqoc73fY6hdevf54cFdor7OfZE451XCMDg_Cb5NlURyEGWnoovsyAPPPeWJqOliEfKCbp2Owtqmt5okpDeBcAqMW3KCeqh6LIz4n-8W9_w96nOqWosiluzukzwjqLv6MDbRq4hftWIHN65he4QhOKYVcPnKQ5ZtIc6bpqlhQBLdI1__BanJYj-Hr-NZmzA5r5sYqR_APtNpq3n3fxet0lD4Hz52otKlclxkVJ-FuDYp48E2sn0IlsG0DiRtIaaFt8SvMMs"}
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-headline text-sm font-bold text-on-surface uppercase">{model.name}</h4>
                  <p className="font-body text-xs text-on-surface/40">{model.manufacturer} • {model.scale} • {model.year}</p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-on-surface/30 font-body text-sm italic">No recent acquisitions found.</div>
            )}
          </div>
        </section>

        {/* Preferences & Actions */}
        <section className="col-span-1 md:col-span-12 lg:col-span-6 flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-xl p-8 border border-white/5 flex-grow hover:bg-surface-container transition-colors duration-500 shadow-2xl">
            <h3 className="font-headline text-xl text-on-surface uppercase tracking-tight font-bold mb-6 border-b border-white/5 pb-4">Display Preferences</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-body text-on-surface-variant font-medium">Default Scale View</span>
                  <span className="font-body text-xs text-on-surface/30">Set primary scale filter for gallery</span>
                </div>
                <span className="bg-surface-container-highest text-on-surface-variant font-label text-[10px] uppercase tracking-[0.1em] px-3 py-1">1:18</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-body text-on-surface-variant font-medium">Manufacturer Bias</span>
                  <span className="font-body text-xs text-on-surface/30">Highlight specific makers</span>
                </div>
                <span className="bg-surface-container-highest text-on-surface-variant font-label text-[10px] uppercase tracking-[0.1em] px-3 py-1">AUTOart</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-dim border border-primary-container/20 rounded-xl p-8 flex items-center justify-between shadow-2xl">
            <div>
              <h4 className="font-headline font-bold text-on-surface uppercase">System Access</h4>
              <p className="font-body text-sm text-on-surface/30">End current session securely</p>
            </div>
            <button 
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              className="bg-surface-container-high text-primary font-label text-xs uppercase tracking-wider px-6 py-3 rounded-none border border-primary-container/30 hover:bg-primary-container/10 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
