import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  model_count?: number;
  iso_count?: number;
  total_investment?: number;
}

export interface AdminModel {
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

interface AdminState {
  currentUserRole: UserRole | null;
  isAdmin: boolean;
  users: UserProfile[];
  selectedUserModels: AdminModel[];
  selectedUserId: string | null;
  platformStats: {
    totalUsers: number;
    totalModels: number;
    totalIsoModels: number;
    totalInvestment: number;
  };
  isLoading: boolean;

  fetchCurrentUserRole: (userId: string) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchUserModels: (userId: string) => Promise<void>;
  deleteUserModel: (modelId: string) => Promise<void>;
  deleteUserISOModel: (modelId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  fetchPlatformStats: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  currentUserRole: null,
  isAdmin: false,
  users: [],
  selectedUserModels: [],
  selectedUserId: null,
  platformStats: {
    totalUsers: 0,
    totalModels: 0,
    totalIsoModels: 0,
    totalInvestment: 0,
  },
  isLoading: false,

  fetchCurrentUserRole: async (userId: string) => {
    const supabase = createClient();
    try {
      // Use maybeSingle to avoid PGRST116 error when no row exists
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Admin] Failed to fetch role:', error.code, error.message);
        // Profile might not exist yet — create one
        if (error.code === 'PGRST116' || !data) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, role: 'user' });
          if (insertError) {
            console.error('[Admin] Failed to create profile:', insertError.message);
          } else {
            set({ currentUserRole: 'user', isAdmin: false });
          }
        }
        return;
      }

      if (!data) {
        // No profile exists — create one
        console.log('[Admin] No profile found, creating one for:', userId);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, role: 'user' });
        if (!insertError) {
          set({ currentUserRole: 'user', isAdmin: false });
        }
        return;
      }

      const role = (data.role as UserRole) || 'user';
      console.log('[Admin] User role:', role);
      set({ currentUserRole: role, isAdmin: role === 'admin' });
    } catch (e) {
      console.error('[Admin] Exception fetching role:', e);
    }
  },

  fetchAllUsers: async () => {
    const supabase = createClient();
    set({ isLoading: true });
    try {
      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch users');
        set({ isLoading: false });
        return;
      }

      // Fetch model counts per user
      const { data: modelCounts } = await supabase
        .from('models')
        .select('user_id, purchase_price');

      const { data: isoCounts } = await supabase
        .from('iso_models')
        .select('user_id');

      // Aggregate counts
      const modelCountMap: Record<string, { count: number; investment: number }> = {};
      const isoCountMap: Record<string, number> = {};

      (modelCounts || []).forEach((m: { user_id: string; purchase_price?: number }) => {
        if (!modelCountMap[m.user_id]) {
          modelCountMap[m.user_id] = { count: 0, investment: 0 };
        }
        modelCountMap[m.user_id].count++;
        modelCountMap[m.user_id].investment += m.purchase_price || 0;
      });

      (isoCounts || []).forEach((m: { user_id: string }) => {
        isoCountMap[m.user_id] = (isoCountMap[m.user_id] || 0) + 1;
      });

      const users: UserProfile[] = (profiles || []).map((p: UserProfile) => ({
        ...p,
        model_count: modelCountMap[p.id]?.count || 0,
        iso_count: isoCountMap[p.id] || 0,
        total_investment: modelCountMap[p.id]?.investment || 0,
      }));

      set({ users, isLoading: false });
    } catch {
      toast.error('Failed to fetch users');
      set({ isLoading: false });
    }
  },

  fetchUserModels: async (userId: string) => {
    const supabase = createClient();
    set({ isLoading: true, selectedUserId: userId });
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch user models');
        set({ isLoading: false });
        return;
      }

      set({ selectedUserModels: data || [], isLoading: false });
    } catch {
      toast.error('Failed to fetch user models');
      set({ isLoading: false });
    }
  },

  deleteUserModel: async (modelId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('models').delete().eq('id', modelId);
      if (error) {
        toast.error('Failed to delete model');
        return;
      }
      set((state) => ({
        selectedUserModels: state.selectedUserModels.filter(m => m.id !== modelId),
      }));
      toast.success('Model deleted');
    } catch {
      toast.error('Failed to delete model');
    }
  },

  deleteUserISOModel: async (modelId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('iso_models').delete().eq('id', modelId);
      if (error) {
        toast.error('Failed to delete ISO model');
        return;
      }
      toast.success('ISO model deleted');
    } catch {
      toast.error('Failed to delete ISO model');
    }
  },

  updateUserRole: async (userId: string, role: UserRole) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        toast.error('Failed to update role');
        return;
      }

      set((state) => ({
        users: state.users.map(u =>
          u.id === userId ? { ...u, role } : u
        ),
      }));
      toast.success(`User role updated to ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  },

  fetchPlatformStats: async () => {
    const supabase = createClient();
    try {
      const [
        { count: totalUsers },
        { count: totalModels },
        { count: totalIsoModels },
        { data: investments },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('models').select('*', { count: 'exact', head: true }),
        supabase.from('iso_models').select('*', { count: 'exact', head: true }),
        supabase.from('models').select('purchase_price'),
      ]);

      const totalInvestment = (investments || []).reduce(
        (acc: number, m: { purchase_price?: number }) => acc + (m.purchase_price || 0),
        0
      );

      set({
        platformStats: {
          totalUsers: totalUsers || 0,
          totalModels: totalModels || 0,
          totalIsoModels: totalIsoModels || 0,
          totalInvestment,
        },
      });
    } catch {
      // Stats are non-critical
    }
  },
}));
