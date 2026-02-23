import { useState, useEffect, useRef } from 'react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [visible, setVisible] = useState(!navigator.onLine);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    function handleOffline() {
      // Cancel any pending hide
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setIsOffline(true);
      setVisible(true);
    }

    function handleOnline() {
      setIsOffline(false);
      // Keep banner visible briefly to show "Back online" feedback
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
      }, 2000);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed top-0 left-0 right-0 z-[9998]
        flex items-center justify-center gap-2
        px-4 py-2.5 text-sm font-medium
        transition-colors duration-500 ease-in-out shadow-lg
        ${isOffline
          ? 'bg-amber-500/95 text-amber-950'
          : 'bg-emerald-500/95 text-emerald-950'
        }
      `}
    >
      {isOffline ? (
        <>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M12 12h.01"
            />
          </svg>
          <span>You're offline. Some features may not work.</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Back online!</span>
        </>
      )}
    </div>
  );
}
