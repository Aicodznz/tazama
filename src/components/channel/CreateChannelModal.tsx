import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Globe, 
  Upload, 
  Tv, 
  HelpCircle, 
  FileText, 
  Check, 
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Music,
  Film,
  Camera,
  Share2,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { Channel, CreatorIdentityStatus } from '../../types';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (channel: Channel) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
];

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80'
];

const CREATOR_CATEGORIES = [
  { id: 'Muziki na Bongo Flava', label: '🎵 Muziki na Bongo Flava' },
  { id: 'Vichekesho', label: '😂 Vichekesho' },
  { id: 'Filamu na tamthilia', label: '🎬 Filamu na tamthilia' },
  { id: 'Gaming na Esports', label: '🎮 Gaming na Esports' },
  { id: 'Elimu na mafunzo', label: '📚 Elimu na mafunzo' },
  { id: 'Teknolojia', label: '💻 Teknolojia' },
  { id: 'Michezo', label: '⚽ Michezo' },
  { id: 'Habari', label: '📰 Habari' },
  { id: 'Chakula na mapishi', label: '🍳 Chakula na mapishi' },
  { id: 'Safari na utalii', label: '✈️ Safari na utalii' },
  { id: 'Vlog na maisha ya kila siku', label: '🎥 Vlog na maisha ya kila siku' },
  { id: 'Sanaa na ubunifu', label: '🎨 Sanaa na ubunifu' },
  { id: 'Maudhui mengine', label: '📱 Maudhui mengine' }
];

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { profile, upgradeToCreator } = useAuth();
  const { channels } = useVideo();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // HATUA YA 1 — Taarifa za Channel
  const [channelName, setChannelName] = useState<string>(profile?.displayName ? `${profile.displayName} TV` : '');
  const [handle, setHandle] = useState<string>(profile?.displayName ? `@${profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '@');
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.photoURL || PRESET_AVATARS[0]);
  const [bannerUrl, setBannerUrl] = useState<string>(PRESET_BANNERS[0]);
  const [bio, setBio] = useState<string>('');
  const [primaryLanguage, setPrimaryLanguage] = useState<string>('Kiswahili');
  const [country, setCountry] = useState<string>('Tanzania');
  const [identityStatus, setIdentityStatus] = useState<CreatorIdentityStatus>('Haijathibitishwa');

  // HATUA YA 2 — Aina ya Creator
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Muziki na Bongo Flava']);

  // HATUA YA 3 — Taarifa za Umma na Mawasiliano
  const [publicEmail, setPublicEmail] = useState<string>('');
  const [showPublicEmail, setShowPublicEmail] = useState<boolean>(false);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [instagramUrl, setInstagramUrl] = useState<string>('');
  const [tiktokUrl, setTiktokUrl] = useState<string>('');
  const [facebookUrl, setFacebookUrl] = useState<string>('');
  const [publicPhone, setPublicPhone] = useState<string>('');

  // HATUA YA 4 — Masharti na Sera
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [agreeContentPolicy, setAgreeContentPolicy] = useState<boolean>(false);
  const [agreeRightsPermissions, setAgreeRightsPermissions] = useState<boolean>(false);
  const [agreeMonetization, setAgreeMonetization] = useState<boolean>(false);

  // HATUA YA 5 — Umiliki na Haki za Maudhui
  const [ownershipType, setOwnershipType] = useState<string>('Maudhui yangu mwenyewe');
  const [rightsHolderName, setRightsHolderName] = useState<string>(profile?.displayName || '');
  const [rightsType, setRightsType] = useState<string>('Hakimiliki Kamili (Master & Publishing)');
  const [productionDate, setProductionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cosotaNumber, setCosotaNumber] = useState<string>('');
  const [licenseTerritory, setLicenseTerritory] = useState<string>('Afrika Mashariki na Duniani Kote');
  const [revenueTerms, setRevenueTerms] = useState<string>('100% kwa muundaji (Tazama Content Shield)');

  if (!isOpen) return null;

  // Validation functions
  const validateHandle = (val: string): { valid: boolean; message?: string } => {
    if (!val.startsWith('@')) {
      return { valid: false, message: 'Username / Handle lazima ianze na @ (mfano: @AmourTV)' };
    }
    const clean = val.substring(1);
    if (clean.length < 3) {
      return { valid: false, message: 'Handle lazima iwe na angalau herufi au tarakimu 3' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return { valid: false, message: 'Handle inaweza kuwa na herufi, namba na alama ya _ pekee' };
    }
    // Check uniqueness
    const isTaken = channels.some(c => c.handle.toLowerCase() === val.toLowerCase());
    if (isTaken) {
      return { valid: false, message: `Handle ${val} tayari inatumiwa na channel nyingine. Chagua nyingine.` };
    }
    return { valid: true };
  };

  const handleNextStep = () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!channelName.trim()) {
        setErrorMessage('Tafadhali weka Jina la Channel yako.');
        return;
      }
      const handleCheck = validateHandle(handle.trim());
      if (!handleCheck.valid) {
        setErrorMessage(handleCheck.message || 'Handle si sahihi.');
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedCategories.length === 0) {
        setErrorMessage('Tafadhali chagua angalau aina moja ya maudhui unayopanga kuchapisha.');
        return;
      }
    }

    if (currentStep === 4) {
      if (!agreeTerms || !agreeContentPolicy || !agreeRightsPermissions || !agreeMonetization) {
        setErrorMessage('Tafadhali thibitisha visanduku vyote vinne vya Masharti, Sera na Haki ili kuendelea.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return; // Idempotency protection against double-click
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formattedHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
      
      const newChannelData: Partial<Channel> = {
        name: channelName.trim(),
        handle: formattedHandle,
        avatarUrl,
        bannerUrl,
        bio: bio.trim() || `Karibu kwenye kituo rasmi cha ${channelName.trim()} kwenye Tazama.`,
        categories: selectedCategories,
        primaryLanguage,
        country,
        identityStatus,
        publicEmail: showPublicEmail ? publicEmail.trim() : undefined,
        showPublicEmail,
        publicPhone: publicPhone.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        tiktokUrl: tiktokUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        rightsInfo: {
          ownershipType,
          rightsHolderName: rightsHolderName.trim() || channelName.trim(),
          rightsType,
          productionDate,
          cosotaNumber: cosotaNumber.trim() || undefined,
          licenseTerritory,
          revenueTerms
        },
        policyAgreement: {
          version: 'v2.4-2026',
          acceptedAt: new Date().toISOString(),
          accountId: profile?.uid || 'user-unknown',
          termsAccepted: agreeTerms,
          contentPolicyAccepted: agreeContentPolicy,
          rightsConfirmed: agreeRightsPermissions,
          monetizationAcknowledged: agreeMonetization
        }
      };

      const createdChannel = await upgradeToCreator(newChannelData);
      setIsSubmitting(false);

      if (createdChannel) {
        onSuccess(createdChannel);
        onClose();
      } else {
        setErrorMessage('Kulikuwa na tatizo katika kusajili channel. Tafadhali jaribu tena.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Hitilafu imetokea. Tafadhali jaribu tena.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121622] border border-[#262E3E] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header with Step Progress */}
        <div className="px-6 py-4 border-b border-[#262E3E] flex items-center justify-between bg-[#191E29]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16C784]/15 border border-[#16C784]/30 flex items-center justify-center text-[#16C784]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Fungua Channel ya Tazama</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16C784]/20 text-[#16C784] uppercase">
                  Hatua {currentStep} ya 6
                </span>
              </h2>
              <p className="text-xs text-[#A7B0C0]">
                {currentStep === 1 && 'HATUA YA 1 — Taarifa za Channel'}
                {currentStep === 2 && 'HATUA YA 2 — Aina ya Creator & Maudhui'}
                {currentStep === 3 && 'HATUA YA 3 — Taarifa za Umma na Mawasiliano'}
                {currentStep === 4 && 'HATUA YA 4 — Masharti, Sera na Hakimiliki'}
                {currentStep === 5 && 'HATUA YA 5 — Umiliki na Haki za Maudhui'}
                {currentStep === 6 && 'HATUA YA 6 — Kagua na Fungua Channel'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Indicator */}
        <div className="w-full bg-[#10131B] h-1.5 flex">
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div
              key={step}
              className={`flex-1 h-full transition-all duration-300 ${
                step < currentStep 
                  ? 'bg-[#16C784]' 
                  : step === currentStep 
                  ? 'bg-gradient-to-r from-[#16C784] to-[#FF3040]' 
                  : 'bg-[#262E3E]/60'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-white">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ==================== HATUA 1: TAARIFA ZA CHANNEL ==================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#191E29] border border-[#262E3E] flex items-center gap-3">
                <Tv className="w-5 h-5 text-[#16C784] shrink-0" />
                <p className="text-[11px] text-[#A7B0C0] leading-relaxed">
                  Jaza taarifa rasmi za channel yako zitakazoonekana kwa watazamaji wako kwenye mtandao wa Tazama.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">
                    Jina la Channel <span className="text-[#FF3040]">* (Lazima)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={channelName}
                    onChange={(e) => {
                      setChannelName(e.target.value);
                      if (handle === '@' || handle.startsWith('@')) {
                        setHandle(`@${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
                      }
                    }}
                    placeholder="mfano: Amour TV, Wasafi Media"
                    className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-[#16C784]"
                  />
                  <span className="text-[10px] text-[#A7B0C0] mt-0.5 block">Jina linaloonekana hadharani</span>
                </div>

                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">
                    Username / Handle <span className="text-[#FF3040]">* (Lazima)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHandle(val.startsWith('@') ? val : `@${val}`);
                    }}
                    placeholder="@AmourTV"
                    className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] font-mono text-white focus:outline-none focus:border-[#16C784]"
                  />
                  <span className="text-[10px] text-[#A7B0C0] mt-0.5 block">Kipekee: Herufi, namba na alama ya _</span>
                </div>
              </div>

              {/* Logo / Avatar Selector */}
              <div>
                <label className="block font-bold text-[#A7B0C0] mb-1.5">
                  Picha ya Channel (Logo au Picha ya Muundaji)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Logo"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#16C784] shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Weka URL ya picha au chagua hapa chini..."
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-xs text-white focus:outline-none focus:border-[#16C784]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#A7B0C0]">Picha zilizopo:</span>
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset)}
                          className="w-6 h-6 rounded-full overflow-hidden border border-[#262E3E] hover:scale-110 transition-transform"
                        >
                          <img src={preset} alt={`preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Cover Selector */}
              <div>
                <label className="block font-bold text-[#A7B0C0] mb-1.5">
                  Channel Banner (Picha ya Jalada la Channel)
                </label>
                <div className="relative w-full h-20 rounded-2xl overflow-hidden border border-[#262E3E] mb-2">
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full">
                      Muonekano wa Jalada
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#A7B0C0]">Mijadala iliyopo:</span>
                  {PRESET_BANNERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBannerUrl(preset)}
                      className="h-7 px-2.5 rounded-lg bg-[#191E29] border border-[#262E3E] hover:border-[#16C784] text-[10px] text-white"
                    >
                      Jalada #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold text-[#A7B0C0] mb-1">
                  Maelezo ya Channel (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Eleza watazamaji kuhusu chaneli yako na maudhui unayotayarisha..."
                  className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-[#16C784]"
                />
              </div>

              {/* Language & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">
                    Lugha Kuu <span className="text-[#FF3040]">* (Lazima)</span>
                  </label>
                  <select
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none"
                  >
                    <option value="Kiswahili">Kiswahili (Tanzania / East Africa)</option>
                    <option value="Kiingereza">English (Global)</option>
                    <option value="Kifaransa">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">
                    Nchi <span className="text-[#FF3040]">* (Lazima)</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none"
                  >
                    <option value="Tanzania">Tanzania 🇹🇿</option>
                    <option value="Kenya">Kenya 🇰🇪</option>
                    <option value="Uganda">Uganda 🇺🇬</option>
                    <option value="Rwanda">Rwanda 🇷🇼</option>
                    <option value="Burundi">Burundi 🇧🇮</option>
                    <option value="DR Congo">DR Congo 🇨🇩</option>
                  </select>
                </div>
              </div>

              {/* Identity Status Section */}
              <div className="p-3.5 rounded-2xl bg-[#191E29] border border-[#262E3E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16C784]" />
                    <span>Hali ya Utambulisho wa Muundaji:</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {identityStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Haijathibitishwa', 'Inasubiri ukaguzi', 'Imethibitishwa', 'Inahitaji hatua zaidi'] as CreatorIdentityStatus[]).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setIdentityStatus(status)}
                      className={`p-2 rounded-xl border text-[10px] font-semibold transition-all text-center ${
                        identityStatus === status
                          ? 'bg-[#16C784]/20 border-[#16C784] text-[#16C784]'
                          : 'bg-[#10131B] border-[#262E3E] text-[#A7B0C0] hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#A7B0C0]/80 italic pt-1">
                  💡 Kumbuka: Kuthibitisha utambulisho wa mtu hakuthibitishi moja kwa moja kwamba anamiliki haki za kila video anayopakia.
                </p>
              </div>
            </div>
          )}

          {/* ==================== HATUA 2: AINA YA CREATOR ==================== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#191E29] border border-[#262E3E]">
                <h3 className="font-bold text-white text-sm mb-1">
                  Unapanga kuchapisha maudhui ya aina gani?
                </h3>
                <p className="text-[11px] text-[#A7B0C0] leading-relaxed">
                  Chagua aina moja au zaidi. Uchaguzi huu ni kwa ajili ya kuboresha mapendekezo ya video na hadhira yako, si kukuzuia kuchapisha maudhui mengine halali baadaye.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CREATOR_CATEGORIES.map(cat => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-[#16C784] bg-[#16C784]/15 text-white font-bold ring-1 ring-[#16C784]' 
                          : 'border-[#262E3E] bg-[#10131B] text-[#A7B0C0] hover:border-[#3b475e]'
                      }`}
                    >
                      <span className="text-xs">{cat.label}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-[#16C784] border-[#16C784] text-black' : 'border-[#262E3E]'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Links */}
              <div className="pt-2 border-t border-[#262E3E] space-y-2">
                <span className="font-bold text-[#A7B0C0] text-[11px] block">
                  Viungo vya Hiari vya Tovuti na Mitandao ya Kijamii:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#A7B0C0] mb-1">Tovuti Rasmi:</label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://tovuti-yako.co.tz"
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-xs text-white focus:outline-none focus:border-[#16C784]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#A7B0C0] mb-1">Instagram (@handle au URL):</label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="@username au kiungo cha IG"
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-xs text-white focus:outline-none focus:border-[#16C784]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== HATUA 3: TAARIFA ZA UMMA NA MAWASILIANO ==================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/30">
                <h3 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Ulinzi wa Faragha na Mawasiliano ya Umma</span>
                </h3>
                <p className="text-[11px] text-[#A7B0C0] leading-relaxed">
                  Tenganisha taarifa za umma za channel na taarifa binafsi za akaunti. Namba ya simu iliyotumika kuingia au kuthibitisha akaunti haitawekwa hadharani kwenye ukurasa wa channel.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#A7B0C0] mb-1">
                  Barua Pepe ya Mawasiliano ya Umma (Business Inquiries):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={publicEmail}
                    onChange={(e) => setPublicEmail(e.target.value)}
                    placeholder="contact@amourchannel.com"
                    className="flex-1 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-[#16C784]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPublicEmail(!showPublicEmail)}
                    className={`px-3 py-3 rounded-2xl border text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                      showPublicEmail 
                        ? 'bg-[#16C784]/20 border-[#16C784] text-[#16C784]' 
                        : 'bg-[#10131B] border-[#262E3E] text-[#A7B0C0]'
                    }`}
                  >
                    {showPublicEmail ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{showPublicEmail ? 'Inaonyeshwa' : 'Imefichwa'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">TikTok Account:</label>
                  <input
                    type="text"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="@channel_tiktok"
                    className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-xs text-white focus:outline-none focus:border-[#16C784]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">Facebook Page:</label>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/channel"
                    className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-xs text-white focus:outline-none focus:border-[#16C784]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#A7B0C0] mb-1">
                  Namba ya Simu ya Umma (Kwa ajili ya Matangazo / Hiari):
                </label>
                <input
                  type="text"
                  value={publicPhone}
                  onChange={(e) => setPublicPhone(e.target.value)}
                  placeholder="mfano: +255 700 000 000 (Isionyeshwe bila idhini yako)"
                  className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-[#16C784]"
                />
                <span className="text-[10px] text-[#A7B0C0] mt-1 block">
                  🛡️ Kwa chaguo-msingi namba hii itafichwa hadharani na itatumika tu pale mteja au mfadhili anapoomba kuwasiliana rasmi kupitia mfumo.
                </span>
              </div>
            </div>
          )}

          {/* ==================== HATUA 4: MASHARTI NA SERA ==================== */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h3 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Sera za Maudhui, Hakimiliki &amp; Usimamizi wa Mgawanyo wa Mapato</span>
                </h3>
                <p className="text-[11px] text-[#A7B0C0] leading-relaxed">
                  Tazama inalinda haki miliki za waumbaji kwa ushirikiano na COSOTA. Ili kufungua channel, ni lazima usome na ukubali miongozo hii minne:
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] hover:border-[#16C784] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#16C784] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      1. Nimesoma na kukubali Masharti ya Matumizi ya Creator wa Tazama.
                    </span>
                    <span className="text-[10px] text-[#A7B0C0] mt-0.5 block">
                      Kuelewa kanuni za uendeshaji wa kituo, heshima kwa jamii, na wajibu wa kisheria.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] hover:border-[#16C784] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeContentPolicy}
                    onChange={(e) => setAgreeContentPolicy(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#16C784] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      2. Nimeelewa Sera ya Maudhui ya Tazama na maudhui yaliyokatazwa.
                    </span>
                    <span className="text-[10px] text-[#A7B0C0] mt-0.5 block">
                      Kutopuuza kanuni dhidi ya uchochezi, matusi, udhalilishaji au maudhui haramu.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] hover:border-[#16C784] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeRightsPermissions}
                    onChange={(e) => setAgreeRightsPermissions(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#16C784] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      3. Nina haki au ruhusa zinazohitajika kwa video, muziki na kazi ninazopakia.
                    </span>
                    <span className="text-[10px] text-[#A7B0C0] mt-0.5 block">
                      Hairuhusiwi kupakia upya kazi ya mtu mwingine na kujifanya mmiliki, au kutumia muziki bila leseni halali.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] hover:border-[#16C784] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeMonetization}
                    onChange={(e) => setAgreeMonetization(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#16C784] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      4. Ninaelewa kwamba kupata mapato (Monetization) kunategemea masharti ya kisheria na madai ya hakimiliki yatalindwa kwa usawa na nafasi ya rufaa.
                    </span>
                    <span className="text-[10px] text-[#A7B0C0] mt-0.5 block">
                      Mapato ya video yenye mgogoro yatahifadhiwa kwanza (escrow) badala ya kuhamishwa bila uchunguzi.
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-2.5 rounded-xl bg-[#191E29] text-[10px] text-[#A7B0C0] flex items-center justify-between">
                <span>Rekodi ya ukaguzi wa kisheria: Toleo v2.4-2026</span>
                <span className="text-[#16C784] font-mono">Timestamp: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* ==================== HATUA 5: UMILIKI NA HAKI ZA MAUDHUI ==================== */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#191E29] border border-[#262E3E]">
                <h3 className="font-bold text-white text-xs mb-1">
                  Unapakia maudhui ya aina gani, na una haki gani juu yake?
                </h3>
                <p className="text-[11px] text-[#A7B0C0]">
                  Chagua msingi wa kisheria wa maudhui utakayoweka kwenye chaneli hii:
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'Maudhui yangu mwenyewe', title: '🌟 Maudhui Yangu Mwenyewe (Original)', desc: 'Nimetengeneza 100% kwa ubunifu wangu (video, sauti, script)' },
                  { id: 'Maudhui ya kampuni/timu', title: '🏢 Maudhui ya Kampuni / Timu (Work for hire)', desc: 'Nimeajiriwa au nimepewa mamlaka ya kuchapisha kwa niaba ya taasisi' },
                  { id: 'Maudhui yenye leseni', title: '📜 Maudhui yenye Leseni / Idhini Rasmi', desc: 'Ninamiliki mikataba halali ya utoaji leseni kutoka kwa wenye haki' },
                  { id: 'Maudhui ya ushirikiano/Remix', title: '🤝 Maudhui ya Ushirikiano / Remix yenye Haki', desc: 'Ushirikiano ulioruhusiwa kisheria na wagawanyo wa mapato' },
                  { id: 'Maudhui mengine', title: '📂 Maudhui Mengine', desc: 'Elimu, maoni halali ya umma au taarifa za habari za kiuchunguzi' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOwnershipType(opt.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      ownershipType === opt.id
                        ? 'border-[#16C784] bg-[#16C784]/15 ring-1 ring-[#16C784]'
                        : 'border-[#262E3E] bg-[#10131B] text-[#A7B0C0] hover:border-[#3b475e]'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      ownershipType === opt.id ? 'border-[#16C784] bg-[#16C784] text-black' : 'border-[#262E3E]'
                    }`}>
                      {ownershipType === opt.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-white block text-xs">{opt.title}</span>
                      <span className="text-[10px] text-[#A7B0C0] block mt-0.5">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Supporting Rights Registration */}
              <div className="p-3.5 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3">
                <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Taarifa za Kusaidia Uhakiki wa Hakimiliki (Hiari):</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#A7B0C0] mb-1">Jina la Mmiliki wa Haki:</label>
                    <input
                      type="text"
                      value={rightsHolderName}
                      onChange={(e) => setRightsHolderName(e.target.value)}
                      placeholder="Jina lako au kampuni yako"
                      className="w-full p-2.5 rounded-xl bg-[#191E29] border border-[#262E3E] text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#A7B0C0] mb-1">Namba ya Cheti cha COSOTA (kama ipo):</label>
                    <input
                      type="text"
                      value={cosotaNumber}
                      onChange={(e) => setCosotaNumber(e.target.value)}
                      placeholder="mfano: COSOTA-CR-2026-XXXX"
                      className="w-full p-2.5 rounded-xl bg-[#191E29] border border-[#262E3E] font-mono text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-[#A7B0C0]/80 italic">
                  💡 Namba ya cheti ni ushahidi wa kusaidia uhakiki endapo dai litatokea, si uthibitisho wa moja kwa moja kwamba msajili ndiye mmiliki wa kila haki inayohusika.
                </p>
              </div>
            </div>
          )}

          {/* ==================== HATUA 6: KAGUA NA FUNGUA CHANNEL ==================== */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#16C784]/10 border border-[#16C784]/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#16C784] shrink-0" />
                <div>
                  <h3 className="font-bold text-white text-xs">Uko tayari kufungua kituo chako!</h3>
                  <p className="text-[11px] text-[#A7B0C0]">
                    Kagua taarifa hizi za muhtasari kabla ya kuthibitisha kufunguliwa kwa kituo.
                  </p>
                </div>
              </div>

              {/* Preview Card */}
              <div className="rounded-3xl bg-[#10131B] border border-[#262E3E] overflow-hidden shadow-xl">
                {/* Banner */}
                <div className="h-28 w-full relative">
                  <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10131B] via-transparent to-transparent" />
                </div>

                {/* Avatar & Channel Details */}
                <div className="px-5 pb-5 -mt-10 relative">
                  <div className="flex items-end gap-3.5 mb-3">
                    <img
                      src={avatarUrl}
                      alt={channelName}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#10131B] shadow-xl"
                    />
                    <div className="min-w-0 pb-1">
                      <h4 className="text-lg font-black text-white truncate flex items-center gap-1.5">
                        <span>{channelName}</span>
                        <CheckCircle2 className="w-4 h-4 text-[#16C784]" />
                      </h4>
                      <p className="text-xs font-mono text-[#16C784]">{handle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#A7B0C0] line-clamp-2 mb-3">
                    {bio || `Kituo rasmi cha ${channelName} kwenye Tazama.`}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#262E3E]/60 text-[11px]">
                    <div>
                      <span className="text-[#A7B0C0] block">Nchi &amp; Lugha:</span>
                      <span className="font-bold text-white">{country} • {primaryLanguage}</span>
                    </div>
                    <div>
                      <span className="text-[#A7B0C0] block">Hali ya Utambulisho:</span>
                      <span className="font-bold text-amber-300">{identityStatus}</span>
                    </div>
                    <div>
                      <span className="text-[#A7B0C0] block">Msingi wa Haki:</span>
                      <span className="font-bold text-[#16C784] truncate block">{ownershipType}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#191E29] border border-[#262E3E] text-white">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Final submission button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#16C784] via-[#13ab71] to-[#109562] hover:brightness-110 text-black font-black text-sm tracking-wide shadow-xl shadow-[#16C784]/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Inafungua Channel Yako...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-black" />
                      <span>FUNGUA CHANNEL YANGU</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[#A7B0C0] mt-2">
                  Mfumo utakuelekeza moja kwa moja kwenye Studio ya Waumbaji baada ya channel kuundwa.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Navigation */}
        <div className="px-6 py-4 border-t border-[#262E3E] flex items-center justify-between bg-[#191E29]/50">
          <button
            type="button"
            disabled={currentStep === 1 || isSubmitting}
            onClick={handlePrevStep}
            className="px-4 py-2 rounded-xl bg-[#232A39] hover:bg-[#2E3748] text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Rudi Nyuma</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-[#16C784] hover:bg-[#13ab71] text-black text-xs font-bold transition-all shadow-md shadow-[#16C784]/20 flex items-center gap-2 active:scale-95"
            >
              <span>Endelea Hatua Inayofuata</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[11px] font-mono text-[#16C784]">
              Hatua ya Mwisho (Uthibitisho)
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
