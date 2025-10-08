import { create } from "zustand";


interface AuthState{
  isLoggeedIn: boolean;
  userId: string | null;
  login: (userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggeedIn: false,
  userId: null,
  login: (userId) => set({ isLoggeedIn: true, userId }),
  logout: () => set({ isLoggeedIn: false, userId: null }),
}))