import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { useAuth } from '../../context/AuthContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useAuth();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-4 left-3 z-[90] flex items-center gap-2 rounded-xl bg-amber-500 text-black px-3 py-2 text-xs font-bold shadow-lg shadow-amber-500/25 border border-amber-400 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {language === 'en'
          ? 'Offline Mode — Showing cached content'
          : 'Huna Intaneti — Unatumia data iliyohifadhiwa'}
      </span>
    </div>
  );
};
