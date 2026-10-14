import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  Clock, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  Award, 
  Tv, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Filter,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVideo } from '../context/VideoContext';
import { formatTZS, formatViews, translations } from '../lib/i18n';
import { PayoutRequest } from '../types';

interface CreatorStudioPageProps {
  onOpenUpload: () => void;
  onOpenPremium?: () => void;
}

export const CreatorStudioPage: React.FC<CreatorStudioPageProps> = ({ 
  onOpenUpload,
  onOpenPremium 
}) => {
  const { profile, language } = useAuth();
  const { videos, payoutRequests, requestPayout } = useVideo();
  const t = translations[language];

  const [dateRange, setDateRange] = useState<string>('28d');
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(500000);
  const [payoutProvider, setPayoutProvider] = useState<PayoutRequest['provider']>('M-Pesa');
  const [accountNumber, setAccountNumber] = useState<string>('0754 987 654');
  const [accountName, setAccountName] = useState<string>('Naseeb Abdul (Tazama)');
  const [payoutSuccess, setPayoutSuccess] = useState<boolean>(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Financial aggregation in TZS (strictly integer representation)
  const totalViews = videos.reduce((sum, v) => sum + v.viewsCount, 0);
  const estimatedWatchHours = Math.round((totalViews * 4.2) / 60);
  const finalizedEarningsTZS = 18450000;
  const availablePayoutTZS = 4250000;
  const adRevenueTZS = 11200000;
  const giftRevenueTZS = 4150000;
  const membershipRevenueTZS = 3100000;

  const handleRequestPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount > availablePayoutTZS) {
      setPayoutError('Kiasi unachoomba kinazidi salio lililopo tayari kutolewa.');
      return;
    }
    if (payoutAmount < 10000) {
      setPayoutError('Kiwango cha chini cha kutoa ni TZS 10,000.');
      return;
    }

    setPayoutError(null);
    const ok = requestPayout(payoutAmount, payoutProvider, accountNumber, accountName);
    if (ok) {
      setPayoutSuccess(true);
      setTimeout(() => {
        setPayoutSuccess(false);
        setShowPayoutModal(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Studio Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#191E29] to-[#232A39] border border-[#262E3E]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-orange-500 flex items-center justify-center text-white shadow-xl shadow-[#FF3040]/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Studio ya Waumbaji (Creator Studio)</h1>
            <p className="text-xs text-[#A7B0C0]">Uchumi wa Waumbaji Tanzania: Takwimu, Maudhui na Mapato ya TZS</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="7d">Siku 7 zilizopita</option>
            <option value="28d">Siku 28 zilizopita</option>
            <option value="90d">Siku 90 zilizopita</option>
            <option value="365d">Mwaka mzima</option>
          </select>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 bg-[#FF3040] hover:bg-[#E02635] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#FF3040]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Pakia Video Mpya</span>
          </button>
        </div>
      </div>

      {/* Creator Tier & Commission Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#191E29] to-[#10131B] border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 text-xs shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black shadow-md shadow-amber-400/20 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">Mpango wa Sasa: Creator Pro (Gawio la 85%)</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#16C784]/20 text-[#16C784] font-bold border border-[#16C784]/30">
                Inatumika
              </span>
            </div>
            <p className="text-xs text-[#A7B0C0] mt-0.5">
              Unanufaika na gawio la juu la 85%, hifadhi ya GB 250 Cloudflare Stream &amp; Cloudinary, na huduma ya kipaumbele ya usimamizi.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenPremium && onOpenPremium()}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-[#FF3040] hover:brightness-110 text-black font-extrabold text-xs shadow-md shadow-amber-400/20 flex items-center gap-1.5 transition-all"
        >
          <Crown className="w-4 h-4" />
          Boresha / Badili Mpango (Upgrade Tier)
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E]">
          <div className="flex items-center justify-between text-[#A7B0C0] text-xs font-semibold">
            <span>{t.totalViews}</span>
            <Eye className="w-4 h-4 text-[#FF3040]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-2">
            {formatViews(totalViews, language)}
          </div>
          <span className="text-[10px] text-[#16C784] font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% kipindi hiki
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E]">
          <div className="flex items-center justify-between text-[#A7B0C0] text-xs font-semibold">
            <span>{t.watchTimeHours}</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-2">
            {estimatedWatchHours.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#16C784] font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +12.1% kipindi hiki
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E]">
          <div className="flex items-center justify-between text-[#A7B0C0] text-xs font-semibold">
            <span>{t.subscribers}</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-2">
            1.4M
          </div>
          <span className="text-[10px] text-[#16C784] font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +2,410 wapya
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E]">
          <div className="flex items-center justify-between text-[#A7B0C0] text-xs font-semibold">
            <span>{t.confirmedRevenue}</span>
            <DollarSign className="w-4 h-4 text-[#16C784]" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#16C784] font-mono mt-2">
            {formatTZS(finalizedEarningsTZS)}
          </div>
          <span className="text-[10px] text-[#16C784] font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Imethibitishwa
          </span>
        </div>
      </div>

      {/* Financial Breakdown & Payout Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Revenue Sources */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#16C784]" />
              <span>Mgawanyo wa Vyanzo vya Mapato (TZS)</span>
            </h3>
            <span className="text-[11px] text-[#A7B0C0]">Hesabu halisi zisizo na makadirio bandia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#10131B] border border-[#262E3E]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A7B0C0]">
                <Tv className="w-4 h-4 text-blue-400" />
                <span>Matangazo (Ads)</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {formatTZS(adRevenueTZS)}
              </div>
              <p className="text-[10px] text-[#A7B0C0] mt-0.5">Pre-roll & Display Impressions</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#10131B] border border-[#262E3E]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A7B0C0]">
                <Gift className="w-4 h-4 text-[#16C784]" />
                <span>Zawadi (Gifts)</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {formatTZS(giftRevenueTZS)}
              </div>
              <p className="text-[10px] text-[#A7B0C0] mt-0.5">Simba, Kahawa, Tanzanite</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#10131B] border border-[#262E3E]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A7B0C0]">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Uanachama (VIP)</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {formatTZS(membershipRevenueTZS)}
              </div>
              <p className="text-[10px] text-[#A7B0C0] mt-0.5">Ngazi za Shaba, Fedha, Dhahabu</p>
            </div>
          </div>

          {/* Revenue Allocation Transparency Notice */}
          <div className="p-3.5 rounded-2xl bg-[#232A39]/60 border border-[#262E3E] text-xs text-[#A7B0C0] flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Mgawo wa Jukwaa la Tazama: </span>
              <span>70% inakwenda moja kwa moja kwa Muundaji, 30% inagharamia uendeshaji na seva za video.</span>
            </div>
          </div>
        </div>

        {/* Right Col: Available Payout & Cash Out */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#191E29] to-[#1F2736] border border-[#262E3E] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A7B0C0] uppercase tracking-wider">{t.availablePayout}</span>
              <Wallet className="w-5 h-5 text-[#16C784]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#16C784] font-mono mt-2">
              {formatTZS(availablePayoutTZS)}
            </div>
            <p className="text-[11px] text-[#A7B0C0] mt-1">
              Imethibitishwa na iko tayari kuhamishiwa kwenye akaunti yako ya M-Pesa au benki.
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => setShowPayoutModal(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#16C784] to-[#10B981] text-black font-extrabold text-xs shadow-xl shadow-[#16C784]/25 hover:opacity-95 active:scale-98 transition-all"
            >
              {t.requestPayout}
            </button>
            <p className="text-[10px] text-center text-[#A7B0C0]">
              Malipo yanakamilika ndani ya saa 2 kupitia mifumo ya simu.
            </p>
          </div>
        </div>

      </div>

      {/* Videos Performance Management Table */}
      <div className="p-5 rounded-3xl bg-[#191E29] border border-[#262E3E]">
        <div className="flex items-center justify-between pb-3 border-b border-[#262E3E] mb-3">
          <h3 className="text-sm font-bold text-white">Maudhui Yaliyopakiwa na Hali ya Uchakataji</h3>
          <span className="text-xs text-[#A7B0C0]">{videos.length} video</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                <th className="pb-2.5 font-semibold">Video</th>
                <th className="pb-2.5 font-semibold">Ufikiaji</th>
                <th className="pb-2.5 font-semibold">Hali (Cloudflare Stream)</th>
                <th className="pb-2.5 font-semibold">Matazamio</th>
                <th className="pb-2.5 font-semibold">Likes</th>
                <th className="pb-2.5 font-semibold">Tarehe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262E3E]/60 text-[#A7B0C0]">
              {videos.map((vid) => (
                <tr key={vid.id} className="hover:bg-[#232A39]/50 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5 max-w-sm">
                      <img 
                        src={vid.thumbnailUrl} 
                        alt={vid.title} 
                        className="w-16 h-10 object-cover rounded-lg shrink-0 border border-[#262E3E]" 
                      />
                      <span className="font-semibold text-white line-clamp-1">{vid.title}</span>
                    </div>
                  </td>
                  <td className="py-3 capitalize text-white">{vid.visibility}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16C784]/15 text-[#16C784] border border-[#16C784]/30">
                      Tayari (Ready)
                    </span>
                  </td>
                  <td className="py-3 font-mono text-white">{formatViews(vid.viewsCount, language)}</td>
                  <td className="py-3 font-mono text-white">{vid.likesCount.toLocaleString()}</td>
                  <td className="py-3">{new Date(vid.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="p-5 rounded-3xl bg-[#191E29] border border-[#262E3E]">
        <div className="flex items-center justify-between pb-3 border-b border-[#262E3E] mb-3">
          <h3 className="text-sm font-bold text-white">{t.payoutHistory}</h3>
          <span className="text-xs text-[#A7B0C0]">Rekodi za malipo ya simu na benki</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                <th className="pb-2.5 font-semibold">Kitambulisho</th>
                <th className="pb-2.5 font-semibold">Njia ya Malipo</th>
                <th className="pb-2.5 font-semibold">Akaunti</th>
                <th className="pb-2.5 font-semibold">Kiasi (TZS)</th>
                <th className="pb-2.5 font-semibold">Hali</th>
                <th className="pb-2.5 font-semibold">Tarehe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262E3E]/60 text-[#A7B0C0]">
              {payoutRequests.map((req) => (
                <tr key={req.id}>
                  <td className="py-2.5 font-mono text-white">{req.id}</td>
                  <td className="py-2.5 font-semibold text-white">{req.provider}</td>
                  <td className="py-2.5 font-mono">{req.accountNumber}</td>
                  <td className="py-2.5 font-mono font-bold text-[#16C784]">{formatTZS(req.amountTZS)}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'approved' 
                        ? 'bg-[#16C784]/15 text-[#16C784]' 
                        : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {req.status === 'approved' ? 'Imelipwa (Paid)' : 'Inasubiri (Pending)'}
                    </span>
                  </td>
                  <td className="py-2.5">{new Date(req.requestedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-6">
            <h3 className="text-base font-bold text-white mb-1">{t.requestPayout}</h3>
            <p className="text-xs text-[#A7B0C0] mb-4">Hamisha mapato yako kwenda kwenye namba ya simu au benki</p>

            {payoutSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#16C784] mx-auto" />
                <h4 className="text-sm font-bold text-white">Ombi la Malipo Limepokelewa!</h4>
                <p className="text-xs text-[#A7B0C0]">Pesa zitatumwa kwenye {accountNumber} ndani ya muda mfupi.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayoutSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                    Njia ya Malipo:
                  </label>
                  <select
                    value={payoutProvider}
                    onChange={(e) => setPayoutProvider(e.target.value as any)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="M-Pesa">Vodacom M-Pesa</option>
                    <option value="Tigo Pesa">Tigo Pesa</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Halopesa">Halopesa</option>
                    <option value="CRDB Bank">CRDB Bank PLC</option>
                    <option value="NMB Bank">NMB Bank PLC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                    Namba ya Simu / Akaunti ya Benki:
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                    Jina Kamili Lililosajiliwa:
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                    Kiasi cha Kutoa (TZS):
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    max={availablePayoutTZS}
                    step={1000}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-[#A7B0C0] mt-1 block">
                    Upeo unaopatikana: {formatTZS(availablePayoutTZS)}
                  </span>
                </div>

                {payoutError && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    {payoutError}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-2 rounded-xl border border-[#262E3E] text-xs text-[#A7B0C0]"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#16C784] to-[#10B981] text-black font-bold text-xs"
                  >
                    Thibitisha Kutoa Pesa
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
