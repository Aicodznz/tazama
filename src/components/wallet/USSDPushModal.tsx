import React, { useState } from 'react';
import { Smartphone, CheckCircle2, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';

export const USSDPushModal: React.FC = () => {
  const { stkPushRequest, cancelSTKPush, confirmSTKPush } = useVideo();
  const { topUpBalance } = useAuth();

  const [pin, setPin] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!stkPushRequest) return null;

  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case 'M-Pesa':
        return {
          bgColor: 'bg-[#E60000]',
          textColor: 'text-white',
          name: 'Vodacom M-Pesa'
        };
      case 'Tigo Pesa':
        return {
          bgColor: 'bg-[#00377B]',
          textColor: 'text-white',
          name: 'Tigo Pesa'
        };
      case 'Airtel Money':
        return {
          bgColor: 'bg-[#FF0000]',
          textColor: 'text-white',
          name: 'Airtel Money'
        };
      case 'Halopesa':
        return {
          bgColor: 'bg-[#FF6600]',
          textColor: 'text-white',
          name: 'Halopesa'
        };
      default:
        return {
          bgColor: 'bg-emerald-600',
          textColor: 'text-white',
          name: provider
        };
    }
  };

  const config = getProviderConfig(stkPushRequest.provider);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Tafadhali ingiza tarakimu 4 za PIN');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const ok = await confirmSTKPush(pin);
      if (ok) {
        // Add to wallet balance via simulated topUpBalance
        await topUpBalance(stkPushRequest.amountTZS, stkPushRequest.provider, stkPushRequest.phoneNumber);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPin('');
          cancelSTKPush();
        }, 1800);
      } else {
        setError('PIN siyo sahihi au ombi limekataliwa');
      }
    } catch (err) {
      setError('Kulitokea hitilafu ya mtandao');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Telco USSD Header */}
        <div className={`${config.bgColor} ${config.textColor} p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            <span className="font-extrabold text-sm tracking-wide">{config.name} STK Push</span>
          </div>
          <button 
            onClick={cancelSTKPush}
            disabled={isProcessing}
            className="p-1 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#16C784]/20 border border-[#16C784] text-[#16C784] flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Malipo Yamekamilika!</h3>
              <p className="text-xs text-[#A7B0C0]">
                Umelipa TZS {stkPushRequest.amountTZS.toLocaleString()} kwa Tazama Platform. Salio lako limeongezwa papo hapo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="bg-[#10131B] p-3.5 rounded-2xl border border-[#262E3E] space-y-1.5 text-center">
                <span className="text-[11px] text-[#A7B0C0] uppercase font-bold tracking-wider">
                  Ombi la Kutoa / Kuweka Pesa
                </span>
                <div className="text-2xl font-black text-[#16C784] font-mono">
                  TZS {stkPushRequest.amountTZS.toLocaleString()}
                </div>
                <p className="text-xs text-white/80">
                  Namba: <span className="font-mono text-white font-semibold">{stkPushRequest.phoneNumber}</span>
                </p>
                <p className="text-[11px] text-[#A7B0C0]">
                  Mlipi: <span className="text-white">Tazama Media Ltd (Kumb: {stkPushRequest.reference})</span>
                </p>
              </div>

              {/* PIN Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90 text-center">
                  Ingiza PIN yako ya {stkPushRequest.provider} kuthibitisha:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-[#10131B] border border-[#262E3E] focus:border-[#FF3040] focus:ring-1 focus:ring-[#FF3040] rounded-2xl py-3 text-center text-2xl tracking-[0.5em] text-white font-mono placeholder-white/20 focus:outline-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A7B0C0]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16C784]" />
                <span>Ulinzi wa Benki Kuu ya Tanzania (BOT) &amp; TCRA</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelSTKPush}
                  disabled={isProcessing}
                  className="py-2.5 px-4 rounded-xl border border-[#262E3E] text-xs font-bold text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || pin.length < 4}
                  className="py-2.5 px-4 rounded-xl bg-[#16C784] hover:bg-[#13af74] disabled:opacity-40 text-black text-xs font-black shadow-lg shadow-[#16C784]/20 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Thibitisha</span>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
