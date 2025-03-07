// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

export type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let toastCounter = 0;

  return {
    subscribe,
    add: (message: string, type: 'success' | 'error' = 'success') => {
      const id = toastCounter++;
      update(toasts => [...toasts, { id, message, type }]);
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, 5000);
    },
    remove: (id: number) => {
      update(toasts => toasts.filter(t => t.id !== id));
    }
  };
}

export const toasts = createToastStore();