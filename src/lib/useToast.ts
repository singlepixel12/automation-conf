import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  variant?: 'default' | 'destructive';
}

let listeners: Array<(toast: Toast) => void> = [];
let idCounter = 0;

export function toast(title: string, variant: Toast['variant'] = 'default') {
  const t: Toast = { id: String(++idCounter), title, variant };
  listeners.forEach((l) => l(t));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addListener = useCallback(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3000);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  return { toasts, subscribe: addListener };
}
