import React, { useState, useMemo } from 'react';
import { 
  X, 
  Megaphone, 
  Video, 
  Image as ImageIcon, 
  Calendar, 
  ExternalLink, 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Play,
  Upload,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { formatTZS, translations } from '../../lib/i18n';
import { AdFormat, AdCTA, AdCampaign } from '../../types';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (campaignId: string) => void;
}

const AD_FORMAT_OPTIONS: {
  id: AdFormat;
  title: string;
  category: 'video' | 'display';
  description: string;
  dailyRateTZS: number;
  badge: string;
}[] = [
  {
    id: 'skippable_instream',
    title: 'Skippable in-stream',
    category: 'video',
    description: 'Video inayocheza ndani ya kichezaji ikiwa na sekunde 5 kabla ya mtazamaji kuweza kuiruka.',
    dailyRateTZS: 15000,
    badge: 'Maarufu Zaidi'
  },
  {
    id: 'in_feed',
    title: 'In-feed Ad',
    category: 'display',
    description: 'Tangazo linaloonekana katikati ya orodha ya video (Home Feed na Search).',
    dailyRateTZS: 10000,
    badge: 'Gharama Nafuu'
  },
  {
    id: 'non_skippable_instream',
    title: 'Non-skippable in-stream',
    category: 'video',
    description: 'Video fupi ya sekunde 15 ya lazima kutazama hadi mwisho kabla ya maudhui.',
    dailyRateTZS: 25000,
    badge: 'Ushawishi Mkubwa'
  },
  {
    id: 'bumper',
    title: 'Bumper Ad',
    category: 'video',
    description: 'Tangazo fupi la kasi la sekunde 6 lisiloweza kurukwa, bora kwa kukuza chapa (brand recall).',
    dailyRateTZS: 12000,
    badge: 'Kasi & Brand'
  },
  {
    id: 'shorts',
    title: 'YouTube Shorts Ad',
    category: 'video',
    description: 'Video ya wima (9:16) inayotokea katikati ya video za Tazama Shorts na kitufe cha ununuzi.',
    dailyRateTZS: 18000,
    badge: 'Watazamaji Vijana'
  },
  {
    id: 'masthead',
    title: 'YouTube Masthead Video Ad',
    category: 'video',
    description: 'Tangazo la hadhi ya juu lenye video inayocheza juu kabisa ya ukurasa wa nyumbani wa Tazama.',
    dailyRateTZS: 50000,
    badge: 'Nafasi ya Kifalme'
  },
  {
    id: 'image_ad',
    title: 'Image Ad (Tangazo la Picha)',
    category: 'display',
    description: 'Picha au bango lenye muundo wa HD na kitufe cha hatua kwa ajili ya mauzo ya haraka.',
    dailyRateTZS: 8000,
    badge: 'Picha Pekee'
  },
  {
    id: 'preroll',
    title: 'Pre-roll Ad',
    category: 'video',
    description: 'Video inayocheza mwanzoni kabisa kabla video kuu haijaanza.',
    dailyRateTZS: 20000,
    badge: 'Kabla ya Video'
  },
  {
    id: 'midroll',
    title: 'Mid-roll Ad',
    category: 'video',
    description: 'Video ya mapumziko inayocheza katikati ya video ndefu zaidi ya dakika 8.',
    dailyRateTZS: 18000,
    badge: 'Katikati ya Video'
  },
  {
    id: 'sponsored_placement',
    title: 'Sponsored Placement',
    category: 'display',
    description: 'Nafasi maalumu ya udhamini yenye beji maalum ya mshirika rasmi wa Tazama.',
    dailyRateTZS: 30000,
    badge: 'Udhamini Maalumu'
  }
];

