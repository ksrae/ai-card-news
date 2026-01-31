"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000); // Auto close after 4s
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top-2 fade-in duration-300
              ${t.type === 'success' ? 'bg-white border-green-200 text-green-800' : ''}
              ${t.type === 'error' ? 'bg-white border-red-200 text-red-800' : ''}
              ${t.type === 'info' ? 'bg-white border-blue-200 text-blue-800' : ''}
            `}
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}

            <p className="flex-1 text-sm font-medium">{t.message}</p>

            <button
              onClick={() => removeToast(t.id)}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
