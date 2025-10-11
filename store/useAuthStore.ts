import { create } from "zustand";


interface AuthState{
  userId: string | null;
  userEmail: string | null;
  isLoading: boolean;
  setUserId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void
  setUserEmail: (email: string |null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  userEmail: null,
  isLoading:true,
  setUserId: (id) => set({ userId: id }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setUserEmail: (userEmail) => set({ userEmail }),
}))