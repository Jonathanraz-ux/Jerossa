import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Trash2, HelpCircle } from 'lucide-react';
import './feedback.css';

// ── Contextes ──────────────────────────────────────────────

const ToastContext = createContext(null);
const ConfirmContext = createContext(null);

export const useToast = () => useContext(ToastContext);
export const useConfirm = () => useContext(ConfirmContext);

const TOAST_ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

// ── Provider unique : toasts + confirmation ───────────────

let toastId = 0;

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const leavingRef = useRef(new Set());

  const dismissToast = useCallback((id) => {
    if (leavingRef.current.has(id)) return;
    leavingRef.current.add(id);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      leavingRef.current.delete(id);
    }, 200);
  }, []);

  const toast = useCallback((message, options = {}) => {
    const { type = 'info', title = '', duration = 3500 } = options;
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-3), { id, message, type, title, duration }]);
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration);
    }
    return id;
  }, [dismissToast]);

  const confirmState = useState(null);
  const [confirmRequest, setConfirmRequest] = confirmState;

  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    const {
      title = 'Confirmer',
      message = '',
      confirmLabel = 'Confirmer',
      cancelLabel = 'Annuler',
      danger = false,
    } = options;
    return new Promise((resolve) => {
      if (resolveRef.current) resolveRef.current(false); // une seule demande à la fois
      resolveRef.current = resolve;
      setConfirmRequest({ title, message, confirmLabel, cancelLabel, danger });
    });
  }, [setConfirmRequest]);

  const settleConfirm = useCallback((value) => {
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
    setConfirmRequest(null);
  }, [setConfirmRequest]);

  React.useEffect(() => {
    if (!confirmRequest) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') settleConfirm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmRequest, settleConfirm]);

  const toastValue = useMemo(() => ({ toast }), [toast]);
  const confirmValue = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ToastContext.Provider value={toastValue}>
      <ConfirmContext.Provider value={confirmValue}>
        {children}

        <div className="jr-toast-stack" aria-live="polite" aria-atomic="false">
          {toasts.map((t) => {
            const Icon = TOAST_ICONS[t.type] || Info;
            return (
              <div
                key={t.id}
                className={`jr-toast jr-toast--${t.type} ${t.leaving ? 'jr-toast--leaving' : ''}`}
                role="status"
              >
                <Icon size={18} strokeWidth={1.75} className="jr-toast-icon" />
                <div className="jr-toast-body">
                  {t.title && <div className="jr-toast-title">{t.title}</div>}
                  <div className={t.title ? 'jr-toast-desc' : 'jr-toast-title'}>{t.message}</div>
                </div>
                <button className="jr-toast-close" onClick={() => dismissToast(t.id)} aria-label="Fermer">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {confirmRequest && (
          <div
            className="jr-confirm-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) settleConfirm(false);
            }}
          >
            <div
              className={`jr-confirm-panel ${confirmRequest.danger ? 'jr-confirm-panel--danger' : ''}`}
              role="alertdialog"
              aria-modal="true"
              aria-label={confirmRequest.title}
            >
              <div className="jr-confirm-icon">
                {confirmRequest.danger ? (
                  <Trash2 size={20} strokeWidth={1.75} />
                ) : (
                  <HelpCircle size={20} strokeWidth={1.75} />
                )}
              </div>
              <h3 className="jr-confirm-title">{confirmRequest.title}</h3>
              {confirmRequest.message && (
                <p className="jr-confirm-message">{confirmRequest.message}</p>
              )}
              <div className="jr-confirm-actions">
                <button className="jr-btn-ghost" autoFocus onClick={() => settleConfirm(false)}>
                  {confirmRequest.cancelLabel}
                </button>
                <button className="jr-btn-solid" onClick={() => settleConfirm(true)}>
                  {confirmRequest.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};
