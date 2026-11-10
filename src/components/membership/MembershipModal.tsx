import React, { useState } from 'react';
import { X, Award, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { MEMBERSHIP_TIERS } from '../../data/mockData';
import { formatTZS, translations } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { MembershipTier } from '../../types';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  channelId,
  channelName
}) => {
  const { profile, language } = useAuth();
  const { joinMembership, memberships } = useVideo();
  const t = translations[language];

  const [selectedTier, setSelectedTier] = useState<MembershipTier>(MEMBERSHIP_TIERS[1]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAlreadyMember = memberships.some(m => m.channelId === channelId && m.status === 'active');

  const handleJoin = async () => {
    if ((profile?.balanceTZS || 0) < selectedTier.priceTZS) {
      setErrorMsg(language === 'sw' ? 'Salio la akaunti halitoshi kwa ada ya uanachama huu.' : 'Insufficient balance for this membership tier.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const ok = await joinMembership(channelId, selectedTier.id, selectedTier.name, selectedTier.priceTZS);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      } else {
        setErrorMsg('Imeshindikana kujiunga na uanachama.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error joining tier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#262E3E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.membershipTitle}</h3>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">{t.membershipSubtitle} <span className="text-slate-900 dark:text-white font-semibold">{channelName}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-500 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#232A39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success confirmation */}
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 dark:bg-[#16C784]/20 border border-[#16C784] flex items-center justify-center text-emerald-600 dark:text-[#16C784]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Karibu Kwenye Uanachama Rasmi!</h4>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
              Sasa unafurahia ngazi ya <span className="text-emerald-700 dark:text-[#16C784] font-semibold">{selectedTier.name}</span> kwa {channelName}.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* Tier Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MEMBERSHIP_TIERS.map((tier) => {
                const isSelected = selectedTier.id === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'border-[#FF3040] bg-[#FF3040]/5 dark:bg-[#FF3040]/10 shadow-lg shadow-[#FF3040]/10' 
                        : 'border-slate-200 dark:border-[#262E3E] bg-slate-50 dark:bg-[#10131B] hover:border-slate-300 dark:hover:border-[#A7B0C0]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tier.badgeColor }}
                      />
                      <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-medium">{t.monthlyBilling}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 line-clamp-1">{tier.name}</h4>
                    <span className="text-sm font-mono font-bold text-emerald-700 dark:text-[#16C784] mt-1">
                      {formatTZS(tier.priceTZS)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Tier Perks List */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-2.5">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                <span>{t.perksIncluded}</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-[#A7B0C0]">
                {selectedTier.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784] shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#262E3E] text-xs font-semibold text-slate-700 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleJoin}
                disabled={isLoading || isAlreadyMember}
                className="flex-1 py-2.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white font-bold text-xs shadow-lg shadow-[#FF3040]/30 transition-all disabled:opacity-50"
              >
                {isLoading 
                  ? 'Inasajili...' 
                  : isAlreadyMember 
                  ? 'Tayari Wewe ni Mwanachama' 
                  : `${t.joinTier} (${formatTZS(selectedTier.priceTZS)})`
                }
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
