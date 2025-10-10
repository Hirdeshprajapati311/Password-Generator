import { create } from "zustand";


interface AuthState{
  userId: string | null;
  isLoading: boolean;
  setUserId: (id: string | null) => void
  setIsLoading:(loading:boolean) =>void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isLoading:true,
  setUserId: (id) => set({ userId: id }),
  setIsLoading:(loading) => set({isLoading:loading})
}))