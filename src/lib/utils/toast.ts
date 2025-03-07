// src/lib/utils/toast.ts
import { writable } from 'svelte/store';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let count = 0;

  function show(message: string, type: ToastType) {
    const id = count++;
    const toast = { id, type, message };
    
    update(toasts => [...toasts, toast]);
    
    setTimeout(() => {
      update(toasts => toasts.filter(t => t.id !== id));
    }, 3000);
  }

  return {
    subscribe,
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info'),
  };
}

export const toast = createToastStore();