const PRESET_SAMPLE_MEDIA = {
  video: [
    { label: 'Video ya Simu / Vifaa (Tech Demo)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { label: 'Video ya Huduma / Fedha (FinTech)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { label: 'Video ya Burudani / Matangazo ya Haraka', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ],
  image: [
    { label: 'Picha ya Vinywaji & Vyakula (Beverage)', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80' },
    { label: 'Picha ya Benki & Fedha (Banking & Fintech)', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80' },
    { label: 'Picha ya Simu & Elektroniki (Electronics Sale)', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&auto=format&fit=crop&q=80' }
  ]
};

export const CreateAdModal: React.FC<CreateAdModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { profile, role, deductBalance } = useAuth();
  const { addAdCampaign, triggerSTKPush } = useVideo();

  // Wizard Steps: 1: Details & Creative -> 2: Pricing & Payment -> 3: Success Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields mandated by user
  const [campaignName, setCampaignName] = useState('');
  const [adFormat, setAdFormat] = useState<AdFormat>('skippable_instream');
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [mediaUrl, setMediaUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState<AdCTA>('Nunua Sasa');
  const [destinationUrl, setDestinationUrl] = useState('https://');
  
  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextMonthStr);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'>('mpesa');
  const [mobileNumber, setMobileNumber] = useState('0754 123 456');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

  // Auto-switch mediaType when format requires video or image
  const handleSelectFormat = (fmt: AdFormat) => {
    setAdFormat(fmt);
    if (fmt === 'image_ad' || fmt === 'in_feed' || fmt === 'sponsored_placement') {
      setMediaType('image');
      setMediaUrl('https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80');
    } else {
      setMediaType('video');
      setMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    }
  };

  // Calculations
  const selectedFormatObj = useMemo(() => {
    return AD_FORMAT_OPTIONS.find(f => f.id === adFormat) || AD_FORMAT_OPTIONS[0];
  }, [adFormat]);

  const campaignDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return Math.max(1, isNaN(diff) ? 7 : diff);
  }, [startDate, endDate]);

  const totalCostTZS = useMemo(() => {
    return campaignDays * selectedFormatObj.dailyRateTZS;
  }, [campaignDays, selectedFormatObj]);

  const estimatedImpressions = useMemo(() => {
    return campaignDays * 3500;
  }, [campaignDays]);

  if (!isOpen) return null;

  // Step 1 Validation
  const canProceedToPayment = 
    campaignName.trim().length >= 3 &&
    headline.trim().length >= 3 &&
    description.trim().length >= 5 &&
    destinationUrl.trim().length >= 8 &&
    mediaUrl.trim().length > 0;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceedToPayment) return;
    setCurrentStep(2);
  };

  const handleExecutePaymentAndSubmit = async () => {
    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      const advertiser = profile?.displayName || profile?.email || 'Mtumiaji wa Tazama';
      const userRole = role === 'creator' ? 'creator' : role === 'admin' ? 'admin' : 'viewer';

      let paymentRef = `TZM-PAY-${Date.now().toString().slice(-6)}`;
      let providerName: any = 'M-Pesa';

      if (paymentMethod === 'wallet') {
        providerName = 'Salio la Tazama';
        if ((profile?.balanceTZS || 0) < totalCostTZS) {
          setPaymentError(`Salio lako halitoshi. Una TZS ${(profile?.balanceTZS || 0).toLocaleString()}, kiasi kinachohitajika ni TZS ${totalCostTZS.toLocaleString()}.`);
          setIsProcessingPayment(false);
          return;
        }
        const ok = deductBalance(totalCostTZS);
        if (!ok) {
          setPaymentError('Hitilafu wakati wa kukata salio. Tafadhali jaribu tena.');
          setIsProcessingPayment(false);
          return;
        }
      } else {
        // Mobile Money Simulator
        if (paymentMethod === 'mpesa') providerName = 'M-Pesa';
        if (paymentMethod === 'tigopesa') providerName = 'Tigo Pesa';
        if (paymentMethod === 'airtel') providerName = 'Airtel Money';
        if (paymentMethod === 'halopesa') providerName = 'Halopesa';

        // Trigger STK Push prompt for real simulator experience
        triggerSTKPush({
          provider: providerName,
          phoneNumber: mobileNumber,
          amountTZS: totalCostTZS,
          reference: `ADS-${campaignName.slice(0, 8).toUpperCase()}`
        });

        // Simulate 1.5s network transaction confirmation
        await new Promise(res => setTimeout(res, 1500));
      }

      // Add Campaign with Status: PENDING_APPROVAL
      const newCampaignId = addAdCampaign({
        creatorId: profile?.uid || 'guest-user',
        creatorName: advertiser,
        creatorRole: userRole,
        campaignName: campaignName.trim(),
        adFormat,
        mediaType,
        mediaUrl: mediaUrl.trim(),
        headline: headline.trim(),
        description: description.trim(),
        ctaText,
        destinationUrl: destinationUrl.trim(),
        startDate,
        endDate,
        budgetTZS: totalCostTZS,
        dailyBudgetTZS: selectedFormatObj.dailyRateTZS,
        paymentProvider: providerName,
        paymentReference: paymentRef,
        paidAt: new Date().toISOString(),
        status: 'pending_approval' // STRICT REQUIREMENT: Paid first, then awaits Admin Approval!
      });

      setCreatedCampaignId(newCampaignId);
      setIsProcessingPayment(false);
      setCurrentStep(3);

      if (onSuccess) {
        onSuccess(newCampaignId);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Hitilafu ya mtandao wakati wa malipo.');
      setIsProcessingPayment(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setCampaignName('');
    setHeadline('');
    setDescription('');
    setDestinationUrl('https://');
    setPaymentError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#141824] border border-[#262E3E] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#262E3E] flex items-center justify-between bg-[#10131B]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-[#FF3040]/25">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Unda Tangazo Jipya la Biashara
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tazama Ads
                </span>
              </h2>
              <p className="text-xs text-[#A7B0C0]">
                {currentStep === 1 && 'Hatua 1 kati ya 2: Taarifa na Muundo wa Tangazo'}
                {currentStep === 2 && 'Hatua 2 kati ya 2: Gharama na Malipo ya Papo kwa Hapo'}
                {currentStep === 3 && 'Umefanikiwa! Tangazo Limewasilishwa'}
              </p>
            </div>
          </div>

          <button 
            onClick={resetForm} 
            className="p-2 rounded-xl text-[#A7B0C0] hover:text-white hover:bg-[#191E29] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STEP 1: FORM FIELDS */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              {/* Notice Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/20 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Utaratibu wa Tazama:</strong> Mtazamaji au Muundaji anaweka tangazo, analipia kupitia Mobile Money, kisha Admin anaidhinisha kabla ya kuanza kuonekana kwenye jukwaa.
                </p>
              </div>

              {/* 1. Jina la kampeni */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  1. Jina la kampeni <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Mfano: Tangazo la Simu Mpya ya Galaxy S25"
                  className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040]"
                />
                <span className="text-[11px] text-[#A7B0C0] mt-1 block">
                  Jina la ndani la kampeni kwa ajili ya kufuatilia matokeo na takwimu zako.
                </span>
              </div>

              {/* 2. Aina ya tangazo (10 User-Specified Options) */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  2. Aina ya tangazo <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AD_FORMAT_OPTIONS.map((opt) => {
                    const isSelected = adFormat === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectFormat(opt.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10' 
                            : 'bg-[#191E29] border-[#262E3E] text-[#A7B0C0] hover:text-white hover:border-[#384357]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            {opt.category === 'video' ? <Video className="w-3.5 h-3.5 text-amber-400" /> : <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />}
                            {opt.title}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#10131B] text-amber-300 border border-amber-500/30">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A7B0C0] line-clamp-2 leading-relaxed">
                          {opt.description}
                        </p>
                        <div className="mt-2 text-[10px] font-mono text-[#16C784] font-bold flex items-center justify-between">
                          <span>TZS {opt.dailyRateTZS.toLocaleString()} / siku</span>
                          {isSelected && <span className="text-amber-400 font-sans">✓ Umechagua</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Video au picha (Faili ya tangazo) */}
              <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    {mediaType === 'video' ? <Video className="w-4 h-4 text-amber-400" /> : <ImageIcon className="w-4 h-4 text-cyan-400" />}
                    3. Video au picha (Faili ya tangazo) <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-1 text-[11px] bg-[#10131B] p-0.5 rounded-lg border border-[#262E3E]">
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${mediaType === 'video' ? 'bg-[#FF3040] text-white' : 'text-[#A7B0C0]'}`}
                    >
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('image')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${mediaType === 'image' ? 'bg-[#FF3040] text-white' : 'text-[#A7B0C0]'}`}
                    >
                      Picha (Image)
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder={mediaType === 'video' ? 'Weka link ya video (.mp4)' : 'Weka link ya picha (.jpg, .png)'}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-[#A7B0C0]"
                  />
                </div>

                {/* Quick Preset Selector for Easy Testing */}
                <div>
                  <span className="text-[10px] text-[#A7B0C0] block mb-1.5">Mifano ya haraka ya media:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(mediaType === 'video' ? PRESET_SAMPLE_MEDIA.video : PRESET_SAMPLE_MEDIA.image).map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMediaUrl(sample.url)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-[#232A39] hover:bg-amber-500 hover:text-black text-[#A7B0C0] transition-colors"
                      >
                        ⚡ {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media Preview Box */}
                {mediaUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden bg-black aspect-video max-h-48 border border-[#262E3E] flex items-center justify-center relative">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={mediaUrl} alt="Ad Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                )}
              </div>

              {/* 4. Kichwa cha tangazo & Maelezo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    4. Kichwa cha tangazo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Mfano: Nunua Simu Yako Leo"
                    className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    5. Kitufe cha hatua (Call-to-Action) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value as AdCTA)}
                    className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF3040]"
                  >
                    <option value="Tembelea Tovuti">Tembelea Tovuti</option>
                    <option value="Nunua Sasa">Nunua Sasa</option>
                    <option value="Wasiliana Nasi">Wasiliana Nasi</option>
                  </select>
                </div>
              </div>

              {/* 6. Maelezo */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  6. Maelezo (Ujumbe mfupi wa tangazo) <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mfano: Pata punguzo kubwa la 50% leo na uwezo wa kulipa kidogo kidogo kupitia Tazama."
                  className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl p-3 text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040]"
                />
              </div>

              {/* 7. Kiungo */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  7. Kiungo (Tovuti au ukurasa wa bidhaa) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://tovuti-yako.co.tz/bidhaa"
                    className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040]"
                  />
                  <ExternalLink className="w-4 h-4 text-[#A7B0C0] absolute left-3 top-3" />
                </div>
              </div>

              {/* 8. Tarehe ya kuanza & Tarehe ya kuisha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    8. Tarehe ya kuanza <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF3040]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    9. Tarehe ya kuisha <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF3040]"
                  />
                </div>
              </div>

              {/* Step 1 Footer */}
              <div className="pt-4 border-t border-[#262E3E] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#A7B0C0] block">Makadirio ya Bajeti:</span>
                  <span className="text-base font-black text-[#16C784] font-mono">
                    TZS {totalCostTZS.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#A7B0C0] ml-2">({campaignDays} siku)</span>
                </div>

                <button
                  type="submit"
                  disabled={!canProceedToPayment}
                  className="px-6 py-3 rounded-2xl bg-[#FF3040] hover:bg-[#E02635] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF3040]/30 transition-all cursor-pointer"
                >
                  <span>Endelea Kwenye Malipo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: PRICING & PAYMENT */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              {/* Order Summary Box */}
              <div className="p-5 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-4">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Muhtasari wa Malipo ya Kampeni
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                    <span className="text-[10px] text-[#A7B0C0] block">Jina la Kampeni</span>
                    <span className="font-bold text-white truncate block">{campaignName}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                    <span className="text-[10px] text-[#A7B0C0] block">Aina ya Tangazo</span>
                    <span className="font-bold text-amber-300 truncate block">{selectedFormatObj.title}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                    <span className="text-[10px] text-[#A7B0C0] block">Muda wa Kampeni</span>
                    <span className="font-bold text-white block">{campaignDays} Siku</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                    <span className="text-[10px] text-[#A7B0C0] block">Makadirio ya Views</span>
                    <span className="font-bold text-[#16C784] font-mono block">~{estimatedImpressions.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#A7B0C0] block">Jumla ya Fedha Zinazotakiwa Kulipwa:</span>
                    <span className="text-2xl font-black text-[#16C784] font-mono">
                      {formatTZS(totalCostTZS)}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Inasubiri Idhini Baada ya Malipo
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white">
                  Chagua Njia ya Malipo (Tanzania Mobile Money au Salio la Tazama):
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'mpesa', name: 'M-Pesa', logo: '🔴 Vodacom' },
                    { id: 'tigopesa', name: 'Tigo Pesa', logo: '🔵 Tigo' },
                    { id: 'airtel', name: 'Airtel Money', logo: '🔴 Airtel' },
                    { id: 'halopesa', name: 'Halopesa', logo: '🟠 Halotel' },
                    { id: 'wallet', name: 'Salio la Tazama', logo: '💳 Wallet' }
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white font-black'
                            : 'bg-[#191E29] border-[#262E3E] text-[#A7B0C0] hover:text-white'
                        }`}
                      >
                        <span className="text-xs block mb-1">{method.logo}</span>
                        <span className="text-xs font-bold block">{method.name}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod !== 'wallet' ? (
                  <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-2">
                    <label className="text-xs text-[#A7B0C0] block">
                      Ingiza Namba ya Simu itakayopokea ujumbe wa USSD / STK Push:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Smartphone className="w-4 h-4 text-[#A7B0C0] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="0754 123 456"
                          className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#A7B0C0]">
                      Ukibonyeza kitufe hapa chini, ombi la malipo la TZS {totalCostTZS.toLocaleString()} litatumwa moja kwa moja kwenye simu yako kuthibitisha kwa PIN.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#A7B0C0] block">Salio Lako la Sasa la Tazama:</span>
                      <span className="text-base font-bold text-[#16C784] font-mono">
                        {formatTZS(profile?.balanceTZS || 0)}
                      </span>
                    </div>
                    {(profile?.balanceTZS || 0) < totalCostTZS && (
                      <span className="text-red-400 font-bold text-xs">
                        ⚠️ Salio halitoshi kwa tangazo hili
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {paymentError && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-4 border-t border-[#262E3E] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-[#191E29] hover:bg-[#232A39] text-[#A7B0C0] hover:text-white text-xs font-bold"
                >
                  Rudi Nyuma
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecutePaymentAndSubmit}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#16C784] hover:brightness-110 disabled:opacity-50 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Inachakata Malipo ya Simu...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-black" />
                      <span>Lipia TZS {totalCostTZS.toLocaleString()} na Tuma kwa Idhini</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {currentStep === 3 && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-[#16C784] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-black text-white">Malipo Yamekamilika &amp; Tangazo Limewasilishwa!</h3>
                <p className="text-xs text-[#A7B0C0] leading-relaxed">
                  Kampeni yako <strong>"{campaignName}"</strong> imepokelewa na malipo ya <strong>{formatTZS(totalCostTZS)}</strong> yamekamilika.
                </p>
              </div>

              {/* Status Badge Notice */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#191E29] border border-amber-500/40 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Hali ya Sasa: Inasubiri Idhini ya Admin</span>
                </div>
                <p className="text-[11px] text-[#A7B0C0] leading-relaxed">
                  Kulingana na kanuni za Tazama, matangazo yote yaliyolipwa yanapitiwa na jopo la Admin ndani ya saa 2 kuhakikisha yanakidhi viwango kabla ya kuanza kuonekana kwenye mfumo.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg"
                >
                  Sawa, Nimekamilisha
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
