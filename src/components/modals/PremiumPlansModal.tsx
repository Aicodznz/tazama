import React, { useState, useEffect } from 'react';
import {
  X,
  Crown,
  Check,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Tv,
  ShieldCheck,
  Wallet,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { formatTZS } from '../../lib/i18n';
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
  onOpenWallet,
}) => {
  const { profile, language } = useAuth();
  const { premiumPlans, subscribeToPremiumPlan } = useVideo();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'viewer' | 'creator'>(defaultTarget);
  const [selectedMobilePlanId, setSelectedMobilePlanId] = useState<string>('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentPlans = premiumPlans.filter((p) => p.target === activeTab && p.isActive);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTarget);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, defaultTarget]);

  useEffect(() => {
    const preferred =
      currentPlans.find((p) => p.popular) ||
      currentPlans[1] ||
      currentPlans[0];
    if (preferred) {
      setSelectedMobilePlanId(preferred.id);
    } else {
      setSelectedMobilePlanId('');
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPlanActiveForUser = (plan: PremiumPlan): boolean => {
    if (!profile) return false;
    if (plan.target === 'viewer') {
      if (profile.premiumPlanId) return profile.premiumPlanId === plan.id;
      return plan.priceTZS === 0;
    }
    if (profile.creatorPlanId) return profile.creatorPlanId === plan.id;
    return plan.priceTZS === 0;
  };

  const handleSubscribe = async (plan: PremiumPlan) => {
    if (!profile) {
      onClose();
      window.dispatchEvent(
        new CustomEvent('tazama_show_auth_modal', {
          detail: {
            action: isEn
              ? `activate ${plan.name}`
              : `kujiunga na kifurushi cha ${plan.name}`,
          },
        })
      );
      return;
    }

    if (isPlanActiveForUser(plan)) {
      return;
    }

    if (plan.priceTZS === 0) {
      setIsSubscribing(true);
      setErrorMessage(null);
      const ok = await subscribeToPremiumPlan(plan.id);
      setIsSubscribing(false);
      if (ok) {
        setSuccessMessage(
          isEn
            ? `Switched to ${plan.name}.`
            : `Umerudi kwenye mpango wa ${plan.name}.`
        );
        setTimeout(() => setSuccessMessage(null), 2600);
      }
      return;
    }

    if ((profile.balanceTZS || 0) < plan.priceTZS) {
      setErrorMessage(
        isEn
          ? `Wallet balance (${formatTZS(profile.balanceTZS || 0)}) is lower than ${formatTZS(plan.priceTZS)}. Top up via M-Pesa or Tigo Pesa first.`
          : `Salio la mkoba wako (${formatTZS(profile.balanceTZS || 0)}) halitoshi kulipia ${formatTZS(plan.priceTZS)}. Tafadhali weka fedha kupitia M-Pesa au Tigo Pesa kwanza.`
      );
      return;
    }

    setIsSubscribing(true);
    setErrorMessage(null);

    try {
      const ok = await subscribeToPremiumPlan(plan.id);
      if (ok) {
        setSuccessMessage(
          isEn
            ? `Subscribed to ${plan.name}. All benefits are now active.`
            : `Hongera! Umefanikiwa kujiunga na ${plan.name}. Faida zako zimewashwa.`
        );
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 2200);
      } else {
        setErrorMessage(
          isEn
            ? 'Payment could not be completed. Please try again.'
            : 'Imeshindikana kukamilisha malipo. Tafadhali jaribu tena.'
        );
      }
    } catch (e: any) {
      setErrorMessage(e?.message || (isEn ? 'An error occurred.' : 'Hitilafu imetokea.'));
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatBillingUnit = (plan: PremiumPlan) => {
    if (plan.priceTZS === 0) return '';
    if (isEn) {
      return plan.billingPeriod === 'year' ? '/ year' : '/ month';
    }
    return plan.billingPeriod === 'year' ? '/ kwa mwaka' : '/ kwa mwezi';
  };

  const activeMobilePlan =
    currentPlans.find((p) => p.id === selectedMobilePlanId) ||
    currentPlans.find((p) => p.popular) ||
    currentPlans[0];

  const renderPlanCard = (plan: PremiumPlan, compactMobile = false) => {
    const isPopular = Boolean(plan.popular);
    const isCurrentPlan = isPlanActiveForUser(plan);

    return (
      <div
        key={plan.id}
        className={`rounded-2xl bg-slate-50 dark:bg-[#10131B] border transition-colors flex flex-col justify-between ${
          compactMobile ? 'p-4' : 'p-5 lg:p-6'
        } ${
          isPopular
            ? 'border-amber-400/90 dark:border-amber-400/80 ring-1 ring-amber-400/35 shadow-lg shadow-amber-500/5'
            : 'border-slate-200 dark:border-[#262E3E]'
        }`}
      >
        <div className="space-y-3.5">
          {/* Unboxed clean kicker line + optional subscriber count */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 font-bold uppercase tracking-wider">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: plan.badgeColor || '#FF3040' }}
              />
              <span
                className={`truncate ${
                  isPopular
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-slate-600 dark:text-[#A7B0C0]'
                }`}
              >
                {isPopular
                  ? isEn
                    ? `${plan.badgeLabel} · Recommended`
                    : `${plan.badgeLabel} · Inapendekezwa`
                  : plan.badgeLabel}
              </span>
            </div>

            {plan.subscribersCount > 0 && (
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums shrink-0">
                {plan.subscribersCount.toLocaleString()} {isEn ? 'joined' : 'wanachama'}
              </span>
            )}
          </div>

          {/* Plan Title & Full Description */}
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
              {plan.name}
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
              {plan.description}
            </p>
          </div>

          {/* Price Block */}
          <div className="py-3 border-y border-slate-200 dark:border-[#262E3E]">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {plan.priceTZS === 0 ? (isEn ? 'FREE' : 'BURE') : formatTZS(plan.priceTZS)}
              </span>
              {plan.priceTZS > 0 && (
                <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
                  {formatBillingUnit(plan)}
                </span>
              )}
            </div>
          </div>

          {/* Perks */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
              {isEn ? 'Included Benefits' : 'Faida Zilizomo'}
            </p>
            <ul className="space-y-2">
              {plan.perks.map((perk, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-[#CBD5E1] leading-snug"
                >
                  <Check className="w-4 h-4 text-emerald-600 dark:text-[#16C784] shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 mt-5 border-t border-slate-200 dark:border-[#262E3E]">
          <button
            type="button"
            onClick={() => handleSubscribe(plan)}
            disabled={isSubscribing || isCurrentPlan}
            className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              isCurrentPlan
                ? 'bg-emerald-50 dark:bg-[#16C784]/15 text-emerald-700 dark:text-[#16C784] border border-emerald-200 dark:border-[#16C784]/30 cursor-default'
                : isPopular
                  ? 'bg-gradient-to-r from-amber-400 to-[#FF3040] hover:brightness-105 active:scale-[0.98] text-black shadow-md shadow-amber-500/15'
                  : plan.priceTZS === 0
                    ? 'bg-white dark:bg-[#191E29] hover:bg-slate-100 dark:hover:bg-[#232A39] text-slate-800 dark:text-white border border-slate-200 dark:border-[#2E384D]'
                    : 'bg-[#16C784] hover:bg-[#14b679] active:scale-[0.98] text-black shadow-md shadow-[#16C784]/15'
            }`}
          >
            {!profile && plan.priceTZS > 0 ? (
              <>
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isEn
                    ? `Sign in to Join (${formatTZS(plan.priceTZS)})`
                    : `Ingia Kujiunga (${formatTZS(plan.priceTZS)})`}
                </span>
              </>
            ) : isCurrentPlan ? (
              <>
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{isEn ? 'Current Active Plan' : 'Mpango Wako wa Sasa'}</span>
              </>
            ) : plan.priceTZS === 0 ? (
              <span>{isEn ? 'Select Free Plan' : 'Chagua Mpango wa Bure'}</span>
            ) : (
              <span>
                {isEn
                  ? `Subscribe (${formatTZS(plan.priceTZS)})`
                  : `Jiunge Sasa (${formatTZS(plan.priceTZS)})`}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tazama-premium-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/65 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-5xl max-h-[92dvh] sm:max-h-[90vh] bg-white dark:bg-[#141824] border-t sm:border border-slate-200 dark:border-[#262E3E] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Mobile bottom-sheet drag indicator */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mt-2.5 shrink-0" />

        {/* 1. Pinned Top Header (Never clips above viewport) */}
        <div className="px-4 sm:px-7 py-3.5 sm:py-4 border-b border-slate-200 dark:border-[#262E3E] flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-[#141824]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-[#FF3040] flex items-center justify-center text-black shadow-md shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3
                id="tazama-premium-title"
                className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate"
              >
                {isEn ? 'Tazama Premium Plans' : 'Vifurushi vya Tazama Premium'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#94A3B8] truncate">
                {isEn
                  ? 'Ad-free 4K streaming or unlock up to 90% creator revenue share.'
                  : 'Tazama bila matangazo au ongeza mapato ya kituo chako.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-full text-slate-500 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#232A39] transition-colors shrink-0 cursor-pointer"
            aria-label={isEn ? 'Close' : 'Funga'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Pinned Audience Switcher + Wallet Strip */}
        <div className="px-4 sm:px-7 py-3 border-b border-slate-200 dark:border-[#262E3E] bg-slate-50/80 dark:bg-[#10131B]/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
          {/* Audience Switcher */}
          <div className="bg-slate-200/80 dark:bg-[#191E29] p-1 rounded-xl border border-slate-200 dark:border-[#262E3E] grid grid-cols-2 sm:inline-flex gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('viewer')}
              className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'viewer'
                  ? 'bg-[#FF3040] text-white shadow-sm'
                  : 'text-slate-700 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5 shrink-0" />
              <span>{isEn ? 'Viewers (VIP)' : 'Watazamaji (VIP)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('creator')}
              className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'creator'
                  ? 'bg-[#16C784] text-black shadow-sm font-extrabold'
                  : 'text-slate-700 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{isEn ? 'Creators (Pro)' : 'Waumbaji (Pro)'}</span>
            </button>
          </div>

          {/* Wallet Balance & Top-up CTA */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#16C784] shrink-0" />
              <span className="text-slate-600 dark:text-[#94A3B8] truncate">
                {isEn ? 'Wallet:' : 'Salio:'}
              </span>
              <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                {formatTZS(profile?.balanceTZS || 0)}
              </span>
            </div>

            {onOpenWallet && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWallet();
                }}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-[#16C784]/15 dark:hover:bg-[#16C784]/25 text-emerald-700 dark:text-[#16C784] border border-emerald-200 dark:border-[#16C784]/30 font-bold text-xs flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                <span>{isEn ? 'Top Up' : 'Weka Fedha'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Internally Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-7 py-4 sm:py-6 space-y-4">
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-[#16C784]/15 border border-emerald-200 dark:border-[#16C784]/40 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-[#16C784] font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/40 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MOBILE VIEW (< md): Tier Selector Strip + Focused Selected Card + Quick Compare Cards */}
          <div className="md:hidden space-y-3.5">
            {currentPlans.length > 1 && (
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-[#10131B] p-1 rounded-2xl border border-slate-200 dark:border-[#262E3E]">
                {currentPlans.map((plan) => {
                  const selected = activeMobilePlan?.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedMobilePlanId(plan.id)}
                      className={`min-h-[44px] px-2 py-1.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        selected
                          ? 'bg-white dark:bg-[#1F2533] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-[#323C52]'
                          : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] font-extrabold truncate max-w-full">
                        {plan.badgeLabel}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums font-bold text-[#FF3040] dark:text-amber-400">
                        {plan.priceTZS === 0
                          ? isEn
                            ? 'FREE'
                            : 'BURE'
                          : `TZS ${plan.priceTZS.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeMobilePlan && renderPlanCard(activeMobilePlan, true)}

            {/* Quick overview links for other tiers on mobile */}
            {currentPlans.length > 1 && (
              <div className="pt-1 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] px-1">
                  {isEn ? 'Compare other tiers' : 'Linganisha vifurushi vingine'}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {currentPlans
                    .filter((p) => p.id !== activeMobilePlan?.id)
                    .map((other) => (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() => setSelectedMobilePlanId(other.id)}
                        className="w-full min-h-[52px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] flex items-center justify-between gap-3 text-left cursor-pointer hover:border-[#FF3040]/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: other.badgeColor }}
                            />
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {other.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                            {other.perks[0]}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-extrabold tabular-nums text-slate-900 dark:text-white shrink-0">
                          {other.priceTZS === 0 ? (isEn ? 'FREE' : 'BURE') : formatTZS(other.priceTZS)}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* WEB / TABLET VIEW (>= md): Full 3-Column Equal-Height Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
            {currentPlans.map((plan) => renderPlanCard(plan, false))}
          </div>

          {/* Footer Guarantee */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#262E3E] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-600 dark:text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#16C784] shrink-0" />
              <span>
                {isEn
                  ? 'Secure payments via M-Pesa, Tigo Pesa, Airtel Money & Tanzanian bank cards.'
                  : 'Malipo salama kwa M-Pesa, Tigo Pesa, Airtel Money na Kadi za Benki za Tanzania.'}
              </span>
            </div>
            <span className="text-slate-500 dark:text-[#94A3B8] shrink-0">
              {isEn ? 'Cancel anytime.' : 'Sitisha wakati wowote.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
