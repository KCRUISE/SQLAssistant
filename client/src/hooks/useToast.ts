import React, { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const toastState: ToastState = {
  toasts: []
};

const listeners: (() => void)[] = [];

function emitChange() {
  listeners.forEach(listener => listener());
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast
  };
  
  toastState.toasts = [...toastState.toasts, newToast];
  emitChange();

  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, newToast.duration!);

  return id;
}

function removeToast(id: string) {
  toastState.toasts = toastState.toasts.filter(toast => toast.id !== id);
  emitChange();
}

export function useToast() {
  const [, forceUpdate] = useState({});

  const subscribe = useCallback(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    return addToast(props);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  // Subscribe to changes
  React.useEffect(() => {
    return subscribe();
  }, [subscribe]);

  return {
    toast,
    dismiss,
    toasts: toastState.toasts
  };
}

// For compatibility with existing code
export { useToast as default };
