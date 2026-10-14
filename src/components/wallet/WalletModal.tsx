import React, { useState } from 'react';
import { X, Wallet, Smartphone, ShieldCheck, CheckCircle, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { formatTZS, translations } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { profile, language, topUpBalance } = useAuth();
  const t = translations[language];

  const [selectedProvider, setSelectedProvider] = useState<'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa'>('M-Pesa');
  const [phoneNumber, setPhoneNumber] = useState<string>('0754 123 456');
  const [amount, setAmount] = useState<number>(10000);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleTopUp = async () => {
    if (amount < 1000) {
      setErrorMsg(language === 'sw' ? 'Kiwango cha chini cha kuongeza ni TZS 1,000' : 'Minimum top-up is TZS 1,000');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const ok = await topUpBalance(amount, selectedProvider, phoneNumber);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      }
    } catch (e: any) {
      setErrorMsg('Hitilafu kwenye malipo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262E3E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16C784] to-[#10B981] flex items-center justify-center text-black font-bold shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mfuko wa Simu (Mobile Money)</h3>
              <p className="text-xs text-[#A7B0C0]">Weka salio la kuwazawadia waumbaji</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-[#10131B] to-[#1E2533] border border-[#262E3E] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#A7B0C0] uppercase font-bold tracking-wider">Salio Lako la Sasa</span>
            <div className="text-2xl font-mono font-extrabold text-[#16C784] mt-0.5">
              {formatTZS(profile?.balanceTZS || 0)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#16C784]/15 flex items-center justify-center text-[#16C784]">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#16C784]/20 border border-[#16C784] flex items-center justify-center text-[#16C784]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Salio Limeongezwa Kikamilifu!</h4>
            <p className="text-xs text-[#A7B0C0]">
              Umeweka <span className="text-[#16C784] font-bold">{formatTZS(amount)}</span> kupitia {selectedProvider}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Operator Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-2">
                Chagua Mtandao wa Simu:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'M-Pesa', color: 'border-red-500/50 text-red-400' },
                  { name: 'Tigo Pesa', color: 'border-blue-500/50 text-blue-400' },
                  { name: 'Airtel Money', color: 'border-red-600/50 text-red-500' },
                  { name: 'Halopesa', color: 'border-orange-500/50 text-orange-400' },
                ].map((op) => (
                  <button
                    key={op.name}
                    type="button"
                    onClick={() => setSelectedProvider(op.name as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedProvider === op.name 
                        ? 'border-[#16C784] bg-[#16C784]/10 text-white' 
                        : 'border-[#262E3E] bg-[#10131B] text-[#A7B0C0] hover:text-white'
                    }`}
                  >
                    {op.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                Namba ya Simu ya Malipo:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0754 XXX XXX"
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl pl-10 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16C784]"
                />
                <Smartphone className="w-4 h-4 text-[#A7B0C0] absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                Kiasi cha Kuweka (TZS):
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-mono font-bold transition-all ${
                      amount === q
                        ? 'border-[#16C784] bg-[#16C784]/15 text-[#16C784]'
                        : 'border-[#262E3E] bg-[#10131B] text-[#A7B0C0] hover:text-white'
                    }`}
                  >
                    {formatTZS(q)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                step={1000}
                className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16C784]"
              />
            </div>

            {/* Security Guarantee Notice */}
            <div className="p-3 rounded-xl bg-[#232A39]/60 border border-[#262E3E] flex items-center gap-2.5 text-[11px] text-[#A7B0C0]">
              <ShieldCheck className="w-4 h-4 text-[#16C784] shrink-0" />
              <span>Usalama umehakikishwa. Tazama haihifadhi PIN yako ya simu.</span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Submit Action */}
            <button
              type="button"
              onClick={handleTopUp}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16C784] to-[#10B981] text-black font-bold text-xs shadow-lg shadow-[#16C784]/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Inatuma ombi kwenye simu...' : `Weka ${formatTZS(amount)} Sasa`}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
