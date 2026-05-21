import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/* ── Types ─────────────────────────────────────────────────── */

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

interface CollectionState {
  models: Model[];
  fetchModels: (userId: string) => Promise<void>;
  addModel: (model: Omit<Model, 'id' | 'isFavorite' | 'user_id'>) => Promise<void>;
  removeModel: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

/* ── Store ─────────────────────────────────────────────────── */

export const useCollectionStore = create<CollectionState>((set, get) => {
  const getSupabase = () => createClient();

  return {
    models: [],

    fetchModels: async (userId: string) => {
      const supabase = getSupabase();
      try {
        const { data, error } = await supabase
          .from('models')
          .select('*')
          .order('created_at', { ascending: false })
          .eq('user_id', userId);

        if (!error && data) {
          set({ models: data });
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    },

    addModel: async (model) => {
      const { useAuthStore } = require('./useAuthStore');
      const user = useAuthStore.getState().user;
      if (!user) {
        toast.error('Please login to add models');
        return;
      }

      const supabase = getSupabase();
      try {
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
          isFavorite: false,
        };

        const { data, error } = await supabase.from('models').insert([newRecord]).select();

        if (error) {
          toast.error(`Database Error: ${error.message}`);
          throw new Error(error.message);
        } else if (data && data.length > 0) {
          set((state) => ({ models: [data[0], ...state.models] }));
        } else {
          throw new Error('Model inserted but no data returned. Check RLS policies.');
        }
      } catch (e) {
        throw e;
      }
    },

    removeModel: async (id) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (error) {
          console.error('Failed to remove model:', error.message);
        } else {
          set((state) => ({ models: state.models.filter((m) => m.id !== id) }));
        }
      } catch (e) {
        console.error(e);
      }
    },

    toggleFavorite: async (id) => {
      const supabase = getSupabase();
      let newFavState = false;

      // Optimistic Update
      set((state) => {
        const newModels = state.models.map((m) => {
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
          console.error('Error toggling favorite:', error.message);
          set((state) => ({
            models: state.models.map((m) => (m.id === id ? { ...m, isFavorite: !newFavState } : m)),
          }));
        }
      } catch (e) {
        console.error(e);
      }
    },
  };
});
