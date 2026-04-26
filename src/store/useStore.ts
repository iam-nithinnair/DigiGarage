import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface Model {
  id: string;
  name: string;
  year: string;
  manufacturer: string;
  series: string;
  scale: string;
  isFavorite: boolean;
  image: string;
  user_id: string;
  purchase_price?: number;
  condition?: string;
  grade?: string;
  storage_location?: string;
}

export interface ISOModel {
  id: string;
  name: string;
  targetPrice: string;
  rarity: string;
  user_id: string;
}

interface CollectionState {
  models: Model[];
  isoModels: ISOModel[];
  user: User | null;
  isLoaded: boolean;
  fetchData: () => Promise<void>;
  addModel: (model: Omit<Model, 'id' | 'isFavorite' | 'user_id'>) => Promise<void>;
  removeModel: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addISOModel: (model: Omit<ISOModel, 'id' | 'user_id'>) => Promise<void>;
  removeISOModel: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
  initializeAuth: () => void;
}

export const useStore = create<CollectionState>((set, get) => {
  const getSupabase = () => createClient();

  return {
    models: [],
    isoModels: [],
    user: null,
    isLoaded: false,
    initializeAuth: () => {
      const supabase = getSupabase();
      
      // Initial check
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          set({ user });
          get().fetchData();
        } else {
          set({ isLoaded: true });
        }
      });

      // Listen for changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          set({ user: session?.user ?? null });
          get().fetchData();
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, models: [], isoModels: [] });
        }
      });
    },
    fetchData: async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.warn("Supabase credentials missing. Skipping data fetch.");
        set({ isLoaded: true });
        return;
      }

      const supabase = getSupabase();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          set({ models: [], isoModels: [], user: null, isLoaded: true });
          return;
        }

        const [modelsRes, isoModelsRes] = await Promise.all([
          supabase.from('models').select('*').order('created_at', { ascending: false }).eq('user_id', user.id),
          supabase.from('iso_models').select('*').order('created_at', { ascending: false }).eq('user_id', user.id)
        ]);
        
        let loadedModels = [];
        let loadedIsoModels = [];

        if (!modelsRes.error && modelsRes.data) {
           loadedModels = modelsRes.data;
        } else if (modelsRes.error) {
           console.error("Supabase Error (models):", modelsRes.error.message, modelsRes.error.code);
        }

        if (!isoModelsRes.error && isoModelsRes.data) {
           loadedIsoModels = isoModelsRes.data;
        } else if (isoModelsRes.error) {
           console.error("Supabase Error (iso_models):", isoModelsRes.error.message, isoModelsRes.error.code);
        }

        set({ 
            models: loadedModels, 
            isoModels: loadedIsoModels, 
            user: user,
            isLoaded: true 
        });

      } catch (error) {
        console.error("Error connecting to Supabase:", error);
        set({ isLoaded: true });
      }
    },
    addModel: async (model) => {
      const { user } = get();
      if (!user) {
        console.error("Cannot add model: No user logged in.");
        toast.error("Please login to add models");
        return;
      }

      const supabase = getSupabase();
      try {
        // Explicitly map fields to avoid sending unknown columns to Supabase
        const newRecord = { 
          name: model.name,
          year: model.year,
          manufacturer: model.manufacturer,
          series: model.series,
          scale: model.scale,
          image: model.image,
          purchase_price: model.purchase_price,
          condition: model.condition,
          grade: model.grade,
          storage_location: model.storage_location,
          user_id: user.id,
          isFavorite: false 
        };
        
        console.log("Attempting to insert model:", newRecord);
        const { data, error } = await supabase.from('models').insert([newRecord]).select();
        
        if (error) {
          console.error("Supabase error adding model:", error.message, error.code, error.details);
          toast.error(`Database Error: ${error.message}`);
        } else if (data && data.length > 0) {
          console.log("Model added successfully:", data[0]);
          set((state) => ({ models: [data[0], ...state.models] }));
        } else {
          console.warn("Model inserted but no data returned. Check RLS policies.");
        }
      } catch (e) {
        console.error("Unexpected error in addModel:", e);
      }
    },
    removeModel: async (id) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (error) {
          console.error("Failed to remove model:", error.message);
        } else {
          set((state) => ({ models: state.models.filter(m => m.id !== id) }));
        }
      } catch (e) {
        console.error(e);
      }
    },
    toggleFavorite: async (id) => {
      const supabase = getSupabase();
      let newFavState = false;
      
      // Optmistic Update
      set((state) => {
        const newModels = state.models.map(m => {
          if (m.id === id) {
            newFavState = !m.isFavorite;
            return { ...m, isFavorite: newFavState };
          }
          return m;
        });
        return { models: newModels };
      });

      try {
        const { error } = await supabase.from('models').update({ isFavorite: newFavState }).eq('id', id);
        if (error) {
          console.error("Error toggling favorite:", error.message);
          set((state) => ({
            models: state.models.map(m => m.id === id ? { ...m, isFavorite: !newFavState } : m)
          }));
        }
      } catch (e) {
        console.error(e);
      }
    },
    addISOModel: async (model) => {
      const { user } = get();
      if (!user) {
        console.error("Cannot add ISO: No user logged in.");
        return;
      }

      const supabase = getSupabase();
      try {
        const newRecord = { 
          name: model.name,
          targetPrice: model.targetPrice,
          rarity: model.rarity,
          user_id: user.id 
        };
        console.log("Attempting to insert ISO model:", newRecord);
        const { data, error } = await supabase.from('iso_models').insert([newRecord]).select();
        
        if (error) {
          console.error("Supabase error adding ISO model:", error.message, error.code);
          toast.error(`Database Error: ${error.message}`);
        } else if (data && data.length > 0) {
          console.log("ISO model added successfully:", data[0]);
          set((state) => ({ isoModels: [data[0], ...state.isoModels] }));
        } else {
          console.warn("ISO model inserted but no data returned. Check RLS policies.");
        }
      } catch (e) {
        console.error("Unexpected error in addISOModel:", e);
      }
    },
    removeISOModel: async (id) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase.from('iso_models').delete().eq('id', id);
        if (error) {
          console.error("Failed to remove ISO model from Supabase:", error.message);
        } else {
          set((state) => ({ isoModels: state.isoModels.filter(m => m.id !== id) }));
        }
      } catch (e) {
        console.error(e);
      }
    },
    signOut: async () => {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      set({ models: [], isoModels: [], user: null });
    },
    resendConfirmationEmail: async (email: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      return { error };
    }
  };
});
