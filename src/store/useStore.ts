import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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
}

export const useStore = create<CollectionState>((set, get) => {
  const getSupabase = () => createClient();

  return {
    models: [],
    isoModels: [],
    user: null,
    isLoaded: false,
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
          supabase.from('models').select('*').eq('user_id', user.id),
          supabase.from('iso_models').select('*').eq('user_id', user.id)
        ]);
        
        let loadedModels = [];
        let loadedIsoModels = [];

        if (!modelsRes.error && modelsRes.data) {
           loadedModels = modelsRes.data;
        } else {
           console.warn("Could not load collection models.", modelsRes.error);
        }

        if (!isoModelsRes.error && isoModelsRes.data) {
           loadedIsoModels = isoModelsRes.data;
        } else {
           console.warn("Could not load ISO models.", isoModelsRes.error);
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
      if (!user) return;

      const supabase = getSupabase();
      try {
        const newModel = { 
          ...model, 
          user_id: user.id,
          isFavorite: false 
        };
        const { data, error } = await supabase.from('models').insert([newModel]).select();
        
        if (!error && data) {
          set((state) => ({ models: [...state.models, data[0]] }));
        } else {
          console.error("Failed to add model to Supabase:", error);
        }
      } catch (e) {
        console.error(e);
      }
    },
    removeModel: async (id) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (!error) {
          set((state) => ({ models: state.models.filter(m => m.id !== id) }));
        } else {
          console.error("Failed to remove model from Supabase:", error);
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
      if (!user) return;

      const supabase = getSupabase();
      try {
        const newModel = { ...model, user_id: user.id };
        const { data, error } = await supabase.from('iso_models').insert([newModel]).select();
        if (!error && data) {
          set((state) => ({ isoModels: [...state.isoModels, data[0]] }));
        } else {
          console.error("Failed to add ISO model to Supabase:", error);
        }
      } catch (e) {
        console.error(e);
      }
    },
    removeISOModel: async (id) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase.from('iso_models').delete().eq('id', id);
        if (!error) {
          set((state) => ({ isoModels: state.isoModels.filter(m => m.id !== id) }));
        } else {
          console.error("Failed to remove ISO model from Supabase:", error);
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
