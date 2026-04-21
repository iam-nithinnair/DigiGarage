import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface Model {
  id: string;
  name: string;
  year: string;
  manufacturer: string;
  series: string;
  scale: string;
  isFavorite: boolean;
  image: string;
}

export interface ISOModel {
  id: string;
  name: string;
  targetPrice: string;
  rarity: string;
}

interface CollectionState {
  models: Model[];
  isoModels: ISOModel[];
  isLoaded: boolean;
  fetchData: () => Promise<void>;
  addModel: (model: Omit<Model, 'id' | 'isFavorite'>) => Promise<void>;
  removeModel: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addISOModel: (model: Omit<ISOModel, 'id'>) => Promise<void>;
  removeISOModel: (id: string) => Promise<void>;
}

export const useStore = create<CollectionState>((set) => {
  const getSupabase = () => createClient();

  return {
    models: [],
    isoModels: [],
    isLoaded: false,
    fetchData: async () => {
      const supabase = getSupabase();
      try {
        const [modelsRes, isoModelsRes] = await Promise.all([
          supabase.from('models').select('*'),
          supabase.from('iso_models').select('*')
        ]);
        
        let loadedModels = [];
        let loadedIsoModels = [];

        if (!modelsRes.error && modelsRes.data) {
           loadedModels = modelsRes.data;
        } else {
           console.warn("Could not load collection models. Does the table exist?", modelsRes.error);
        }

        if (!isoModelsRes.error && isoModelsRes.data) {
           loadedIsoModels = isoModelsRes.data;
        } else {
           console.warn("Could not load ISO models. Does the table exist?", isoModelsRes.error);
        }

        set({ 
            models: loadedModels, 
            isoModels: loadedIsoModels, 
            isLoaded: true 
        });

      } catch (error) {
        console.error("Error connecting to Supabase during initialization:", error);
        set({ isLoaded: true });
      }
    },
    addModel: async (model) => {
      const supabase = getSupabase();
      try {
        // We use Date.now string just to keep ID creation stable out of the box, 
        // though typically you'd omit 'id' entirely and let Postgres generate the UUID default.
        const newModel = { ...model, id: Date.now().toString(), isFavorite: false };
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
      
      // Optmistic Update for immediate UI snap
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

      // Background write
      try {
        const { error } = await supabase.from('models').update({ isFavorite: newFavState }).eq('id', id);
        if (error) {
          console.error("Failed to persist favorite toggle in Supabase:", error);
          set((state) => ({
            models: state.models.map(m => m.id === id ? { ...m, isFavorite: !newFavState } : m)
          }));
        }
      } catch (e) {
        console.error(e);
      }
    },
    addISOModel: async (model) => {
      const supabase = getSupabase();
      try {
        const newModel = { ...model, id: Date.now().toString() };
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
    }
  };
});
