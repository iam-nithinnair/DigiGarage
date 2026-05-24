import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

/* ── Types ─────────────────────────────────────────────────── */

interface AuthState {
  user: User | null;
  isLoaded: boolean;
  initializeAuth: () => void;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ error: { message: string } | null }>;
}

/* ── Guards ────────────────────────────────────────────────── */

let authInitialized = false;
let intentionalSignOut = false;

/* ── Store ─────────────────────────────────────────────────── */

export const useAuthStore = create<AuthState>((set, get) => {
  const getSupabase = () => createClient();

  return {
    user: null,
    isLoaded: false,

    initializeAuth: () => {
      if (authInitialized) return;
      authInitialized = true;

      const supabase = getSupabase();

      // Initial check
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
        if (user) {
          set({ user, isLoaded: true });
          // Trigger domain store fetches
          const { useCollectionStore } = require('./useCollectionStore');
          const { useIsoStore } = require('./useIsoStore');
          useCollectionStore.getState().fetchModels(user.id);
          useIsoStore.getState().fetchIsoModels(user.id);
        } else {
          set({ isLoaded: true });
        }
      });

      // Listen for changes (single subscription for app lifetime)
      supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = session?.user ?? null;
          set({ user, isLoaded: true });
          if (user) {
            const { useCollectionStore } = require('./useCollectionStore');
            const { useIsoStore } = require('./useIsoStore');
            useCollectionStore.getState().fetchModels(user.id);
            useIsoStore.getState().fetchIsoModels(user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          set({ user: null });
          // Clear domain stores
          const { useCollectionStore } = require('./useCollectionStore');
          const { useIsoStore } = require('./useIsoStore');
          useCollectionStore.setState({ models: [] });
          useIsoStore.setState({ isoModels: [] });

          if (!intentionalSignOut) {
            toast.error('Your session has expired. Please sign in again.');
            if (typeof window !== 'undefined') {
              const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/DigiGarage';
              window.location.href = `${window.location.origin}${basePath}/login`;
            }
          }
          intentionalSignOut = false;
        }
      });
    },

    signOut: async () => {
      const supabase = getSupabase();
      intentionalSignOut = true;
      const { error } = await supabase.auth.signOut();
      if (error) {
        intentionalSignOut = false;
        toast.error('Sign out failed. Please try again.');
        return;
      }
      const { useCollectionStore } = require('./useCollectionStore');
      const { useIsoStore } = require('./useIsoStore');
      useCollectionStore.setState({ models: [] });
      useIsoStore.setState({ isoModels: [] });
      set({ user: null });
    },

    resendConfirmationEmail: async (email: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      return { error };
    },
  };
});
