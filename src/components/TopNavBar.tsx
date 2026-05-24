"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { Home, LayoutGrid, List, Heart, Search, User, Terminal, LogOut, Menu, X, Shield } from "lucide-react";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/collection", label: "Collection", icon: LayoutGrid },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/iso", label: "ISO", icon: List },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/developer", label: "Developer", icon: Terminal },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const { isLoaded, user, signOut, initializeAuth } = useAuthStore();
  const { isAdmin, fetchCurrentUserRole } = useAdminStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Fetch admin role when user is available
  useEffect(() => {
    if (user) {
      fetchCurrentUserRole(user.id);
    }
  }, [user, fetchCurrentUserRole]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const base = "transition-colors ease-out duration-200 font-headline";
    if (isActive) {
      return `${base} text-primary-container border-b-2 border-primary-container pb-1`;
    }
    return `${base} text-on-surface hover:text-primary-container`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    const base = "flex items-center gap-3 px-4 py-3 font-headline text-sm uppercase tracking-widest font-bold transition-colors";
    if (isActive) {
      return `${base} text-primary-container bg-surface-container-high`;
    }
    return `${base} text-on-surface hover:text-primary-container hover:bg-surface-container-high`;
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface-dim/60 backdrop-blur-xl transition-all ease-out duration-200 border-b border-white/5">
        <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
          <Link href="/" className="text-xl font-bold tracking-tighter text-on-surface font-headline uppercase">THE DIGITAL CURATOR</Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`${getLinkClass(href)} flex items-center gap-1 text-xs uppercase tracking-widest font-bold`}>
                <Icon size={14} /> {label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold font-headline transition-colors ease-out duration-200">
                <span className="bg-primary-container text-on-primary-container text-[9px] px-2 py-0.5 tracking-wider font-bold uppercase">Admin Terminal</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/discover"
              className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all text-on-surface"
              aria-label="Search Collection"
            >
              <Search size={20} />
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className={`text-[10px] uppercase tracking-widest font-label ${isAdmin ? 'text-primary' : 'text-on-surface/40'}`}>
                    {isAdmin ? 'System Admin' : 'Curator'}
                  </span>
                  <span className="text-xs text-on-surface font-headline font-bold">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                </div>
                <Link
                  href="/profile"
                  className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all text-on-surface"
                  title="Profile"
                  aria-label="View Profile"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    toast.success("Session ended. Securely logged out.");
                  }}
                  className="hidden md:block p-2 hover:bg-error/10 rounded-full transition-all text-on-surface/60 hover:text-error"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all text-on-surface"
                aria-label="Login"
              >
                <User size={20} />
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-surface-container-high/50 rounded-full transition-all text-on-surface"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-[65px] right-0 w-72 bg-surface-container border-l border-white/5 shadow-2xl flex flex-col py-4 max-h-[calc(100vh-65px)] overflow-y-auto">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={getMobileLinkClass(href)}>
                <Icon size={18} /> {label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className={getMobileLinkClass("/admin")}>
                <Shield size={18} /> Admin Terminal
              </Link>
            )}
            {user && (
              <button
                onClick={async () => {
                  await signOut();
                  toast.success("Session ended. Securely logged out.");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 font-headline text-sm uppercase tracking-widest font-bold text-error hover:bg-error/10 transition-colors mt-4 border-t border-white/5 pt-4"
              >
                <LogOut size={18} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
