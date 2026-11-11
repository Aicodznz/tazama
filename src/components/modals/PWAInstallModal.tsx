import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  Check,
  Apple,
  Monitor,
  Zap,
  WifiOff,
  Bell,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copied, setCopied] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);

  useEffect(() => {
    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');
  }, [isIOS, isAndroid]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!isInstallable || installing) return;
    setInstalling(true);
    try {
      const accepted = await install();
      if (accepted) {
        onClose();
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleShareOrCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with App Logo & Title */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-[#202736] dark:via-[#1A202C] dark:to-[#121620] p-5 border-b border-slate-200 dark:border-[#262E3E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-[#FF6B6B] flex items-center justify-center shadow-lg shadow-[#FF3040]/30">
              <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-white ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                  Sakinisha Tazama App
                </h3>
                <span className="text-[10px] bg-emerald-500/15 dark:bg-[#16C784]/20 text-emerald-700 dark:text-[#16C784] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 dark:border-[#16C784]/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                Weka kwenye skrini ya simu yako bure
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#16C784]/15 border border-emerald-200 dark:border-[#16C784]/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-[#16C784] shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Tazama Tayari Imesakinishwa!
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                  Unafungua Tazama moja kwa moja kama programu kamili (Standalone PWA).
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <button
              type="button"
              onClick={handleNativeInstall}
              disabled={installing}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF3040] to-[#E02635] hover:brightness-110 text-white font-extrabold text-sm shadow-lg shadow-[#FF3040]/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{installing ? 'Inasakinisha...' : 'Sakinisha Tazama Sasa (Bofya Hapa)'}</span>
            </button>
          ) : null}

          {/* Platform Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-[#10131B] p-1 rounded-2xl border border-slate-200 dark:border-[#262E3E]">
            <button
              type="button"
              onClick={() => setPlatform('android')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                platform === 'android'
                  ? 'bg-[#FF3040] text-white shadow-md'
                  : 'text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              type="button"
              onClick={() => setPlatform('ios')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                platform === 'ios'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone / iPad</span>
            </button>
            <button
              type="button"
              onClick={() => setPlatform('desktop')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                platform === 'desktop'
                  ? 'bg-white dark:bg-[#232A39] text-slate-900 dark:text-white border border-slate-200 dark:border-[#262E3E] shadow-sm'
                  : 'text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Kompyuta</span>
            </button>
          </div>

          {/* Step by Step Guide per platform */}
          <div className="bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-2xl p-4 space-y-3">
            {platform === 'android' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF3040]/15 dark:bg-[#FF3040]/20 text-[#FF3040] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-xs text-slate-800 dark:text-white leading-relaxed">
                    Kwenye kivinjari chako cha <strong>Chrome</strong> au <strong>Edge</strong>, bonyeza alama ya nukta tatu (<strong>⋮</strong>) juu kulia.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF3040]/15 dark:bg-[#FF3040]/20 text-[#FF3040] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-xs text-slate-800 dark:text-white leading-relaxed">
                    Bonyeza <strong>&quot;Install app / Add to Home screen&quot;</strong> kisha thibitisha.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 dark:bg-[#16C784]/20 text-emerald-700 dark:text-[#16C784] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                    Nembo ya Tazama itatokea kwenye kioo cha simu yako na utaweza kuitumia kama App kamili!
                  </p>
                </div>
              </>
            )}

            {platform === 'ios' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-xs text-slate-800 dark:text-white leading-relaxed">
                    Kwenye kivinjari cha <strong>Safari</strong>, bonyeza kitufe cha <strong>Share (Shiriki)</strong> chini katikati ya kioo.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-xs text-slate-800 dark:text-white leading-relaxed">
                    Sogeza chini na ubofye <strong>&quot;Add to Home Screen&quot;</strong> (Weka kwenye Skrini ya Mwanzo).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 dark:bg-[#16C784]/20 text-emerald-700 dark:text-[#16C784] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                    Bonyeza <strong>&quot;Add&quot;</strong> juu kulia. Tazama itakuwa kwenye skrini ya simu yako mara moja!
                  </p>
                </div>
              </>
            )}

            {platform === 'desktop' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-xs text-slate-800 dark:text-white leading-relaxed">
                    Kwenye upau wa anwani (Address bar) wa Chrome/Edge, bofya aikoni ya <strong>Install App</strong> au kitufe cha sakinisha hapo juu.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-xs text-slate-800 dark:text-white leading-relaxed">
                    Thibitisha kwa kubofya <strong>&quot;Install Tazama&quot;</strong> ili ifunguke kama programu ya kompyuta.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-[#262E3E]/60 text-xs text-slate-700 dark:text-[#A7B0C0]">
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Inafunguka papo hapo</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-[#262E3E]/60 text-xs text-slate-700 dark:text-[#A7B0C0]">
              <WifiOff className="w-4 h-4 text-emerald-600 dark:text-[#16C784] shrink-0" />
              <span>Inafanya kazi nje ya mtandao</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-[#262E3E]/60 text-xs text-slate-700 dark:text-[#A7B0C0]">
              <Bell className="w-4 h-4 text-[#FF3040] shrink-0" />
              <span>Arifa za video mpya</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-[#262E3E]/60 text-xs text-slate-700 dark:text-[#A7B0C0]">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Hakuna MB za Play Store</span>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleShareOrCopy}
              className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#191E29] hover:bg-slate-200 dark:hover:bg-[#232A39] border border-slate-200 dark:border-[#262E3E] text-xs font-bold text-slate-900 dark:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
              ) : (
                <Download className="w-4 h-4 text-[#FF3040]" />
              )}
              <span>{copied ? 'Kiunganishi Kimenakiliwa!' : 'Nakili Kiunganishi'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-[#FF3040] hover:bg-[#E02635] text-xs font-extrabold text-white transition-all active:scale-95 shadow-lg shadow-[#FF3040]/30 cursor-pointer"
            >
              {isInstalled ? 'Funga' : 'Sawa, Nimeelewa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
