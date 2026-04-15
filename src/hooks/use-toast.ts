// Minimal toast hook scaffold – wired up to avoid runtime errors
import { useState, useCallback } from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

let _toasts: Toast[] = [];
let _listeners: Array<(toasts: Toast[]) => void> = [];

function notify() {
  _listeners.forEach((l) => l([..._toasts]));
}

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  _toasts = [{ id, title, description, variant }, ..._toasts].slice(0, 5);
  notify();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback(() => {
    const handler = (t: Toast[]) => setToasts(t);
    _listeners.push(handler);
    return () => { _listeners = _listeners.filter((l) => l !== handler); };
  }, []);

  useState(subscribe);

  return { toast, toasts };
}

