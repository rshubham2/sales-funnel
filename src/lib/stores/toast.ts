// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function addToast(message: string, type: ToastType = 'info') {
    const id = Date.now();
    update(toasts => [...toasts, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  }

  function removeToast(id: number) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  return {
    subscribe,
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info')
  };
}

export const toasts = createToastStore();