"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore, UserRole } from "@/store/useAdminStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Shield,
  Users,
  LayoutGrid,
  List,
  TrendingUp,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Loader2,
  Crown,
  User as UserIcon,
  Heart,
  Tag,
  Lock,
  Eye,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function AdminPage() {
  const { user, isLoaded } = useAuthStore();
  const {
    isAdmin,
    isRoleLoading,
    users,
    selectedUserModels,
    selectedUserId,
    platformStats,
    isLoading,
    fetchCurrentUserRole,
    fetchAllUsers,
    fetchUserModels,
    deleteUserModel,
    updateUserRole,
    fetchPlatformStats,
  } = useAdminStore();

  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ id: string; name: string; currentRole: UserRole } | null>(null);

  // Check admin access
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login");
    } else if (user) {
      fetchCurrentUserRole(user.id);
    }
  }, [user, isLoaded, router, fetchCurrentUserRole]);

  // Fetch admin data once role is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
      fetchPlatformStats();
    }
  }, [isAdmin, fetchAllUsers, fetchPlatformStats]);

  if (!isLoaded || !user || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8">
        <div className="bg-surface-container-low p-12 rounded-xl text-center max-w-md">
          <Shield className="text-error mx-auto mb-6" size={48} />
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-3 uppercase tracking-tight">Access Denied</h2>
          <p className="text-on-surface/60 font-body mb-8">
            You don&apos;t have admin privileges. Contact the system administrator to request access.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-block px-8 py-4 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  // Viewing a specific user's models
  if (selectedUserId) {
    const selectedUser = users.find(u => u.id === selectedUserId);
    return (
      <main className="pt-28 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
        <button
          onClick={() => useAdminStore.setState({ selectedUserId: null, selectedUserModels: [] })}
          className="flex items-center gap-2 text-on-surface/60 hover:text-primary transition-colors font-headline text-sm uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary-container text-on-primary-container text-[9px] px-2 py-0.5 tracking-wider font-bold uppercase font-label">Admin View</span>
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-on-surface uppercase mb-2">
            {selectedUser?.full_name || selectedUser?.email || 'User'}&apos;s Collection
          </h1>
          <p className="text-on-surface/60 font-body">{selectedUser?.email} &bull; {selectedUserModels.length} models</p>
        </header>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : selectedUserModels.length === 0 ? (
          <div className="py-20 text-center text-on-surface/40 font-body">This user has no models in their collection.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {selectedUserModels.map(model => (
              <article key={model.id} className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-lowest">
                  {model.image ? (
                    <Image fill alt={model.name} className="object-cover" src={model.image} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface/30 font-headline">No Image</div>
                  )}
                  {model.isFavorite && (
                    <div className="absolute top-4 left-4 bg-primary-container/90 backdrop-blur-md text-on-primary-container px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
                      <Heart size={12} fill="currentColor" />
                      <span className="font-label text-[9px] font-bold uppercase tracking-wider">Favorite</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-headline text-xl font-bold mb-1">{model.name}</h3>
                  <p className="text-on-surface/60 text-sm font-label uppercase tracking-widest mb-4">
                    {model.year} &bull; {model.manufacturer} &bull; {model.scale}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {model.purchase_price != null && model.purchase_price > 0 && (
                      <div className="flex items-center gap-1.5 text-on-surface/40">
                        <Tag size={12} className="text-primary" />
                        <span className="font-label text-[10px]">₹{Number(model.purchase_price).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {model.condition && (
                      <span className="bg-primary-container/20 text-primary font-label text-[10px] px-2 py-0.5 uppercase tracking-wider">
                        {model.condition}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-4 border-t border-outline-variant/15">
                    <button
                      onClick={() => setDeleteTarget({ id: model.id, name: model.name })}
                      className="text-[10px] font-label uppercase tracking-widest text-error/60 hover:text-error transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove Model
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete User Model"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (deleteTarget) {
              deleteUserModel(deleteTarget.id);
              setDeleteTarget(null);
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      </main>
    );
  }

  // Main admin dashboard — matching Stitch "Admin Command Center" design
  return (
    <main className="pt-28 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">

      {/* Stats Row — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-low p-8 rounded-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Total Curators</p>
            <Users className="text-on-surface/20" size={18} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-headline text-4xl font-black text-on-surface tracking-tight">
              {platformStats.totalUsers > 999
                ? `${(platformStats.totalUsers / 1000).toFixed(1)}K`
                : platformStats.totalUsers}
            </p>
            <TrendingUp className="text-on-surface/20" size={28} />
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Total Models</p>
            <LayoutGrid className="text-on-surface/20" size={18} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-headline text-4xl font-black text-on-surface tracking-tight">
              {platformStats.totalModels > 999
                ? `${(platformStats.totalModels / 1000).toFixed(0)}K`
                : platformStats.totalModels}
            </p>
            <TrendingUp className="text-on-surface/20" size={28} />
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Active ISOs</p>
            <List className="text-on-surface/20" size={18} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-headline text-4xl font-black text-on-surface tracking-tight">
              {platformStats.totalIsoModels > 999
                ? `${(platformStats.totalIsoModels / 1000).toFixed(1)}K`
                : platformStats.totalIsoModels}
            </p>
            <TrendingUp className="text-on-surface/20" size={28} />
          </div>
        </div>
      </div>

      {/* Two-column layout: User Management + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* Left Column — User Management */}
        <section className="bg-surface-container-low rounded-lg overflow-hidden">
          <div className="px-6 py-5 flex items-center gap-3">
            <div className="w-1 h-5 bg-primary-container rounded-full" />
            <h2 className="font-headline text-sm font-bold tracking-wider text-on-surface uppercase">User Management</h2>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-high/30">
            <div className="col-span-4 font-label text-[9px] uppercase tracking-widest text-on-surface/30">Curator Identity</div>
            <div className="col-span-3 font-label text-[9px] uppercase tracking-widest text-on-surface/30">Inventory</div>
            <div className="col-span-2 font-label text-[9px] uppercase tracking-widest text-on-surface/30">Status</div>
            <div className="col-span-3 font-label text-[9px] uppercase tracking-widest text-on-surface/30 text-right">Actions</div>
          </div>

          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-on-surface/40 font-body text-sm">No users found.</div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-t border-outline-variant/10 hover:bg-surface-container-high/20 transition-colors items-center"
              >
                {/* Curator Identity */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="font-headline text-xs font-bold text-on-surface/60 uppercase">
                      {(u.full_name || u.email || '?').charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline text-sm font-bold text-on-surface truncate">
                      {u.full_name || u.email?.split('@')[0] || 'Unknown'}
                    </p>
                    <p className="font-body text-[11px] text-on-surface/30 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Inventory */}
                <div className="col-span-3">
                  <span className="font-body text-sm text-on-surface/60">
                    {u.model_count || 0} models
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-label text-[9px] uppercase tracking-widest font-bold ${
                    u.role === 'admin'
                      ? 'bg-primary-container/20 text-primary'
                      : 'bg-green-900/30 text-green-400'
                  }`}>
                    {u.role === 'admin' ? 'Admin' : 'Active'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-3">
                  <button
                    onClick={() => fetchUserModels(u.id)}
                    className="text-[10px] font-label uppercase tracking-widest text-on-surface/40 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    View <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setRoleChangeTarget({
                      id: u.id,
                      name: u.full_name || u.email || 'User',
                      currentRole: u.role,
                    })}
                    disabled={u.id === user.id}
                    className="text-[10px] font-label uppercase tracking-widest text-on-surface/20 hover:text-on-surface/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={u.id === user.id ? "Cannot change your own role" : "Change role"}
                  >
                    {u.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Right Column — Sidebar Panels */}
        <div className="flex flex-col gap-6">

          {/* Master Casting Archive */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xs font-bold tracking-wider text-on-surface uppercase">Master Casting Archive</h3>
              <Plus className="text-on-surface/20" size={16} />
            </div>
            <div className="flex flex-col gap-4">
              {platformStats.totalModels > 0 ? (
                <>
                  <div className="py-2 border-b border-outline-variant/10">
                    <p className="font-headline text-sm font-bold text-on-surface">Platform Collection</p>
                    <p className="font-label text-[10px] text-on-surface/30 uppercase tracking-wider mt-1">
                      {platformStats.totalModels} total models across {platformStats.totalUsers} curators
                    </p>
                  </div>
                  <div className="py-2 border-b border-outline-variant/10">
                    <p className="font-headline text-sm font-bold text-on-surface">ISO Watchlist</p>
                    <p className="font-label text-[10px] text-on-surface/30 uppercase tracking-wider mt-1">
                      {platformStats.totalIsoModels} active searches
                    </p>
                  </div>
                  <div className="py-2">
                    <p className="font-headline text-sm font-bold text-on-surface">Total Value</p>
                    <p className="font-label text-[10px] text-on-surface/30 uppercase tracking-wider mt-1">
                      ₹{platformStats.totalInvestment.toLocaleString('en-IN')} portfolio
                    </p>
                  </div>
                </>
              ) : (
                <p className="font-body text-sm text-on-surface/30">No models in archive yet.</p>
              )}
            </div>
          </section>

          {/* Security Terminal */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xs font-bold tracking-wider text-on-surface uppercase">Security Terminal</h3>
              <Lock className="text-on-surface/20" size={16} />
            </div>
            <p className="font-label text-[10px] text-on-surface/30 uppercase tracking-wider">
              Security controls managed via Supabase dashboard.
            </p>
          </section>

          {/* Asset Oversight */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xs font-bold tracking-wider text-on-surface uppercase">Asset Oversight</h3>
              <Eye className="text-on-surface/20" size={16} />
            </div>
            <div>
              <p className="font-headline text-sm font-bold text-on-surface">Moderate User Images</p>
              <p className="font-label text-[10px] text-on-surface/30 uppercase tracking-wider mt-1">Pending Queue</p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-label text-[10px] text-on-surface/20 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} The Digital Curator. Precision Engineered.
        </p>
        <div className="flex items-center gap-6">
          <span className="font-label text-[10px] text-on-surface/20 uppercase tracking-widest">Privacy</span>
          <span className="font-label text-[10px] text-on-surface/20 uppercase tracking-widest">Terms</span>
          <span className="font-label text-[10px] text-on-surface/20 uppercase tracking-widest">Archive</span>
        </div>
        <p className="font-label text-[10px] text-on-surface/15 uppercase tracking-widest">System v1.2.84</p>
      </footer>

      {/* Role Change Confirmation */}
      <ConfirmDialog
        isOpen={!!roleChangeTarget}
        title="Change User Role"
        message={`Are you sure you want to ${roleChangeTarget?.currentRole === 'admin' ? 'demote' : 'promote'} "${roleChangeTarget?.name}" to ${roleChangeTarget?.currentRole === 'admin' ? 'user' : 'admin'}?`}
        confirmLabel={roleChangeTarget?.currentRole === 'admin' ? 'Demote to User' : 'Promote to Admin'}
        onConfirm={() => {
          if (roleChangeTarget) {
            const newRole: UserRole = roleChangeTarget.currentRole === 'admin' ? 'user' : 'admin';
            updateUserRole(roleChangeTarget.id, newRole);
            setRoleChangeTarget(null);
          }
        }}
        onCancel={() => setRoleChangeTarget(null)}
      />
    </main>
  );
}
