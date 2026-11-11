import React from 'react';
import { RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Hitilafu isiyotarajiwa imetokea.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Tazama UI ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCachesAndReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // ignore cleanup failures
    }
    window.location.replace('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#F4F6F9] dark:bg-[#10131B] text-slate-900 dark:text-white flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#FF3040]/15 text-[#FF3040] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-extrabold tracking-tight">
                Tazama imesimama kidogo
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                Kuna tatizo la muda kwenye kivinjari au akiba ya App. Tafadhali pakia upya ili kuendelea kutazama.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Pakia Upya (Reload)</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetCachesAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Safisha Cache &amp; Fungua Upya</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
