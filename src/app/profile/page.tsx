"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useIsoStore } from "@/store/useIsoStore";
import { useAdminStore } from "@/store/useAdminStore";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, ShoppingCart, Radar, LogOut, Edit3, ChevronRight, Wallet, Shield, Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, signOut, isLoaded } = useAuthStore();
  const { models } = useCollectionStore();
  const { isoModels } = useIsoStore();
  const { isAdmin } = useAdminStore();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login");
    }
  }, [user, isLoaded, router]);

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Curator';

  const handleEditStart = () => {
    setEditName(user.user_metadata?.full_name || "");
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName("");
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }
    setSavingProfile(true);
    const supabase = createClient();

    // Update Supabase Auth user metadata (so user_metadata.full_name updates)
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: editName.trim() },
    });

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: editName.trim() })
      .eq("id", user.id);

    setSavingProfile(false);

    if (authError || profileError) {
      toast.error("Failed to update profile. Please try again.");
      return;
    }

    toast.success("Profile updated successfully.");
    setIsEditing(false);
    // Force re-fetch user so the updated metadata is reflected
    const { data: refreshed } = await supabase.auth.getUser();
    if (refreshed.user) {
      useAuthStore.setState({ user: refreshed.user });
    }
    router.refresh();
  };
  const recentAcquisitions = models.slice(0, 2);
  
  // Calculate total acquisition cost
  const totalInvestment = models.reduce((acc, model) => acc + (model.purchase_price || 0), 0);

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
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 relative border-4 border-white/5 bg-primary-container flex items-center justify-center">
            <span className="font-headline text-5xl md:text-7xl font-black text-on-primary-container uppercase select-none">
              {displayName.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col flex-grow justify-center sm:justify-start h-full py-4 text-center sm:text-left z-10">
            <div className="bg-surface-container-highest text-on-surface-variant font-label text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-none self-center sm:self-start mb-4">Master Curator</div>

            {isEditing ? (
              <>
                <div className="mb-4">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2" htmlFor="edit-name">Display Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full max-w-sm bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-headline text-2xl font-bold outline-none"
                    placeholder="Your display name"
                    autoFocus
                  />
                </div>
                <div className="mb-2">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Email (read-only)</span>
                  <span className="font-body text-on-surface/60">{user.email}</span>
                </div>
                <p className="font-body text-on-surface/40 mb-6">Member since {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <div className="mt-auto flex gap-3 justify-center sm:justify-start">
                  <button
                    onClick={handleEditSave}
                    disabled={savingProfile}
                    className="bg-primary-container text-on-primary-container font-label text-xs uppercase tracking-wider px-6 py-3 rounded-none hover:bg-primary transition-colors border border-white/5 flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {savingProfile ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={savingProfile}
                    className="bg-surface-container-high text-on-surface-variant font-label text-xs uppercase tracking-wider px-6 py-3 rounded-none hover:bg-surface-container-highest transition-colors border border-white/5 flex items-center gap-2 disabled:opacity-50"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-headline text-3xl md:text-5xl font-bold text-on-surface mb-2 uppercase tracking-tight">{displayName}</h2>
                <p className="font-body text-on-surface/40 mb-8">Member since {new Date(user.created_at).getFullYear()} &bull; {user.email}</p>
                <div className="mt-auto flex gap-4 justify-center sm:justify-start">
                  <button
                    onClick={handleEditStart}
                    className="bg-surface-container-high text-on-surface-variant font-label text-xs uppercase tracking-wider px-6 py-3 rounded-none hover:bg-surface-container-highest transition-colors border border-white/5 flex items-center gap-2"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container rounded-full blur-[100px] opacity-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        </section>

        {/* Financial Overview (New Acquisition Metric) */}
        <section className="col-span-1 md:col-span-6 lg:col-span-4 bg-primary-container rounded-xl p-8 flex flex-col justify-between border border-white/5 hover:brightness-110 transition-all duration-500 shadow-2xl relative overflow-hidden">
           <Wallet className="absolute -right-4 -top-4 w-32 h-32 text-on-primary-container/10 rotate-12" />
           <div className="z-10">
             <h3 className="font-headline text-sm text-on-primary-container/60 uppercase tracking-[0.15em] mb-2">Acquisition Capital</h3>
             <div className="font-headline text-5xl font-black text-on-primary-container tracking-tighter">
               ₹{totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
           </div>
           <p className="z-10 font-label text-[10px] uppercase tracking-widest text-on-primary-container/60 mt-8">
             Total capital deployed across {models.length} digital museum assets.
           </p>
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
        <section className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-container-low rounded-xl p-8 border border-white/5 hover:bg-surface-container transition-colors duration-500 shadow-2xl">
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
                  <p className="font-body text-xs text-on-surface/40">{model.manufacturer} • {model.scale}</p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-on-surface/30 font-body text-sm italic">No recent acquisitions found.</div>
            )}
          </div>
        </section>

        {/* Preferences & Actions */}
        <section className="col-span-1 md:col-span-6 lg:col-span-4 flex flex-col gap-6">
          {isAdmin && (
            <Link href="/admin" className="bg-surface-dim border border-primary-container/20 rounded-xl p-8 flex items-center justify-between shadow-2xl hover:bg-surface-container-low transition-colors duration-300 group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-primary" />
                  <h4 className="font-headline font-bold text-on-surface uppercase">Admin Terminal</h4>
                </div>
                <p className="font-body text-sm text-on-surface/30">Platform oversight & user management</p>
              </div>
              <ChevronRight size={20} className="text-on-surface/20 group-hover:text-primary transition-colors" />
            </Link>
          )}

          <div className="bg-surface-dim border border-primary-container/20 rounded-xl p-8 flex items-center justify-between shadow-2xl">
            <div>
              <h4 className="font-headline font-bold text-on-surface uppercase">System Access</h4>
              <p className="font-body text-sm text-on-surface/30">End current session securely</p>
            </div>
            <button
              onClick={async () => {
                await signOut();
                toast.success("Session ended. Securely logged out.");
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
