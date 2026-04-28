import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiStore {
  toasts: Toast[];
  sidebarOpen: boolean;

  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  sidebarOpen: true,

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
