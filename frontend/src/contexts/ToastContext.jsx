import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastIcons = {
    success: <CheckCircle2 size={18} color="var(--sb-success)" />,
    error: <AlertCircle size={18} color="var(--sb-danger)" />,
    warning: <AlertTriangle size={18} color="var(--sb-warning)" />,
    info: <Info size={18} color="var(--sb-info)" />
  };

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast }}>
      {children}
      <div className="toast-container" role="region" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div>{toastIcons[t.type] || toastIcons.info}</div>
            <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--sb-text-primary)' }}>
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ padding: '2px', color: 'var(--sb-text-muted)' }}
              aria-label="Đóng"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

