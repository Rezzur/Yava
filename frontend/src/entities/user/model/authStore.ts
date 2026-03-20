import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, chatApi, type UserSummary } from '@/shared/api/client';

interface AuthState {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { name: string; username: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  fetchChats: () => Promise<void>;
  setUser: (user: UserSummary) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ identifier, password });
          const { accessToken, user } = response.data;
          
          localStorage.setItem('yavimax_token', accessToken);
          set({ 
            user, 
            token: accessToken, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          const { accessToken, user } = response.data;
          
          localStorage.setItem('yavimax_token', accessToken);
          set({ 
            user, 
            token: accessToken, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('yavimax_token');
        localStorage.removeItem('yavimax_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
      
      fetchChats: async () => {
        try {
          await chatApi.getChats();
        } catch (error) {
          console.error('Failed to fetch chats:', error);
        }
      },
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'yavimax-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
