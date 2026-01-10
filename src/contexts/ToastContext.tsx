import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[150] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) => {
    let bgClass = '';
    let icon = null;

    switch (toast.type) {
        case 'success':
            bgClass = 'bg-emerald-500 border-emerald-400 text-white';
            icon = <CheckCircle className="w-5 h-5" />;
            break;
        case 'error':
            bgClass = 'bg-red-500 border-red-400 text-white';
            icon = <AlertCircle className="w-5 h-5" />;
            break;
        case 'warning':
            bgClass = 'bg-orange-500 border-orange-400 text-white';
            icon = <AlertTriangle className="w-5 h-5" />;
            break;
        default:
            bgClass = 'bg-blue-500 border-blue-400 text-white';
            icon = <Info className="w-5 h-5" />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            layout
            className={`min-w-[300px] p-4 rounded-xl shadow-lg border flex items-start gap-3 backdrop-blur-md ${bgClass}`}
        >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
            <button onClick={() => onDismiss(toast.id)} className="opacity-70 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
