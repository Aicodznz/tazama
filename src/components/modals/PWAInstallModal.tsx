import React, { useState } from 'react';
import { Smartphone, Download, X, Check, Apple, Monitor, Zap, WifiOff, Bell, ShieldCheck } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleShareOrCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header with App Logo & Title */}
        <div className="bg-gradient-to-r from-[#202736] via-[#1A202C] to-[#121620] p-5 border-b border-[#262E3E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-[#FF6B6B] flex items-center justify-center shadow-lg shadow-[#FF3040]/30">
              <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-white ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">Sakinisha Tazama App</h3>
                <span className="text-[10px] bg-[#16C784]/20 text-[#16C784] font-bold px-2 py-0.5 rounded-full border border-[#16C784]/30">PWA</span>
              </div>
              <p className="text-xs text-[#A7B0C0]">Weka kwenye skrini ya simu yako bure</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#A7B0C0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 bg-[#10131B] p-1 rounded-2xl border border-[#262E3E]">
            <button
              onClick={() => setPlatform('android')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                platform === 'android'
                  ? 'bg-[#FF3040] text-white shadow-md'
                  : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setPlatform('ios')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                platform === 'ios'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone / iPad</span>
            </button>
            <button
              onClick={() => setPlatform('desktop')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                platform === 'desktop'
                  ? 'bg-[#232A39] text-white border border-[#262E3E]'
                  : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Kompyuta</span>
            </button>
          </div>

          {/* Step by Step Guide per platform */}
          <div className="bg-[#10131B] border border-[#262E3E] rounded-2xl p-4 space-y-3">
            {platform === 'android' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF3040]/20 text-[#FF3040] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-white leading-relaxed">
                    Kwenye kivinjari chako cha <strong>Chrome</strong> au <strong>Firefox</strong>, bonyeza alama ya nukta tatu (<strong>⋮</strong>) juu kulia.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF3040]/20 text-[#FF3040] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-white leading-relaxed">
                    Bonyeza <strong>"Weka kwenye Skrini ya Mwanzo"</strong> (au <em>"Install App / Add to Home screen"</em>).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16C784]/20 text-[#16C784] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    Nembo ya Tazama itatokea kwenye kioo cha simu yako na utaweza kuitumia kama App kamili!
                  </p>
                </div>
              </>
            )}

            {platform === 'ios' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-white leading-relaxed">
                    Kwenye kivinjari cha <strong>Safari</strong>, bonyeza kitufe cha <strong>Share (Shiriki)</strong> chini katikati ya kioo (alama ya sanduku lenye mshale unaoelekea juu).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-white leading-relaxed">
                    Sogeza chini na ubofye <strong>"Add to Home Screen"</strong> (Weka kwenye Skrini ya Mwanzo).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16C784]/20 text-[#16C784] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    Bonyeza <strong>"Add"</strong> juu kulia. Tazama itakuwa kwenye skrini ya simu yako mara moja!
                  </p>
                </div>
              </>
            )}

            {platform === 'desktop' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-white leading-relaxed">
                    Kwenye upau wa anwani (Address bar) wa Chrome/Edge, bofya aikoni ya <strong>Install App</strong> au nukta tatu za menu.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-white leading-relaxed">
                    Thibitisha kwa kubofya <strong>"Install Tazama"</strong> ili ifunguke kama programu ya kompyuta.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141822] border border-[#262E3E]/60 text-xs text-[#A7B0C0]">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Inafunguka papo hapo</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141822] border border-[#262E3E]/60 text-xs text-[#A7B0C0]">
              <WifiOff className="w-4 h-4 text-[#16C784] shrink-0" />
              <span>Inacheza nje ya mtandao</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141822] border border-[#262E3E]/60 text-xs text-[#A7B0C0]">
              <Bell className="w-4 h-4 text-[#FF3040] shrink-0" />
              <span>Arifa za video mpya</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141822] border border-[#262E3E]/60 text-xs text-[#A7B0C0]">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Hakuna MB za Play Store</span>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleShareOrCopy}
              className="flex-1 py-2.5 rounded-2xl bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-xs font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-[#16C784]" /> : <Download className="w-4 h-4 text-[#FF3040]" />}
              <span>{copied ? 'Kiunganishi Kimenakiliwa!' : 'Nakili Kiunganishi'}</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-[#FF3040] hover:bg-[#E02635] text-xs font-extrabold text-white transition-all active:scale-95 shadow-lg shadow-[#FF3040]/30"
            >
              Sawa, Nimeelewa
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
