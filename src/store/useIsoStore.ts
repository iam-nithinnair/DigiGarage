import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/* ── Types ─────────────────────────────────────────────────── */

export interface ISOModel {
  id: string;
  name: string;
  targetprice: string;
  rarity: string;
  user_id: string;
}

interface IsoState {
  isoModels: ISOModel[];
  fetchIsoModels: (userId: string) => Promise<void>;
  addIsoModel: (model: Omit<ISOModel, 'id' | 'user_id'>) => Promise<void>;
  removeIsoModel: (id: string) => Promise<void>;
}

/* ── Store ─────────────────────────────────────────────────── */

export const useIsoStore = create<IsoState>((set) => {
  const getSupabase = () => createClient();

  return {
    isoModels: [],

    fetchIsoModels: async (userId: string) => {
      const supabase = getSupabase();
      try {
        const { data, error } = await supabase
          .from('iso_models')
          .select('*')
          .order('created_at', { ascending: false })
          .eq('user_id', userId);

        if (!error && data) {
          set({ isoModels: data });
        }
      } catch (error) {
        console.error('Error fetching ISO models:', error);
      }
    },

    addIsoModel: async (model) => {
      const { useAuthStore } = require('./useAuthStore');
      const user = useAuthStore.getState().user;
      if (!user) {
        toast.error('Please login to add ISO models');
        return;
      }

      const supabase = getSupabase();
      try {
        const newRecord = {
          name: model.name,
          targetprice: model.targetprice,
          rarity: model.rarity,
          user_id: user.id,
        };

        const { data, error } = await supabase.from('iso_models').insert([newRecord]).select();

        if (error) {
          toast.error(`Database Error: ${error.message}`);
          throw new Error(error.message);
        } else if (data && data.length > 0) {
          set((state) => ({ isoModels: [data[0], ...state.isoModels] }));
        } else {
          throw new Error('ISO model inserted but no data returned. Check RLS policies.');
        }
      } catch (e) {
        throw e;
      }
    },

    removeIsoModel: async (id) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase.from('iso_models').delete().eq('id', id);
        if (error) {
          console.error('Failed to remove ISO model:', error.message);
          toast.error('Failed to remove from wishlist. Please try again.');
        } else {
          set((state) => ({ isoModels: state.isoModels.filter((m) => m.id !== id) }));
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to remove from wishlist. Please try again.');
      }
    },
  };
});
