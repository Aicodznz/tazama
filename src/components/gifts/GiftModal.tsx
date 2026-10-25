import React, { useState } from 'react';
import { X, Gift, Sparkles, CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { VIRTUAL_GIFTS } from '../../data/mockData';
import { formatTZS, translations } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { VirtualGift } from '../../types';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  channelId: string;
  channelName: string;
  onOpenWallet: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  isOpen,
  onClose,
  videoId,
  channelId,
  channelName,
  onOpenWallet
}) => {
  const { profile, language } = useAuth();
  const { sendGiftToCreator } = useVideo();
  const t = translations[language];

  const [selectedGift, setSelectedGift] = useState<VirtualGift>(VIRTUAL_GIFTS[0]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBalance = profile?.balanceTZS || 0;
  const hasEnoughFunds = currentBalance >= selectedGift.priceTZS;

  const handleSend = async () => {
    if (!hasEnoughFunds) {
      setErrorMsg(language === 'sw' ? 'Salio halitoshi. Tafadhali ongeza salio kwenye pochi yako.' : 'Insufficient balance. Please top up your wallet.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    try {
      const ok = await sendGiftToCreator(videoId, channelId, selectedGift.id, customMessage);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2500);
      } else {
        setErrorMsg('Hitilafu imetokea wakati wa kutuma zawadi.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error sending gift');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-6 overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262E3E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16C784] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-[#16C784]/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.giftTitle}</h3>
              <p className="text-xs text-[#A7B0C0]">Kwenda kwa <span className="text-white font-semibold">{channelName}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#16C784]/20 border border-[#16C784] flex items-center justify-center text-[#16C784] animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">{t.giftSuccess}</h4>
            <p className="text-xs text-[#A7B0C0]">
              Umetuma <span className="text-[#16C784] font-bold">{selectedGift.name[language]}</span> ({formatTZS(selectedGift.priceTZS)}) kwa {channelName}!
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* User Wallet Balance Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#10131B] border border-[#262E3E]">
              <div className="flex items-center gap-2 text-xs text-[#A7B0C0]">
                <Wallet className="w-4 h-4 text-[#16C784]" />
                <span>{t.balance}:</span>
                <span className="text-white font-bold font-mono">{formatTZS(currentBalance)}</span>
              </div>
              <button
                onClick={() => { onClose(); onOpenWallet(); }}
                className="text-xs font-semibold text-[#16C784] hover:underline"
              >
                + {language === 'sw' ? 'Ongeza Salio' : 'Top Up'}
              </button>
            </div>

            {/* Gift Grid */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-2">
                Chagua Zawadi ya Kipekee ya Tanzania:
              </label>
              <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {VIRTUAL_GIFTS.map((g) => {
                  const isSelected = selectedGift.id === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGift(g)}
                      className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                        isSelected 
                          ? 'border-[#16C784] bg-[#16C784]/10 shadow-lg shadow-[#16C784]/15' 
                          : 'border-[#262E3E] bg-[#10131B] hover:border-[#A7B0C0]/50'
                      }`}
                    >
                      <span className="text-3xl mb-1">{g.icon}</span>
                      <span className="text-[11px] font-bold text-white line-clamp-1">{g.name[language]}</span>
                      <span className="text-[11px] font-mono text-[#16C784] font-semibold mt-0.5">
                        {formatTZS(g.priceTZS)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Gift Description */}
            <div className="p-3 rounded-xl bg-[#232A39]/60 border border-[#262E3E] text-xs">
              <span className="text-white font-semibold">{selectedGift.name[language]}: </span>
              <span className="text-[#A7B0C0]">{selectedGift.description[language]}</span>
            </div>

            {/* Custom Encouragement Message */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                Ujumbe Maalum (Hiari):
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Mfano: Kazi nzuri sana! Endelea kutuwakilisha 🇹🇿"
                maxLength={150}
                className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#16C784]"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#16C784] to-[#10B981] text-black font-bold text-xs shadow-lg shadow-[#16C784]/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
              >
                {isSending ? 'Inatuma...' : `${t.sendGiftButton} (${formatTZS(selectedGift.priceTZS)})`}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
