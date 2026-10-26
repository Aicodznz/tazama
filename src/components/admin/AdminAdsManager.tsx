import React, { useState } from 'react';
import { 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Play, 
  Pause, 
  Filter, 
  DollarSign, 
  Eye, 
  MousePointerClick, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  Search,
  Video,
  Image as ImageIcon,
  User,
  Plus
} from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { formatTZS, translations } from '../../lib/i18n';
import { AdCampaign, AdStatus } from '../../types';

interface AdminAdsManagerProps {
  onOpenCreateModal: () => void;
}

export const AdminAdsManager: React.FC<AdminAdsManagerProps> = ({ onOpenCreateModal }) => {
  const { 
    adCampaigns, 
    approveAdCampaign, 
    rejectAdCampaign, 
    updateAdCampaignStatus 
  } = useVideo();
  const { profile, language } = useAuth();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'active' | 'rejected' | 'paused'>('pending_approval');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rejection modal
  const [rejectingAd, setRejectingAd] = useState<AdCampaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Creative Preview Modal
  const [previewingAd, setPreviewingAd] = useState<AdCampaign | null>(null);

  // Filtered campaigns
  const filteredCampaigns = adCampaigns.filter(ad => {
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    const matchesSearch = 
      ad.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.adFormat?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = adCampaigns.filter(c => c.status === 'pending_approval').length;
  const activeCount = adCampaigns.filter(c => c.status === 'active').length;
  const totalRevenueCollectedTZS = adCampaigns.reduce((sum, c) => sum + (c.budgetTZS || 0), 0);

  const handleApprove = (ad: AdCampaign) => {
    approveAdCampaign(ad.id, profile?.email || 'amytzee@gmail.com');
  };

  const handleConfirmReject = () => {
    if (!rejectingAd) return;
    rejectAdCampaign(rejectingAd.id, rejectionReason.trim() || 'Haikidhi sera za matangazo ya jamii za Tazama.', profile?.email || 'amytzee@gmail.com');
    setRejectingAd(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E]">
          <div className="flex items-center justify-between text-xs text-[#A7B0C0]">
            <span>Zinasubiri Idhini ya Admin</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1 flex items-center gap-2">
            <span>{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-sans border border-red-500/40 animate-pulse">
                Inahitaji Hatua
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E]">
          <div className="flex items-center justify-between text-xs text-[#A7B0C0]">
            <span>Matangazo Yaliyo Hewani</span>
            <CheckCircle2 className="w-4 h-4 text-[#16C784]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#16C784] mt-1">
            {activeCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E]">
          <div className="flex items-center justify-between text-xs text-[#A7B0C0]">
            <span>Jumla ya Fedha za Matangazo</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {formatTZS(totalRevenueCollectedTZS)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E]">
          <div className="flex items-center justify-between text-xs text-[#A7B0C0]">
            <span>Kampeni Zote Zilizoundwa</span>
            <Megaphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 mt-1">
            {adCampaigns.length}
          </div>
        </div>

      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'pending_approval', label: `Zinasubiri Idhini (${pendingCount})`, alert: pendingCount > 0 },
            { id: 'active', label: `Zinazofanya Kazi (${activeCount})` },
            { id: 'all', label: `Zote (${adCampaigns.length})` },
            { id: 'paused', label: 'Zilizositishwa' },
            { id: 'rejected', label: 'Zilizokataliwa' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#10131B] text-[#A7B0C0] hover:text-white hover:bg-[#191E29] border border-[#262E3E]'
              }`}
            >
              {tab.alert && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Search & Create Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#A7B0C0] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta kampeni, mtangazaji..."
              className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Weka Tangazo</span>
          </button>
        </div>

      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#10131B] border border-[#262E3E] text-center space-y-3">
          <Megaphone className="w-10 h-10 text-[#A7B0C0] mx-auto opacity-40" />
          <h4 className="text-sm font-bold text-white">Hakuna Matangazo Katika Sehemu Hii</h4>
          <p className="text-xs text-[#A7B0C0]">
            {statusFilter === 'pending_approval' 
              ? 'Hakuna tangazo linalosubiri idhini kwa sasa. Matangazo yote yaliyolipwa yamehakikiwa.' 
              : 'Hakuna rekodi zinazoendana na machaguo yako ya sasa.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((ad) => {
            const isPending = ad.status === 'pending_approval';
            const isActive = ad.status === 'active';
            const isRejected = ad.status === 'rejected';

            return (
              <div 
                key={ad.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isPending 
                    ? 'bg-gradient-to-r from-[#191E29] to-[#1e1b15] border-amber-500/50 shadow-xl shadow-amber-500/5' 
                    : 'bg-[#10131B] border-[#262E3E]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Thumbnail & Main Info */}
                  <div className="flex items-start gap-4">
                    
                    {/* Media Thumbnail */}
                    <div 
                      onClick={() => setPreviewingAd(ad)}
                      className="w-24 sm:w-32 aspect-video rounded-2xl bg-black border border-[#262E3E] overflow-hidden relative group cursor-pointer shrink-0"
                    >
                      {ad.mediaType === 'video' ? (
                        <video src={ad.mediaUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={ad.mediaUrl} alt={ad.headline} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <Play className="w-6 h-6 text-white opacity-80 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/80 text-white font-mono uppercase">
                        {ad.mediaType}
                      </span>
                    </div>

                    {/* Texts */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {ad.adFormat.replace('_', ' ')}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                          isRejected ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {isActive ? '● Inaonyeshwa (Active)' :
                           isPending ? '⏳ Inasubiri Idhini ya Admin' :
                           isRejected ? '✕ Imekataliwa' : 'Imesitishwa'}
                        </span>

                        <span className="text-[11px] text-[#A7B0C0] font-mono">
                          ID: {ad.id}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-white hover:text-amber-400 cursor-pointer" onClick={() => setPreviewingAd(ad)}>
                        {ad.campaignName}
                      </h4>

                      <p className="text-xs font-semibold text-amber-300">
                        "{ad.headline}"
                      </p>

                      <p className="text-xs text-[#A7B0C0] line-clamp-1">
                        {ad.description}
                      </p>

                      {/* Advertiser & Payment details */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#A7B0C0]">
                        <span className="flex items-center gap-1 text-white">
                          <User className="w-3 h-3 text-amber-400" />
                          <strong>{ad.creatorName}</strong> ({ad.creatorRole})
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {formatTZS(ad.budgetTZS)} ({ad.paymentProvider || 'M-Pesa'})
                        </span>
                        <span>•</span>
                        <span className="font-mono">{ad.startDate} hadi {ad.endDate}</span>
                        {ad.destinationUrl && (
                          <a 
                            href={ad.destinationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-0.5 ml-1"
                          >
                            <span>{ad.ctaText}: {ad.destinationUrl.replace('https://', '').slice(0, 20)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right: Metrics & Approval Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0">
                    
                    {/* Performance metrics */}
                    <div className="flex items-center gap-4 text-xs font-mono bg-[#191E29] px-3.5 py-1.5 rounded-2xl border border-[#262E3E]">
                      <div>
                        <span className="text-[9px] text-[#A7B0C0] block font-sans">Impressions</span>
                        <span className="font-bold text-white">{(ad.impressions || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-[#262E3E]" />
                      <div>
                        <span className="text-[9px] text-[#A7B0C0] block font-sans">Clicks</span>
                        <span className="font-bold text-amber-400">{(ad.clicks || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-[#262E3E]" />
                      <div>
                        <span className="text-[9px] text-[#A7B0C0] block font-sans">Iliyotumika</span>
                        <span className="font-bold text-[#16C784]">{formatTZS(ad.spendTZS || 0)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApprove(ad)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#16C784] hover:brightness-110 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                            title="Idhinisha tangazo hili lianze kuonekana jukwaani mara moja"
                          >
                            <CheckCircle2 className="w-4 h-4 text-black" />
                            <span>Idhinisha (Approve)</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingAd(ad);
                              setRejectionReason('');
                            }}
                            className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                            title="Kataa tangazo kwa kutoa sababu"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Kataa (Reject)</span>
                          </button>
                        </>
                      )}

                      {isActive && (
                        <button
                          onClick={() => updateAdCampaignStatus(ad.id, 'paused')}
                          className="px-3.5 py-1.5 rounded-xl bg-[#232A39] hover:bg-amber-500 hover:text-black text-white text-xs font-bold transition-all"
                        >
                          Sitisha (Pause)
                        </button>
                      )}

                      {ad.status === 'paused' && (
                        <button
                          onClick={() => updateAdCampaignStatus(ad.id, 'active')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                        >
                          Washa (Resume)
                        </button>
                      )}

                      <button
                        onClick={() => setPreviewingAd(ad)}
                        className="p-2 rounded-xl bg-[#191E29] hover:bg-[#232A39] text-[#A7B0C0] hover:text-white"
                        title="Kagua muonekano wa tangazo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                    </div>

                    {isRejected && ad.rejectionReason && (
                      <span className="text-[10px] text-red-400 block italic max-w-xs text-right">
                        Sababu: "{ad.rejectionReason}"
                      </span>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal with Reason input */}
      {rejectingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#191E29] border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Kataa Tangazo: {rejectingAd.campaignName}
            </h3>

            <p className="text-xs text-[#A7B0C0]">
              Mtumiaji <strong>{rejectingAd.creatorName}</strong> ataarifiwa sababu ya kukataliwa na atapata nafasi ya kurekebisha tangazo lake.
            </p>

            <div>
              <label className="text-xs text-[#A7B0C0] block mb-1">
                Sababu ya kukataa (Admin Explanation):
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Mfano: Kiungo cha tovuti hakifanyi kazi, au picha inakiuka masharti ya maudhui..."
                className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl p-3 text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingAd(null)}
                className="px-4 py-2 rounded-xl bg-[#10131B] text-xs font-bold text-white"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs"
              >
                Thibitisha Kukataa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Creative Deep Dive Preview Modal */}
      {previewingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#141824] border border-[#262E3E] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  {previewingAd.adFormat.replace('_', ' ')}
                </span>
                <h3 className="text-base font-black text-white">{previewingAd.campaignName}</h3>
              </div>
              <button onClick={() => setPreviewingAd(null)} className="text-[#A7B0C0] hover:text-white p-1">✕</button>
            </div>

            {/* Media playback preview */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-[#262E3E] relative">
              {previewingAd.mediaType === 'video' ? (
                <video src={previewingAd.mediaUrl} controls autoPlay muted className="w-full h-full object-contain" />
              ) : (
                <img src={previewingAd.mediaUrl} alt={previewingAd.headline} className="w-full h-full object-contain" />
              )}
            </div>

            {/* Ad text & CTA card */}
            <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase">Tangazo</span>
                <h4 className="text-sm font-bold text-white">{previewingAd.headline}</h4>
                <p className="text-xs text-[#A7B0C0]">{previewingAd.description}</p>
                <span className="text-[11px] text-blue-400 font-mono block">{previewingAd.destinationUrl}</span>
              </div>

              <a
                href={previewingAd.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shrink-0 flex items-center gap-1.5 shadow-md"
              >
                <span>{previewingAd.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Approval bar if pending */}
            {previewingAd.status === 'pending_approval' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs text-amber-300 font-bold">Tangazo hili linasubiri idhini yako</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleApprove(previewingAd);
                      setPreviewingAd(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs"
                  >
                    Idhinisha Sasa
                  </button>
                  <button
                    onClick={() => {
                      const ad = previewingAd;
                      setPreviewingAd(null);
                      setRejectingAd(ad);
                    }}
                    className="px-3 py-2 rounded-xl bg-red-600/30 text-red-300 text-xs font-bold"
                  >
                    Kataa
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setPreviewingAd(null)}
                className="px-4 py-2 rounded-xl bg-[#10131B] text-xs font-bold text-white"
              >
                Funga
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
