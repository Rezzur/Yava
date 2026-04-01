import { create } from 'zustand';
import { userApi, type UserSummary } from '@/shared/api/client';

interface UserState {
  user: UserSummary | null;
  isLoading: boolean;
  
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: UserSummary | null) => void;
  updateProfile: (data: Partial<UserSummary>) => void;
}

export const useUser = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await userApi.getProfile();
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
  
  updateProfile: (data) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...data } });
    }
  },
}));
