// src/lib/components/ui/toast/toast.ts
import { writable } from 'svelte/store';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  position: ToastPosition;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastMessage[]>([]);

  function show(message: string, options: ToastOptions = {}) {
    const id = Math.random().toString(36).substring(2);
    const toast: ToastMessage = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      position: options.position || 'top-right'
    };

    update(toasts => [...toasts, toast]);

    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, toast.duration);
    }

    return id;
  }

  function remove(id: string) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  const toast = {
    subscribe,
    success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      show(message, { ...options, type: 'success' }),
    error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      show(message, { ...options, type: 'error' }),
    warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      show(message, { ...options, type: 'warning' }),
    info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      show(message, { ...options, type: 'info' }),
    remove
  };

  return toast;
}

export const toast = createToastStore();