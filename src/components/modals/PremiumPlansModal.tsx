import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Tv, 
  Zap, 
  ShieldCheck, 
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { formatTZS, translations } from '../../lib/i18n';
import { PremiumPlan } from '../../types';

interface PremiumPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTarget?: 'viewer' | 'creator';
  onOpenWallet?: () => void;
}

export const PremiumPlansModal: React.FC<PremiumPlansModalProps> = ({
  isOpen,
  onClose,
  defaultTarget = 'viewer',
  onOpenWallet
}) => {
  const { profile, language, role } = useAuth();
  const { premiumPlans, subscribeToPremiumPlan } = useVideo();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'viewer' | 'creator'>(defaultTarget);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlans = premiumPlans.filter(p => p.target === activeTab && p.isActive);

  const handleSubscribe = async (plan: PremiumPlan) => {
    if (plan.priceTZS === 0) {
      setSuccessMessage(`Umejiunga na mpango wa kawaida wa ${plan.name}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    if ((profile?.balanceTZS || 0) < plan.priceTZS) {
      setErrorMessage(`Salio la mkoba wako (TZS ${(profile?.balanceTZS || 0).toLocaleString()}) halitoshi kulipia ${formatTZS(plan.priceTZS)}. Tafadhali weka fedha kupitia M-Pesa au Tigo Pesa.`);
      return;
    }

    setIsSubscribing(true);
    setErrorMessage(null);

    try {
      const ok = await subscribeToPremiumPlan(plan.id);
      if (ok) {
        setSuccessMessage(`Hongera! Umefanikiwa kujiunga na kifurushi cha ${plan.name}. Faida zako zimeamilishwa mara moja.`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 2500);
      } else {
        setErrorMessage('Imeshindikana kukamilisha malipo. Tafadhali jaribu tena.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Hitilafu imetokea');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-8 overflow-hidden my-6">
        
        {/* Background glow styling */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-[#FF3040]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#262E3E] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#FF3040] flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-400/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                Tazama Premium Plans
                <span className="text-[10px] bg-[#16C784]/20 text-[#16C784] border border-[#16C784]/30 px-2.5 py-0.5 rounded-full font-bold">
                  Live &amp; Verified
                </span>
              </h3>
              <p className="text-xs text-[#A7B0C0]">
                Furahia utazamaji bila matangazo au ongeza mapato ya kituo chako hadi 90% ya gawio.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#16C784]" />
            <span className="text-[#A7B0C0]">Salio Lako la Mkoba (Tazama Wallet):</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatTZS(profile?.balanceTZS || 0)}
            </span>
          </div>

          {onOpenWallet && (
            <button
              onClick={() => {
                onClose();
                onOpenWallet();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#16C784]/15 hover:bg-[#16C784]/25 text-[#16C784] font-bold text-xs flex items-center gap-1 transition-colors"
            >
              Weka Fedha (M-Pesa / Tigo Pesa)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Switcher (Viewer Plans vs Creator Plans) */}
        <div className="flex items-center justify-center mt-5">
          <div className="bg-[#10131B] p-1 rounded-2xl border border-[#262E3E] grid grid-cols-2 gap-1 w-full max-w-md">
            <button
              onClick={() => setActiveTab('viewer')}
              className={`px-2.5 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'viewer'
                  ? 'bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/30'
                  : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Watazamaji (VIP)</span>
            </button>

            <button
              onClick={() => setActiveTab('creator')}
              className={`px-2.5 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'creator'
                  ? 'bg-[#16C784] text-black shadow-md shadow-[#16C784]/30 font-extrabold'
                  : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Waumbaji (Pro)</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-[#16C784]/15 border border-[#16C784]/40 flex items-center gap-3 text-xs text-[#16C784] font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center gap-3 text-xs text-red-400 font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {currentPlans.map((plan) => {
            const isPopular = plan.popular;
            return (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl bg-[#10131B] border transition-all flex flex-col justify-between relative ${
                  isPopular 
                    ? 'border-amber-400 shadow-xl shadow-amber-400/10 ring-1 ring-amber-400/50' 
                    : 'border-[#262E3E] hover:border-[#384357]'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-[#FF3040] text-black font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Inapendekezwa Zaidi
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: plan.badgeColor }}
                    >
                      {plan.badgeLabel}
                    </span>
                    <span className="text-[10px] text-[#A7B0C0] font-mono">
                      {plan.subscribersCount.toLocaleString()} waliojiunga
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-white">{plan.name}</h4>
                    <p className="text-xs text-[#A7B0C0] mt-1 line-clamp-2">{plan.description}</p>
                  </div>

                  <div className="py-2 border-y border-[#262E3E]/70">
                    <div className="text-2xl font-black font-mono text-white">
                      {plan.priceTZS === 0 ? 'BURE' : formatTZS(plan.priceTZS)}
                      {plan.priceTZS > 0 && (
                        <span className="text-xs font-normal text-[#A7B0C0] font-sans">
                          /{plan.billingPeriod === 'year' ? 'kwa mwaka' : 'kwa mwezi'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">
                      Faida zilizomo:
                    </span>
                    {plan.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#A7B0C0]">
                        <Check className="w-4 h-4 text-[#16C784] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#262E3E]">
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isSubscribing}
                    className={`w-full py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-400 to-[#FF3040] hover:brightness-110 text-black shadow-lg shadow-amber-400/20'
                        : plan.priceTZS === 0
                        ? 'bg-[#191E29] hover:bg-[#232A39] text-[#A7B0C0] hover:text-white border border-[#262E3E]'
                        : 'bg-[#16C784] hover:bg-[#16C784]/90 text-black shadow-md shadow-[#16C784]/20'
                    }`}
                  >
                    {plan.priceTZS === 0 ? 'Mpango wa Sasa (Bure)' : `Jiunge Sasa (${formatTZS(plan.priceTZS)})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-[#262E3E] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#A7B0C0]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16C784]" />
            <span>Malipo salama kwa M-Pesa, Tigo Pesa, Airtel Money na Kadi za Benki za Tanzania.</span>
          </div>
          <span className="italic">Unaweza kusitisha uanachama wako wakati wowote.</span>
        </div>

      </div>
    </div>
  );
};
