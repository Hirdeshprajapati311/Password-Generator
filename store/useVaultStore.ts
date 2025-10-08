import { CreateVaultItemDto, VaultItem } from "@/lib/types/vault";
import { create } from "zustand";


interface VaultState {
  items: VaultItem[]
  loading: boolean;
  fetchVault: () => Promise<void>
  addItem: (data: CreateVaultItemDto) => Promise<void>;
  updateItem:(id:string,data:Partial<CreateVaultItemDto>)=>Promise<void>
  deleteItem: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
   items: [],
  loading: false,
  fetchVault: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/vault");
      const data: VaultItem[] = await res.json();
      set({ items: data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },
  addItem: async (data) => {
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const newItem: VaultItem = await res.json();
      set({items:[...get().items,newItem]})
    } catch (err) {
      console.error(err);
    }
  },
  updateItem: async (id, data) => {
    try {
      const res = await fetch(`/api/vault?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      const updated: VaultItem = await res.json();
      set({ items: get().items.map(item => item._id === id ? updated : item) });
    } catch (err) {
      console.error(err);
      
    }
  },
  deleteItem: async (id) => {
    try {
      await fetch(`/api/vault?id=${id}`, {
      method: "DELETE",
    });
    set({ items: get().items.filter(item => item._id !== id) });
    } catch (err) {
      console.error(err);
      
    
   }

  }
}))