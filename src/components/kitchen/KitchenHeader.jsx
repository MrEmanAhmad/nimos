import { useState, useEffect, useCallback } from 'react';
import {
  ChefHat,
  Clock,
  Wifi,
  WifiOff,
  Power,
  Pause,
  Play,
  Volume2,
  VolumeX,
  AlertTriangle,
  LogOut,
  Store,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('nimos_token');
}

export default function KitchenHeader({
  connectionStatus = 'disconnected',
  activeOrderCount = 0,
  soundEnabled = true,
  onToggleSound,
  onLogout,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [toggling, setToggling] = useState(null);

  // Live clock - update every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleEndpoint = useCallback(async (endpoint, setter, key) => {
    const token = getToken();
    if (!token) return;
    setToggling(key);
    try {
      const res = await fetch(`${API_BASE}/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Backend typically returns the new state
        if (data.is_open !== undefined) setIsOpen(data.is_open);
        if (data.is_busy !== undefined) setIsBusy(data.is_busy);
        if (data.is_paused !== undefined) setIsPaused(data.is_paused);
        // Fallback: toggle local state
        if (key === 'open' && data.is_open === undefined) setter((v) => !v);
        if (key === 'busy' && data.is_busy === undefined) setter((v) => !v);
        if (key === 'pause' && data.is_paused === undefined) setter((v) => !v);
      }
    } catch {
      // Silently fail - will retry
    } finally {
      setToggling(null);
    }
  }, []);

  const connectionColor =
    connectionStatus === 'connected'
      ? 'bg-green-500'
      : connectionStatus === 'connecting'
        ? 'bg-yellow-500'
        : 'bg-red-500';

  const connectionLabel =
    connectionStatus === 'connected'
      ? 'Live'
      : connectionStatus === 'connecting'
        ? 'Connecting...'
        : 'Disconnected';

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <header className="bg-[#0f0f1a] border-b border-[#2a2a4a] px-3 py-2 shrink-0">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Brand + Clock */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-[#e94560] shrink-0" />
            <h1 className="text-lg font-bold text-white whitespace-nowrap">
              Nimo's Kitchen
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-[#a0a0a0] text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-mono tabular-nums">{formatTime(currentTime)}</span>
          </div>

          {/* Connection status - Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-3 w-3">
              {connectionStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionColor} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`} />
            </span>
            <span className={`text-xs font-medium hidden sm:inline ${connectionStatus === 'connected' ? 'text-green-400' : 'text-[#a0a0a0]'}`}>{connectionLabel}</span>
            {connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-green-500 sm:hidden" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500 sm:hidden" />
            )}
          </div>
        </div>

        {/* Center: Active orders count */}
        <div className="flex items-center gap-2">
          <div className="bg-[#1a1a2e] rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-[#a0a0a0] text-sm">Active:</span>
            <span className="text-white font-bold text-lg tabular-nums">
              {activeOrderCount}
            </span>
          </div>
        </div>

        {/* Right: Toggles + Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Open/Closed Toggle */}
          <button
            onClick={() => toggleEndpoint('toggle-open', setIsOpen, 'open')}
            disabled={toggling === 'open'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              isOpen
                ? 'bg-green-600/20 text-green-400 border border-green-600/40 hover:bg-green-600/30'
                : 'bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600/30'
            } ${toggling === 'open' ? 'opacity-50' : ''}`}
            title={isOpen ? 'Restaurant is OPEN' : 'Restaurant is CLOSED'}
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">{isOpen ? 'Open' : 'Closed'}</span>
          </button>

          {/* Busy Mode Toggle */}
          <button
            onClick={() => toggleEndpoint('toggle-busy', setIsBusy, 'busy')}
            disabled={toggling === 'busy'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              isBusy
                ? 'bg-orange-600/20 text-orange-400 border border-orange-600/40 hover:bg-orange-600/30'
                : 'bg-[#1a1a2e] text-[#a0a0a0] border border-[#2a2a4a] hover:bg-[#222240]'
            } ${toggling === 'busy' ? 'opacity-50' : ''}`}
            title={isBusy ? 'Busy mode ON' : 'Busy mode OFF'}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Busy</span>
          </button>

          {/* Pause Orders Toggle */}
          <button
            onClick={() => toggleEndpoint('toggle-pause', setIsPaused, 'pause')}
            disabled={toggling === 'pause'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              isPaused
                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 hover:bg-yellow-600/30'
                : 'bg-[#1a1a2e] text-[#a0a0a0] border border-[#2a2a4a] hover:bg-[#222240]'
            } ${toggling === 'pause' ? 'opacity-50' : ''}`}
            title={isPaused ? 'Orders PAUSED' : 'Orders active'}
          >
            {isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Active'}</span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-[#2a2a4a] mx-1 hidden sm:block" />

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              soundEnabled
                ? 'bg-[#1a1a2e] text-[#e0e0e0] border border-[#2a2a4a] hover:bg-[#222240]'
                : 'bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600/30'
            }`}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#1a1a2e] text-[#a0a0a0] border border-[#2a2a4a] hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/40 transition-all min-h-[44px]"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
