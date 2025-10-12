import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userId: string | null;
  userEmail: string | null;
  username: string | null;
  isLoading: boolean;
  setUserId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setUserEmail: (email: string | null) => void;
  setUsername: (username: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      userEmail: null,
      username: null,
      isLoading: true,
      setUserId: (id) => set({ userId: id }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setUserEmail: (userEmail) => set({ userEmail }),
      setUsername: (username) => set({ username }),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);