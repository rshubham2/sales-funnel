// src/lib/stores/toast2.ts
import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    update(toasts => [...toasts, newToast]);
    
    if (toast.duration) {
      setTimeout(() => {
        remove(id);
      }, toast.duration);
    }
    
    return id;
  }

  function remove(id: string) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  function clear() {
    update(() => []);
  }

  return {
    subscribe,
    add,
    remove,
    clear
  };
}

export const toasts = createToastStore();