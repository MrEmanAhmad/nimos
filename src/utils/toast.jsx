/**
 * Toast notification system for Nimo's Limerick
 *
 * Uses a custom-event pattern so any module can fire toasts without
 * importing React or needing a context provider. The <ToastContainer />
 * component listens for events and renders the notifications.
 *
 * Usage:
 *   import { toast } from '../utils/toast';
 *   toast.success('Order placed!');
 *   toast.error('Something went wrong');
 *   toast.info('Your order is being prepared');
 *
 * Mount once in your app root:
 *   import { ToastContainer } from '../utils/toast';
 *   <ToastContainer />
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Event bus
// ---------------------------------------------------------------------------

const TOAST_EVENT = 'nimos:toast';

function dispatch(type, message, options = {}) {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { type, message, duration: options.duration },
    })
  );
}

// ---------------------------------------------------------------------------
// Public API -- importable from anywhere
// ---------------------------------------------------------------------------

export const toast = {
  success(message, options) {
    dispatch('success', message, options);
  },
  error(message, options) {
    dispatch('error', message, options);
  },
  info(message, options) {
    dispatch('info', message, options);
  },
  warning(message, options) {
    dispatch('warning', message, options);
  },
};

// ---------------------------------------------------------------------------
// Hook (internal convenience for the container)
// ---------------------------------------------------------------------------

export function useToast() {
  return toast;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

const TYPE_STYLES = {
  success: {
    bg: 'bg-emerald-600/95',
    border: 'border-emerald-400/30',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-600/95',
    border: 'border-red-400/30',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  },
  info: {
    bg: 'bg-blue-600/95',
    border: 'border-blue-400/30',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-amber-600/95',
    border: 'border-amber-400/30',
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.56 20h16.88a1 1 0 00.87-1.28l-8.6-14.86a1 1 0 00-1.42 0z"
        />
      </svg>
    ),
  },
};

// ---------------------------------------------------------------------------
// ToastContainer component
// ---------------------------------------------------------------------------

let toastIdCounter = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    // Mark as exiting for animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove from DOM after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    }, 300);
  }, []);

  const addToast = useCallback(
    (detail) => {
      const id = ++toastIdCounter;
      const duration = detail.duration || DEFAULT_DURATION;

      setToasts((prev) => {
        const next = [
          ...prev,
          {
            id,
            type: detail.type || 'info',
            message: detail.message,
            exiting: false,
          },
        ];
        // Keep within limit by dropping oldest
        if (next.length > MAX_TOASTS) {
          const dropped = next.shift();
          if (dropped) {
            const timer = timersRef.current.get(dropped.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(dropped.id);
            }
          }
        }
        return next;
      });

      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  useEffect(() => {
    function handleEvent(e) {
      addToast(e.detail);
    }

    window.addEventListener(TOAST_EVENT, handleEvent);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleEvent);
      // Clean up all timers on unmount
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const style = TYPE_STYLES[t.type] || TYPE_STYLES.info;
        return (
          <div
            key={t.id}
            role="alert"
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl
              border backdrop-blur-sm shadow-lg text-white text-sm
              transition-all duration-300
              ${style.bg} ${style.border}
              ${t.exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            style={{
              animation: t.exiting ? undefined : 'toast-slide-in 0.3s ease-out',
            }}
          >
            {style.icon}
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 ml-1 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        );
      })}

      {/* Inline keyframes -- avoids needing a global stylesheet entry */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
