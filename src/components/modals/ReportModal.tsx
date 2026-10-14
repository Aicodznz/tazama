import React, { useState } from 'react';
import { X, Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../lib/i18n';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'video' | 'comment' | 'channel';
  targetId: string;
  targetTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle
}) => {
  const { submitReport } = useVideo();
  const { language } = useAuth();
  const t = translations[language];

  const reasons = [
    'Ukiukaji wa Hakimiliki (COSOTA Copyright claim)',
    'Maudhui yasiyofaa au ukiukaji wa maadili',
    'Chuki, kashfa au unyanyasaji mtandaoni',
    'Udanganyifu, utapeli au taarifa za uongo (Spam)',
    'Maudhui hatarishi au ya vurugu'
  ];

  const [selectedReason, setSelectedReason] = useState<string>(reasons[0]);
  const [details, setDetails] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(targetType, targetId, targetTitle, selectedReason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-white">Ripoti Maudhui</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#A7B0C0] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-[#16C784] mx-auto" />
            <h4 className="text-sm font-bold text-white">Ripoti Yako Imepokelewa</h4>
            <p className="text-xs text-[#A7B0C0]">Timu yetu ya usimamizi wa maudhui itaipitia ripoti hii ndani ya saa 24.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="text-xs text-[#A7B0C0] bg-[#10131B] p-2.5 rounded-xl border border-[#262E3E]">
              Kipengee kinachoripotiwa: <span className="text-white font-semibold">{targetTitle}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                Sababu ya Kuripoti:
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF3040]"
              >
                {reasons.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                Maelezo ya Ziada (Hiari):
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tafadhali toa muktadha au muda kamili wa video ambapo tatizo linatokea..."
                className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#FF3040]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Tuma Ripoti
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
