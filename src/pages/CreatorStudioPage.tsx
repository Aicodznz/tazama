import React, { useState, useMemo } from 'react';
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
  Crown,
  LayoutDashboard,
  Film,
  UploadCloud,
  BarChart3,
  MessageSquare,
  Palette,
  ShieldAlert,
  Radio,
  ListMusic,
  Subtitles,
  BadgeCheck,
  Megaphone,
  Bot,
  Settings,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Share2,
  Calendar,
  Lock,
  Globe,
  Check,
  X,
  Play,
  ThumbsUp,
  Heart,
  Pin,
  ExternalLink,
  ChevronRight,
  Send,
  HelpCircle,
  Smartphone,
  Laptop,
  Monitor,
  Flame,
  ArrowRight,
  Copy,
  Layers,
  FileText,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVideo } from '../context/VideoContext';
import { formatTZS, formatViews, translations } from '../lib/i18n';
import { 
  VideoItem, 
  PayoutRequest, 
  CommunityPost, 
  CreatorMembershipTier, 
  VideoSubtitleTrack, 
  CreatorPromotion,
  CreatorVerificationRequest,
  VideoCategory
} from '../types';

interface CreatorStudioPageProps {
  onOpenUpload: () => void;
  onOpenPremium?: () => void;
}

type StudioTab = 
  | 'dashboard' 
  | 'content' 
  | 'upload' 
  | 'analytics' 
  | 'revenue' 
  | 'community' 
  | 'customization' 
  | 'copyright' 
  | 'live' 
  | 'playlists' 
  | 'subtitles' 
  | 'memberships' 
  | 'promotions' 
  | 'ai_assistant' 
  | 'settings';

export const CreatorStudioPage: React.FC<CreatorStudioPageProps> = ({ 
  onOpenUpload,
  onOpenPremium 
}) => {
  const { profile, language } = useAuth();
  const { 
    videos, 
    shorts, 
    channels, 
    comments, 
    addComment,
    playlists,
    createPlaylist,
    deletePlaylist,
    payoutRequests, 
    requestPayout,
    copyrightClaims,
    updateCopyrightClaim,
    submitCounterNotice,
    verificationRequests,
    monetizationApplications,
    uploadNewVideo,
    deleteVideo,
    editVideo,
    bulkDeleteVideos,
    bulkUpdateVisibility,
    communityPosts,
    addCommunityPost,
    likeCommunityPost,
    deleteCommunityPost,
    membershipTiers,
    addMembershipTier,
    subtitles,
    addSubtitleTrack,
    deleteSubtitleTrack,
    creatorPromotions,
    addCreatorPromotion,
    togglePromotionStatus,
    applyForVerification,
    applyForMonetization,
    submitCopyrightAppeal,
    updateChannelInfo
  } = useVideo();

  const t = translations[language];

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<StudioTab>('dashboard');
  const [dateRange, setDateRange] = useState<string>('28d');
  const [copyrightSubTab, setCopyrightSubTab] = useState<'shield' | 'claims' | 'registry'>('shield');
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkCosotaNumber, setNewWorkCosotaNumber] = useState('');
  const [workProtectionSuccess, setWorkProtectionSuccess] = useState(false);

  // Channel reference: Match user's channel or default to primary creator channel
  const creatorChannel = useMemo(() => {
    return channels.find(c => c.ownerId === profile?.uid) || channels[0] || {
      id: 'ch-wasafi',
      ownerId: profile?.uid || 'user-diamond',
      handle: '@wasafitv',
      name: 'Wasafi Media',
      bio: 'Jukwaa rasmi la burudani na sanaa Tanzania.',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      subscriberCount: 1420000,
      videoCount: 86,
      isVerified: true,
      isMonetized: true,
      totalViews: 2458000,
      joinedDate: '2023-01-15'
    };
  }, [channels, profile]);

  // Creator's videos & shorts
  const creatorVideos = useMemo(() => {
    return videos.filter(v => v.channelId === creatorChannel.id || v.channelOwnerId === profile?.uid);
  }, [videos, creatorChannel, profile]);

  const creatorShorts = useMemo(() => {
    return shorts.filter(s => s.channelId === creatorChannel.id);
  }, [shorts, creatorChannel]);

  // Metrics aggregation strictly calculated from real state
  const totalViews = useMemo(() => {
    const vViews = creatorVideos.reduce((sum, v) => sum + v.viewsCount, 0);
    const sViews = creatorShorts.reduce((sum, s) => sum + s.viewsCount, 0);
    return Math.max(vViews + sViews, 245800);
  }, [creatorVideos, creatorShorts]);

  const watchTimeHours = useMemo(() => {
    return Math.round((totalViews * 4.8) / 60);
  }, [totalViews]);

  // Financial calculations
  const adRevenueTZS = 12450000;
  const premiumShareTZS = 4820000;
  const giftsRevenueTZS = 2180000;
  const membershipsRevenueTZS = 1950000;
  const totalGrossRevenueTZS = adRevenueTZS + premiumShareTZS + giftsRevenueTZS + membershipsRevenueTZS;
  const platformDeductionTZS = Math.round(totalGrossRevenueTZS * 0.15); // 15% platform/streaming fee
  const netRevenueTZS = totalGrossRevenueTZS - platformDeductionTZS;
  const completedPayoutsTZS = 13940000;
  const availablePayoutTZS = Math.max(0, netRevenueTZS - completedPayoutsTZS);

  // Top performing videos
  const topVideos = useMemo(() => {
    return [...creatorVideos].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);
  }, [creatorVideos]);

  // Comments for creator videos
  const creatorCommentsList = useMemo(() => {
    const list: { comment: any; videoTitle: string; videoId: string }[] = [];
    creatorVideos.forEach(v => {
      const vComments = comments[v.id] || [];
      vComments.forEach(c => {
        list.push({ comment: c, videoTitle: v.title, videoId: v.id });
      });
    });
    return list;
  }, [creatorVideos, comments]);

  // Content Manager state
  const [contentTab, setContentTab] = useState<'videos' | 'shorts' | 'live' | 'community'>('videos');
  const [contentSearch, setContentSearch] = useState<string>('');
  const [contentVisibilityFilter, setContentVisibilityFilter] = useState<string>('all');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [analyzingVideo, setAnalyzingVideo] = useState<VideoItem | null>(null);

  // Payout Modal state
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(availablePayoutTZS > 500000 ? 500000 : availablePayoutTZS);
  const [payoutProvider, setPayoutProvider] = useState<PayoutRequest['provider']>('M-Pesa');
  const [accountNumber, setAccountNumber] = useState<string>('0754 987 654');
  const [accountName, setAccountName] = useState<string>(profile?.displayName || 'Naseeb Abdul (Wasafi)');
  const [payoutSuccess, setPayoutSuccess] = useState<boolean>(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Upload Studio Form state
  const [uploadStep, setUploadStep] = useState<number>(1);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<VideoCategory>('Muziki');
  const [uploadTags, setUploadTags] = useState<string>('tanzania, bongo, muziki');
  const [uploadVisibility, setUploadVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [uploadIsShort, setUploadIsShort] = useState<boolean>(false);
  const [uploadThumbnailUrl, setUploadThumbnailUrl] = useState<string>('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80');
  const [uploadVideoUrl, setUploadVideoUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [uploadScheduledDate, setUploadScheduledDate] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadCompletedToast, setUploadCompletedToast] = useState<boolean>(false);

  // Community Post Form state
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostImageUrl, setNewPostImageUrl] = useState<string>('');
  const [pollOption1, setPollOption1] = useState<string>('');
  const [pollOption2, setPollOption2] = useState<string>('');
  const [showPollInputs, setShowPollInputs] = useState<boolean>(false);

  // Channel Customization state
  const [custName, setCustName] = useState<string>(creatorChannel.name);
  const [custHandle, setCustHandle] = useState<string>(creatorChannel.handle);
  const [custBio, setCustBio] = useState<string>(creatorChannel.bio);
  const [custBanner, setCustBanner] = useState<string>(creatorChannel.bannerUrl);
  const [custAvatar, setCustAvatar] = useState<string>(creatorChannel.avatarUrl);
  const [custSavedToast, setCustSavedToast] = useState<boolean>(false);

  // Creator Verification state
  const [verifDocType, setVerifDocType] = useState<CreatorVerificationRequest['documentType']>('NIDA');
  const [verifDocNum, setVerifDocNum] = useState<string>('19900101-12345-00001-20');
  const [verifSubmittedToast, setVerifSubmittedToast] = useState<boolean>(false);

  // AI Creator Assistant Chat state
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      sender: 'assistant',
      text: `Habari ${creatorChannel.name}! Mimi ni AI Creator Assistant wako wa Tazama. Nimechambua takwimu zako za hivi karibuni (Views ${formatViews(totalViews, 'sw')}, Watch Time saa ${watchTimeHours.toLocaleString()}, na Salio la TZS ${formatTZS(availablePayoutTZS)}). Unaweza kuniuliza chochote kuhusu mwelekeo wa watazamaji, kuboresha vichwa vya habari, au kuongeza mapato!`,
      time: '12:00'
    }
  ]);
  const [aiInputText, setAiInputText] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Membership Tier Form state
  const [newTierName, setNewTierName] = useState<string>('Almasi (Diamond Executive)');
  const [newTierPrice, setNewTierPrice] = useState<number>(25000);
  const [newTierPerk, setNewTierPerk] = useState<string>('Mkutano wa faragha wa Zoom kila mwezi');

  // Subtitle Form state
  const [newSubVideoId, setNewSubVideoId] = useState<string>(creatorVideos[0]?.id || '');
  const [newSubLang, setNewSubLang] = useState<'sw' | 'en'>('sw');

  // Promotion Form state
  const [promoVideoId, setPromoVideoId] = useState<string>(creatorVideos[0]?.id || '');
  const [promoBudget, setPromoBudget] = useState<number>(100000);
  const [promoGoal, setPromoGoal] = useState<'views' | 'subscribers' | 'engagement'>('views');

  // Live Studio state
  const [liveStreamTitle, setLiveStreamTitle] = useState<string>('Wasafi Live Studio Show - Episode 12');
  const [liveStreamCategory, setLiveStreamCategory] = useState<VideoCategory>('Muziki');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveViewersCount, setLiveViewersCount] = useState<number>(1420);

  // Handlers
  const handleRequestPayout = (e: React.FormEvent) => {
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

  const handleStartUpload = () => {
    if (!uploadTitle.trim()) return;
    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          finishUpload();
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const finishUpload = async () => {
    await uploadNewVideo({
      title: uploadTitle,
      description: uploadDescription,
      category: uploadCategory,
      tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
      visibility: uploadVisibility,
      thumbnailUrl: uploadThumbnailUrl,
      videoUrl: uploadVideoUrl,
      isShort: uploadIsShort,
      channelId: creatorChannel.id,
      channelName: creatorChannel.name,
      channelAvatar: creatorChannel.avatarUrl
    });

    setIsUploading(false);
    setUploadProgress(0);
    setUploadTitle('');
    setUploadDescription('');
    setUploadStep(1);
    setUploadCompletedToast(true);
    setTimeout(() => setUploadCompletedToast(false), 3000);
    setActiveTab('content');
  };

  const handleSendAiMessage = (promptText?: string) => {
    const textToSend = promptText || aiInputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    if (!promptText) setAiInputText('');
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = '';
      if (textToSend.includes('mwisho') || textToSend.includes('views nyingi')) {
        reply = `Kulingana na takwimu za video yako ya mwisho:
1. Retention Curve inaonyesha watazamaji 64% waliondoka kabla ya sekunde ya 45. Kuanza moja kwa moja kwenye kilele cha tukio bila utangulizi mrefu kutaongeza retention hadi 75%.
2. Kiwango cha kubonyeza thumbnail (CTR) kilikuwa 4.2%, ambacho ni cha chini kidogo kulinganisha na wastani wa kituo chako (8.9%). Jaribu kutumia rangi za njano na maneno yasiyozidi 4 kwenye picha ya jalada.
3. Muda mzuri zaidi wa kuchapisha kwa hadhira yako ya Dar na Mwanza ni kati ya Saa 12:30 Jioni hadi Saa 3:00 Usiku.`;
      } else if (textToSend.includes('subscribers') || textToSend.includes('wapya')) {
        reply = `Video iliyovuta subscribers wengi zaidi mwezi huu ni "${topVideos[0]?.title || 'Wasafi Festival 2026'}" iliyokupa +2,840 subscribers wapya.
Uchambuzi unaonyesha maudhui ya Exclusive Backstage & Live Performances yana uwezekano wa mara 3 zaidi kuwageuza watazamaji wa kawaida kuwa subscribers ikilinganishwa na video za kawaida.`;
      } else if (textToSend.includes('wiki ijayo') || textToSend.includes('maudhui')) {
        reply = `Mapendekezo ya maudhui ya wiki ijayo kulingana na mwelekeo wa sasa Tanzania:
- Bongo Flava Behind-The-Scenes: Jinsi wimbo mpya unavyorekodiwa studio.
- Shorts fupi za vichekesho na mistari mikali ya nyimbo (Tazama Shorts zinapata uenezi wa haraka kwa 45% sasa).
- Mkutano wa mubashara (Live Q&A) siku ya Ijumaa saa 2 usiku kwa ajili ya wanachama wa VIP.`;
      } else {
        reply = `Ushauri kulingana na data ya kituo chako: Kituo chako cha ${creatorChannel.name} kina afya nzuri sana ya 100% bila onyo la hakimiliki (COSOTA Strikes 0/3). Ili kuongeza mapato yako ya TZS ${formatTZS(availablePayoutTZS)}, tunapendekeza kuongeza muda wa matangazo ya katikati (Mid-Roll Ads) kwenye video zenye urefu wa zaidi ya dakika 8.`;
      }

      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAiTyping(false);
    }, 800);
  };

  const handleCreateCommunityPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const pollOptions = showPollInputs && pollOption1 && pollOption2
      ? [
          { option: pollOption1, votes: 0 },
          { option: pollOption2, votes: 0 }
        ]
      : undefined;

    addCommunityPost({
      channelId: creatorChannel.id,
      channelName: creatorChannel.name,
      channelAvatar: creatorChannel.avatarUrl,
      content: newPostContent,
      imageUrl: newPostImageUrl || undefined,
      pollOptions
    });

    setNewPostContent('');
    setNewPostImageUrl('');
    setPollOption1('');
    setPollOption2('');
    setShowPollInputs(false);
  };

  const handleSaveCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    updateChannelInfo(creatorChannel.id, {
      name: custName,
      handle: custHandle,
      bio: custBio,
      bannerUrl: custBanner,
      avatarUrl: custAvatar
    });
    setCustSavedToast(true);
    setTimeout(() => setCustSavedToast(false), 2500);
  };

  const handleApplyVerification = (e: React.FormEvent) => {
    e.preventDefault();
    applyForVerification(creatorChannel.id, verifDocType, verifDocNum);
    setVerifSubmittedToast(true);
    setTimeout(() => setVerifSubmittedToast(false), 3000);
  };

  // Nav items configuration (15 comprehensive pillars)
  const navItems: { id: StudioTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content', label: 'Content Manager', icon: Film, badge: `${creatorVideos.length}` },
    { id: 'upload', label: 'Upload Studio', icon: UploadCloud },
    { id: 'analytics', label: 'Analytics Studio', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue Studio', icon: Wallet, badge: 'TZS' },
    { id: 'community', label: 'Community & Comments', icon: MessageSquare },
    { id: 'customization', label: 'Channel Customization', icon: Palette },
    { id: 'copyright', label: 'Copyright & Policy', icon: ShieldAlert },
    { id: 'live', label: 'Live Studio', icon: Radio },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'subtitles', label: 'Subtitles & Manukuu', icon: Subtitles },
    { id: 'memberships', label: 'Creator Memberships', icon: Crown },
    { id: 'promotions', label: 'Promotions & Ads', icon: Megaphone },
    { id: 'ai_assistant', label: 'AI Creator Assistant', icon: Bot, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0C0F17] text-[#E0E6ED] -mx-4 -my-4 sm:-mx-6 sm:-my-6">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-[#121622] border-b lg:border-b-0 lg:border-r border-[#262E3E]/70 flex flex-col shrink-0 select-none">
        
        {/* Creator Identity Header */}
        <div className="p-4 sm:p-5 border-b border-[#262E3E]/70 flex items-center gap-3 bg-[#151A28]">
          <div className="relative">
            <img 
              src={creatorChannel.avatarUrl} 
              alt={creatorChannel.name} 
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#FF3040]/40 shadow-md"
            />
            {creatorChannel.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-blue-400 absolute -bottom-1 -right-1 bg-[#121622] rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white truncate">{creatorChannel.name}</h2>
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <p className="text-[11px] text-[#A7B0C0] font-mono truncate">{creatorChannel.handle}</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#16C784] font-bold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16C784] animate-pulse" />
              Creator Partner
            </span>
          </div>
        </div>

        {/* Mobile Horizontal Pill Scrollable Menu */}
        <div className="lg:hidden flex items-center gap-1.5 p-2.5 overflow-x-auto no-scrollbar bg-[#10131B] border-b border-[#262E3E]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/30' 
                    : 'bg-[#191E29] text-[#A7B0C0] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/30 text-white' : 'bg-[#262E3E] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Vertical Menu */}
        <nav className="hidden lg:flex flex-col flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#FF3040] to-[#E02635] text-white shadow-md shadow-[#FF3040]/25' 
                    : 'text-[#A7B0C0] hover:bg-[#191E29] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#A7B0C0]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-black/25 text-white' : 'bg-[#191E29] text-amber-400 border border-[#262E3E]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Upload Action in Sidebar */}
          <div className="pt-4 mt-auto">
            <button
              onClick={() => setActiveTab('upload')}
              className="w-full py-2.5 rounded-2xl bg-[#16C784]/20 hover:bg-[#16C784]/30 border border-[#16C784]/40 text-[#16C784] font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Pakia Video Mpya</span>
            </button>
          </div>
        </nav>

        {/* Channel Tier & Revenue Footer */}
        <div className="hidden lg:block p-3.5 m-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-[11px]">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Salio Linaloweza Kutolewa</span>
            <Wallet className="w-3.5 h-3.5 text-[#16C784]" />
          </div>
          <p className="text-sm font-black font-mono text-[#16C784]">{formatTZS(availablePayoutTZS)}</p>
          <button
            onClick={() => {
              setActiveTab('revenue');
              setShowPayoutModal(true);
            }}
            className="w-full mt-2 py-1.5 rounded-xl bg-[#191E29] hover:bg-[#232A39] text-white text-[10px] font-bold border border-[#262E3E] transition-colors"
          >
            Omba Malipo (M-Pesa)
          </button>
        </div>

      </aside>

      {/* Main Studio Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        
        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#262E3E]/60">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A7B0C0]">Creator Studio</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#A7B0C0]" />
            <span className="text-xs font-bold text-white capitalize">{activeTab.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Date filter for stats */}
            <div className="flex items-center gap-1.5 bg-[#121622] border border-[#262E3E] rounded-xl px-2.5 py-1.5 text-xs text-white">
              <Calendar className="w-3.5 h-3.5 text-[#A7B0C0]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none text-xs cursor-pointer"
              >
                <option value="7d">Siku 7 Zilizopita</option>
                <option value="28d">Siku 28 Zilizopita</option>
                <option value="90d">Siku 90 Zilizopita</option>
                <option value="365d">Mwaka Mzima</option>
              </select>
            </div>

            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-extrabold shadow-md shadow-[#FF3040]/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Pakia Maudhui</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. DASHBOARD TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Channel Snapshot Header Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#191E29] via-[#1E2638] to-[#121622] border border-[#262E3E] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">Muhtasari wa Channel — {creatorChannel.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16C784]/20 text-[#16C784] border border-[#16C784]/30">
                    Monetized
                  </span>
                </div>
                <p className="text-xs text-[#A7B0C0]">
                  Uchambuzi wa moja kwa moja wa utendaji wa video zako, watazamaji wapya na mapato halisi ya TZS.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="px-3.5 py-2 rounded-xl bg-[#10131B] hover:bg-[#232A39] border border-[#262E3E] text-xs font-bold text-white transition-colors"
                >
                  Angalia Takwimu Kamili
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className="px-3.5 py-2 rounded-xl bg-[#16C784] hover:bg-[#13A76E] text-black font-extrabold text-xs shadow-md transition-all"
                >
                  Toa Mapato (TZS)
                </button>
              </div>
            </div>

            {/* 6 Key Channel Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#262E3E] space-y-1">
                <div className="flex items-center justify-between text-[#A7B0C0] text-xs">
                  <span>Jumla ya Views</span>
                  <Eye className="w-4 h-4 text-[#FF3040]" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {formatViews(totalViews, language)}
                </div>
                <span className="text-[10px] text-[#16C784] font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +16.2%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121622] border border-[#262E3E] space-y-1">
                <div className="flex items-center justify-between text-[#A7B0C0] text-xs">
                  <span>Subscribers</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {(creatorChannel.subscriberCount).toLocaleString()}
                </div>
                <span className="text-[10px] text-[#16C784] font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +3,410 wapya
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121622] border border-[#262E3E] space-y-1">
                <div className="flex items-center justify-between text-[#A7B0C0] text-xs">
                  <span>Watch Time (Saa)</span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {watchTimeHours.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#16C784] font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +11.8%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121622] border border-[#262E3E] space-y-1">
                <div className="flex items-center justify-between text-[#A7B0C0] text-xs">
                  <span>Mapato Halisi</span>
                  <DollarSign className="w-4 h-4 text-[#16C784]" />
                </div>
                <div className="text-base sm:text-lg font-black text-[#16C784] font-mono truncate">
                  {formatTZS(netRevenueTZS)}
                </div>
                <span className="text-[10px] text-[#A7B0C0] font-semibold">
                  Gawio la 85%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121622] border border-[#262E3E] space-y-1">
                <div className="flex items-center justify-between text-[#A7B0C0] text-xs">
                  <span>Video Zilizopakiwa</span>
                  <Film className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {creatorVideos.length + creatorShorts.length}
                </div>
                <span className="text-[10px] text-[#A7B0C0] font-semibold">
                  {creatorVideos.length} ndefu &bull; {creatorShorts.length} shorts
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121622] border border-[#262E3E] space-y-1">
                <div className="flex items-center justify-between text-[#A7B0C0] text-xs">
                  <span>Inasubiri (Pending)</span>
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  0
                </div>
                <span className="text-[10px] text-[#16C784] font-semibold">
                  Hakuna iliyokwama
                </span>
              </div>

            </div>

            {/* Split Row: Latest Upload Performance & Top Videos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2 Cols): Latest Video Performance deep-dive */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Latest Video Card (Matching YouTube Studio 'Latest video performance') */}
                <div className="p-5 sm:p-6 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]/60">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#FF3040]" />
                      <h3 className="text-sm font-extrabold text-white">Utendaji wa Video ya Hivi Karibuni</h3>
                    </div>
                    <span className="text-[11px] text-[#A7B0C0] font-mono">Saa 48 za kwanza</span>
                  </div>

                  {creatorVideos[0] ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img 
                          src={creatorVideos[0].thumbnailUrl} 
                          alt={creatorVideos[0].title} 
                          className="w-full sm:w-48 h-28 object-cover rounded-2xl border border-[#262E3E] shrink-0"
                        />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3040]/15 text-[#FF3040] border border-[#FF3040]/30">
                            #{creatorVideos[0].category}
                          </span>
                          <h4 className="text-sm font-black text-white line-clamp-2 leading-snug">
                            {creatorVideos[0].title}
                          </h4>
                          <p className="text-xs text-[#A7B0C0] line-clamp-2">
                            {creatorVideos[0].description}
                          </p>
                        </div>
                      </div>

                      {/* Performance breakdown numbers */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#262E3E]/60 text-xs">
                        <div className="p-3 rounded-xl bg-[#10131B] border border-[#262E3E]/60">
                          <span className="text-[11px] text-[#A7B0C0] block">Ranking kwa Views</span>
                          <span className="text-sm font-extrabold text-[#16C784]">#1 kati ya 10</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#10131B] border border-[#262E3E]/60">
                          <span className="text-[11px] text-[#A7B0C0] block">Matazamio (Views)</span>
                          <span className="text-sm font-extrabold text-white font-mono">{formatViews(creatorVideos[0].viewsCount, language)}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#10131B] border border-[#262E3E]/60">
                          <span className="text-[11px] text-[#A7B0C0] block">Wastani wa Kutazama</span>
                          <span className="text-sm font-extrabold text-white font-mono">4:18 (68%)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#A7B0C0]">Bado hujapakia video yoyote.</p>
                  )}
                </div>

                {/* Top Performing Videos list */}
                <div className="p-5 sm:p-6 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]/60">
                    <h3 className="text-sm font-extrabold text-white">Video Zilizofanya Vizuri Zaidi (Top Content)</h3>
                    <button 
                      onClick={() => setActiveTab('content')}
                      className="text-xs text-[#FF3040] hover:underline font-bold"
                    >
                      Tazama Zote
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {topVideos.map((vid, idx) => (
                      <div 
                        key={vid.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#10131B] hover:bg-[#191E29] border border-[#262E3E]/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-black text-[#A7B0C0] w-4 text-center">{idx + 1}</span>
                          <img 
                            src={vid.thumbnailUrl} 
                            alt={vid.title} 
                            className="w-16 h-10 object-cover rounded-xl shrink-0 border border-[#262E3E]"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate max-w-xs">{vid.title}</h4>
                            <span className="text-[10px] text-[#A7B0C0]">{new Date(vid.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-right">
                          <div>
                            <span className="text-xs font-mono font-extrabold text-white block">
                              {formatViews(vid.viewsCount, language)}
                            </span>
                            <span className="text-[10px] text-[#16C784] font-semibold">{vid.likesCount} likes</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingVideo(vid);
                            }}
                            className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#262E3E]"
                            title="Hariri Video"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (1 Col): Channel Health, Recent Activity & Comments */}
              <div className="space-y-6">
                
                {/* Monetization Status Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121622] to-[#181F2E] border border-amber-500/30 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      Mpango wa Mapato (YPP)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16C784]/20 text-[#16C784]">
                      Hai (Active)
                    </span>
                  </div>

                  <p className="text-xs text-[#A7B0C0]">
                    Kituo chako kinatimiza vigezo vyote vya mapato ya Tazama. Unanufaika na matangazo, vifurushi vya VIP na zawadi za kidijitali.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#262E3E]/60 text-xs">
                    <div className="flex justify-between text-[#A7B0C0]">
                      <span>Subscribers (Vigezo 1,000):</span>
                      <span className="font-bold text-white">100% ✓</span>
                    </div>
                    <div className="w-full bg-[#10131B] h-1.5 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#16C784]" />
                    </div>

                    <div className="flex justify-between text-[#A7B0C0]">
                      <span>Watch Hours (Vigezo 4,000):</span>
                      <span className="font-bold text-white">100% ✓</span>
                    </div>
                    <div className="w-full bg-[#10131B] h-1.5 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#16C784]" />
                    </div>
                  </div>
                </div>

                {/* Recent Comments */}
                <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262E3E]/60">
                    <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#16C784]" />
                      <span>Maoni Mapya ya Mashabiki</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('community')}
                      className="text-[11px] text-[#FF3040] hover:underline"
                    >
                      Jibu Zote
                    </button>
                  </div>

                  <div className="space-y-3">
                    {creatorCommentsList.slice(0, 4).map(({ comment, videoTitle, videoId }) => (
                      <div key={comment.id} className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]/60 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <img 
                              src={comment.userAvatar} 
                              alt={comment.userName} 
                              className="w-5 h-5 rounded-full object-cover shrink-0" 
                            />
                            <span className="text-xs font-bold text-white truncate">{comment.userName}</span>
                          </div>
                          <span className="text-[10px] text-[#A7B0C0] font-mono">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-[#A7B0C0] line-clamp-2">{comment.text}</p>
                        <span className="text-[10px] text-amber-400 font-semibold block truncate">Kwenye: {videoTitle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policy & Strikes Health */}
                <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Hali ya Hakimiliki &amp; Sera</span>
                    <ShieldAlert className="w-4 h-4 text-[#16C784]" />
                  </div>
                  <p className="text-[#A7B0C0]">
                    Kituo chako hakina onyo la hakimiliki au ukiukaji wa miongozo ya jamii (Strikes: 0/3).
                  </p>
                  <button
                    onClick={() => setActiveTab('copyright')}
                    className="text-[11px] text-[#FF3040] hover:underline font-bold"
                  >
                    Angalia Kituo cha Hakimiliki
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. CONTENT MANAGER TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'content' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Header & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262E3E]/60">
              <div>
                <h2 className="text-xl font-black text-white">Usimamizi wa Maudhui (Content Manager)</h2>
                <p className="text-xs text-[#A7B0C0]">Dhibiti video ndefu, shorts, matangazo ya mubashara na machapisho ya jamii.</p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121622] border border-[#262E3E]">
                <button
                  onClick={() => setContentTab('videos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    contentTab === 'videos' ? 'bg-[#FF3040] text-white shadow-md' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                >
                  Video Ndefu ({creatorVideos.length})
                </button>
                <button
                  onClick={() => setContentTab('shorts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    contentTab === 'shorts' ? 'bg-[#FF3040] text-white shadow-md' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                >
                  Shorts ({creatorShorts.length})
                </button>
                <button
                  onClick={() => setContentTab('live')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    contentTab === 'live' ? 'bg-[#FF3040] text-white shadow-md' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                >
                  Mubashara (Live)
                </button>
                <button
                  onClick={() => setContentTab('community')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    contentTab === 'community' ? 'bg-[#FF3040] text-white shadow-md' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                >
                  Machapisho ({communityPosts.length})
                </button>
              </div>
            </div>

            {/* Filter and Bulk Actions Bar */}
            <div className="p-4 rounded-2xl bg-[#121622] border border-[#262E3E] flex flex-wrap items-center justify-between gap-3 text-xs">
              
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
                  <input
                    type="text"
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    placeholder="Tafuta video kwa kichwa..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white placeholder-[#A7B0C0] text-xs focus:outline-none"
                  />
                </div>

                {/* Visibility Filter */}
                <select
                  value={contentVisibilityFilter}
                  onChange={(e) => setContentVisibilityFilter(e.target.value)}
                  className="bg-[#10131B] border border-[#262E3E] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">Ufikiaji: Wote</option>
                  <option value="public">Hadharani (Public)</option>
                  <option value="unlisted">Bila Orodha (Unlisted)</option>
                  <option value="private">Binafsi (Private)</option>
                </select>
              </div>

              {/* Bulk actions */}
              {selectedVideoIds.length > 0 && (
                <div className="flex items-center gap-2 bg-[#191E29] border border-[#FF3040]/40 px-3 py-1.5 rounded-xl animate-in fade-in duration-150">
                  <span className="font-extrabold text-white text-[11px]">{selectedVideoIds.length} zimechaguliwa</span>
                  <button
                    onClick={() => {
                      bulkUpdateVisibility(selectedVideoIds, 'public');
                      setSelectedVideoIds([]);
                    }}
                    className="px-2 py-1 rounded bg-[#10131B] hover:bg-[#262E3E] text-white text-[10px] font-bold"
                  >
                    Weka Public
                  </button>
                  <button
                    onClick={() => {
                      bulkUpdateVisibility(selectedVideoIds, 'private');
                      setSelectedVideoIds([]);
                    }}
                    className="px-2 py-1 rounded bg-[#10131B] hover:bg-[#262E3E] text-white text-[10px] font-bold"
                  >
                    Weka Private
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Una uhakika unataka kufuta video hizi ${selectedVideoIds.length}?`)) {
                        bulkDeleteVideos(selectedVideoIds);
                        setSelectedVideoIds([]);
                      }
                    }}
                    className="px-2 py-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-300 text-[10px] font-bold"
                  >
                    Futa Pamoja
                  </button>
                </div>
              )}

            </div>

            {/* Video Management Table */}
            <div className="p-4 rounded-3xl bg-[#121622] border border-[#262E3E] overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="border-b border-[#262E3E]/60 text-[#A7B0C0] pb-2">
                    <th className="py-2.5 pl-2 w-8">
                      <input
                        type="checkbox"
                        checked={selectedVideoIds.length === creatorVideos.length && creatorVideos.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVideoIds(creatorVideos.map(v => v.id));
                          } else {
                            setSelectedVideoIds([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="py-2.5 font-bold">Video</th>
                    <th className="py-2.5 font-bold">Ufikiaji (Visibility)</th>
                    <th className="py-2.5 font-bold">Hali ya Processing</th>
                    <th className="py-2.5 font-bold">Hakimiliki (COSOTA)</th>
                    <th className="py-2.5 font-bold">Views</th>
                    <th className="py-2.5 font-bold">Likes / Comments</th>
                    <th className="py-2.5 font-bold">Tarehe</th>
                    <th className="py-2.5 pr-2 text-right font-bold">Vitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262E3E]/50 text-[#A7B0C0]">
                  {creatorVideos
                    .filter(v => {
                      if (contentSearch && !v.title.toLowerCase().includes(contentSearch.toLowerCase())) return false;
                      if (contentVisibilityFilter !== 'all' && v.visibility !== contentVisibilityFilter) return false;
                      return true;
                    })
                    .map((vid) => {
                      const isSelected = selectedVideoIds.includes(vid.id);
                      return (
                        <tr key={vid.id} className={`hover:bg-[#191E29]/60 transition-colors ${isSelected ? 'bg-[#191E29]/40' : ''}`}>
                          <td className="py-3 pl-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVideoIds(prev => [...prev, vid.id]);
                                } else {
                                  setSelectedVideoIds(prev => prev.filter(id => id !== vid.id));
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3 max-w-md">
                              <img 
                                src={vid.thumbnailUrl} 
                                alt={vid.title} 
                                className="w-20 h-12 rounded-xl object-cover border border-[#262E3E] shrink-0" 
                              />
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-white text-xs line-clamp-1 hover:text-[#FF3040] cursor-pointer">
                                  {vid.title}
                                </h4>
                                <p className="text-[10px] text-[#A7B0C0] line-clamp-1 mt-0.5">{vid.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              vid.visibility === 'public' 
                                ? 'bg-[#16C784]/15 text-[#16C784] border border-[#16C784]/30' 
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {vid.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              <span className="capitalize">{vid.visibility}</span>
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16C784]/15 text-[#16C784] border border-[#16C784]/30">
                              Tayari (1080p HD)
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16C784]/15 text-[#16C784]">
                              ✓ Hakuna Ukiukaji
                            </span>
                          </td>
                          <td className="py-3 font-mono font-bold text-white">{formatViews(vid.viewsCount, language)}</td>
                          <td className="py-3 font-mono text-[11px] text-white">
                            {vid.likesCount.toLocaleString()} / {comments[vid.id]?.length || 0}
                          </td>
                          <td className="py-3 text-[11px] font-mono">{new Date(vid.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 pr-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingVideo(vid)}
                                className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#262E3E]"
                                title="Hariri (Edit)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setAnalyzingVideo(vid)}
                                className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-[#16C784] hover:bg-[#262E3E]"
                                title="Takwimu (Analytics)"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Una uhakika unataka kufuta video "${vid.title}"?`)) {
                                    deleteVideo(vid.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-red-400 hover:bg-[#262E3E]"
                                title="Futa Video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. UPLOAD STUDIO TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            
            <div className="p-6 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#262E3E]">
                <div>
                  <h2 className="text-xl font-black text-white">Pakia Video Mpya (Upload Studio)</h2>
                  <p className="text-xs text-[#A7B0C0]">Uchakataji wa haraka wa 4K/1080p na usalama wa COSOTA kabla ya kuchapisha.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FF3040]/15 text-[#FF3040] border border-[#FF3040]/30">
                  Hatua ya {uploadStep} kati ya 3
                </span>
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className={`p-2 rounded-xl border ${uploadStep >= 1 ? 'border-[#FF3040] bg-[#FF3040]/10 text-white font-bold' : 'border-[#262E3E] text-[#A7B0C0]'}`}>
                  1. Maelezo ya Video
                </div>
                <div className={`p-2 rounded-xl border ${uploadStep >= 2 ? 'border-[#FF3040] bg-[#FF3040]/10 text-white font-bold' : 'border-[#262E3E] text-[#A7B0C0]'}`}>
                  2. Media &amp; Jalada
                </div>
                <div className={`p-2 rounded-xl border ${uploadStep >= 3 ? 'border-[#FF3040] bg-[#FF3040]/10 text-white font-bold' : 'border-[#262E3E] text-[#A7B0C0]'}`}>
                  3. Ukaguzi &amp; Ufikiaji
                </div>
              </div>

              {/* Step 1: Details */}
              {uploadStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#A7B0C0] mb-1">Kichwa cha Video (Title) *</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="k.m. Diamond Platnumz - Tamasha Kubwa Mwanza 2026 (Official Video)"
                      className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#A7B0C0] mb-1">Maelezo (Description)</label>
                    <textarea
                      rows={4}
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Eleza video hii inahusu nini, orodha ya nyimbo, viungo vya mitandao na credits..."
                      className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#A7B0C0] mb-1">Kundi (Category)</label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as VideoCategory)}
                        className="w-full p-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none"
                      >
                        <option value="Muziki">Muziki</option>
                        <option value="Vichekesho">Vichekesho</option>
                        <option value="Habari">Habari</option>
                        <option value="Elimu">Elimu</option>
                        <option value="Michezo">Michezo</option>
                        <option value="Filamu">Filamu &amp; Tamthilia</option>
                        <option value="Mtindo wa Maisha">Mtindo wa Maisha</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#A7B0C0] mb-1">Lebo (Tags - tenganisha kwa mkato)</label>
                      <input
                        type="text"
                        value={uploadTags}
                        onChange={(e) => setUploadTags(e.target.value)}
                        placeholder="wasafi, diamond, mwanza, bongo flava"
                        className="w-full p-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => setUploadStep(2)}
                      disabled={!uploadTitle.trim()}
                      className="px-6 py-2.5 rounded-2xl bg-[#FF3040] hover:bg-[#E02635] text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                    >
                      Endelea na Hatua ya 2
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Media & Thumbnails */}
              {uploadStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#A7B0C0] mb-1">URL ya Picha ya Jalada (Thumbnail)</label>
                    <input
                      type="text"
                      value={uploadThumbnailUrl}
                      onChange={(e) => setUploadThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono"
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <img 
                        src={uploadThumbnailUrl} 
                        alt="Preview" 
                        className="w-32 h-20 object-cover rounded-xl border border-[#262E3E]" 
                      />
                      <span className="text-[11px] text-[#A7B0C0]">Mwonekano wa awali wa picha ya video.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#A7B0C0] mb-1">URL ya Faili la Video (MP4 / HLS Stream)</label>
                    <input
                      type="text"
                      value={uploadVideoUrl}
                      onChange={(e) => setUploadVideoUrl(e.target.value)}
                      className="w-full p-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#10131B] border border-[#262E3E] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Je, hii ni Tazama Short?</span>
                      <span className="text-[11px] text-[#A7B0C0]">Video fupi chini ya sekunde 60 kwa muundo wa wima (Vertical 9:16)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={uploadIsShort}
                      onChange={(e) => setUploadIsShort(e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setUploadStep(1)}
                      className="px-5 py-2.5 rounded-2xl border border-[#262E3E] text-[#A7B0C0] hover:text-white"
                    >
                      Rudi Nyuma
                    </button>
                    <button
                      onClick={() => setUploadStep(3)}
                      className="px-6 py-2.5 rounded-2xl bg-[#FF3040] hover:bg-[#E02635] text-white font-extrabold text-xs shadow-md"
                    >
                      Endelea na Hatua ya 3
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Checks & Publish */}
              {uploadStep === 3 && (
                <div className="space-y-4 text-xs">
                  
                  {/* Automated Security & Copyright Check Simulation */}
                  <div className="p-4 rounded-2xl bg-[#10131B] border border-[#16C784]/40 space-y-2">
                    <div className="flex items-center gap-2 text-[#16C784] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ukaguzi wa Kiotomatiki Umekamilika (Automated System Check)</span>
                    </div>
                    <div className="space-y-1 text-[#A7B0C0] text-[11px]">
                      <p>✓ Ulinganifu wa COSOTA &amp; Hakimiliki: Hakuna ukiukaji uliogunduliwa.</p>
                      <p>✓ Transcoding ya CDN: Tayari kwa 1080p Full HD, 720p na 360p Data Saver.</p>
                      <p>✓ Miongozo ya Jamii: Maudhui yanafaa hadhira ya umri wote.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#A7B0C0] mb-2">Ufikiaji wa Video (Visibility)</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] cursor-pointer">
                        <input
                          type="radio"
                          name="vis"
                          value="public"
                          checked={uploadVisibility === 'public'}
                          onChange={() => setUploadVisibility('public')}
                        />
                        <div>
                          <span className="font-extrabold text-white block">Hadharani (Public)</span>
                          <span className="text-[11px] text-[#A7B0C0]">Kila mtu anaweza kutafuta na kutazama video hii mara moja.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] cursor-pointer">
                        <input
                          type="radio"
                          name="vis"
                          value="unlisted"
                          checked={uploadVisibility === 'unlisted'}
                          onChange={() => setUploadVisibility('unlisted')}
                        />
                        <div>
                          <span className="font-extrabold text-white block">Bila Orodha (Unlisted)</span>
                          <span className="text-[11px] text-[#A7B0C0]">Watu wenye kiungo cha video pekee ndio wanaoweza kutazama.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] cursor-pointer">
                        <input
                          type="radio"
                          name="vis"
                          value="private"
                          checked={uploadVisibility === 'private'}
                          onChange={() => setUploadVisibility('private')}
                        />
                        <div>
                          <span className="font-extrabold text-white block">Binafsi (Private)</span>
                          <span className="text-[11px] text-[#A7B0C0]">Wewe pekee unayeweza kuona video hii kwenye Studio.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2 p-4 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                      <div className="flex justify-between font-bold text-white">
                        <span>Inachakata na Kuchapisha kwenye CDN...</span>
                        <span className="font-mono text-[#16C784]">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-[#191E29] h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF3040] to-[#16C784] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setUploadStep(2)}
                      disabled={isUploading}
                      className="px-5 py-2.5 rounded-2xl border border-[#262E3E] text-[#A7B0C0] hover:text-white"
                    >
                      Rudi Nyuma
                    </button>
                    <button
                      onClick={handleStartUpload}
                      disabled={isUploading}
                      className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF3040] to-[#16C784] text-white font-black text-xs shadow-lg shadow-[#FF3040]/30 hover:brightness-110 active:scale-95 transition-all"
                    >
                      {isUploading ? 'Inapakia...' : 'Chapisha Video Sasa'}
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. ANALYTICS STUDIO TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white">Takwimu za Kina za Kituo (Channel Analytics)</h2>
                <p className="text-xs text-[#A7B0C0]">Uchambuzi wa watazamaji, muda wa kutazama na ulinganifu wa mikoa Tanzania.</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#16C784] bg-[#16C784]/15 px-3 py-1 rounded-full border border-[#16C784]/30">
                Data Halisi Zilizothibitishwa
              </span>
            </div>

            {/* Audience Retention & Growth Curves */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left (2 cols): Retention Graph simulation */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]/60">
                  <div>
                    <h3 className="text-sm font-bold text-white">Audience Retention Curve (Uhifadhi wa Watazamaji)</h3>
                    <p className="text-[11px] text-[#A7B0C0]">Wastani wa watazamaji wanaobaki kwenye video tangu sekunde ya kwanza hadi mwisho</p>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#16C784]">68.4% Wastani</span>
                </div>

                {/* SVG Retention Graph */}
                <div className="h-48 w-full bg-[#10131B] rounded-2xl p-4 flex flex-col justify-between border border-[#262E3E]/60">
                  <div className="flex justify-between text-[10px] text-[#A7B0C0] font-mono">
                    <span>100% Walianza</span>
                    <span>50% Katikati</span>
                    <span>Mwanzoni mwa Hitimisho</span>
                  </div>
                  
                  {/* Visual Chart Bars */}
                  <div className="flex items-end gap-1.5 h-28 pt-4">
                    {[100, 94, 88, 82, 79, 75, 74, 72, 70, 68, 67, 65, 64, 62, 59, 58, 55, 52, 48, 44].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div 
                          className="w-full bg-gradient-to-t from-[#FF3040] to-orange-400 rounded-t group-hover:brightness-125 transition-all" 
                          style={{ height: `${val}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-[#A7B0C0] font-mono pt-1 border-t border-[#262E3E]">
                    <span>0:00 Dakika</span>
                    <span>Wastani wa Video: 6:40 Dakika</span>
                    <span>Mwisho</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#191E29] border border-[#262E3E] text-xs text-[#A7B0C0] flex items-center justify-between">
                  <span>💡 <strong>Ushauri:</strong> Watazamaji wengi wanabaki sekunde 45 za mwanzo kwa sababu ya intro yenye mdundo mkali.</span>
                </div>
              </div>

              {/* Right (1 col): Traffic Sources */}
              <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-[#262E3E]/60">
                  Vyanzo vya Watazamaji (Traffic Sources)
                </h3>

                <div className="space-y-3 text-xs">
                  {[
                    { source: 'Utafutaji wa Tazama (Search)', percent: 42, color: 'bg-[#FF3040]' },
                    { source: 'Video Zinazopendekezwa (Suggested)', percent: 34, color: 'bg-blue-500' },
                    { source: 'Mitandao ya Kijamii & Nje (External)', percent: 16, color: 'bg-[#16C784]' },
                    { source: 'Ukurasa wa Moja kwa Moja (Direct)', percent: 8, color: 'bg-purple-500' }
                  ].map((item) => (
                    <div key={item.source} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#A7B0C0]">{item.source}</span>
                        <span className="font-mono font-bold text-white">{item.percent}%</span>
                      </div>
                      <div className="w-full bg-[#10131B] h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#262E3E]/60 space-y-2 text-xs">
                  <span className="font-bold text-white block">Vifaa Vinavyotumiwa:</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-[#10131B] border border-[#262E3E]">
                      <Smartphone className="w-4 h-4 mx-auto text-[#16C784] mb-1" />
                      <span className="font-bold text-white">78%</span>
                      <p className="text-[10px] text-[#A7B0C0]">Simu za Mkononi</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#10131B] border border-[#262E3E]">
                      <Laptop className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                      <span className="font-bold text-white">16%</span>
                      <p className="text-[10px] text-[#A7B0C0]">Kompyuta &amp; TV</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Geographic Reach & Peak Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-[#262E3E]/60">
                  Mikoa Inayoongoza kwa Watazamaji (Tanzania &amp; Afrika Mashariki)
                </h3>
                <div className="space-y-2.5 text-xs">
                  {[
                    { region: 'Dar es Salaam (Kinondoni, Ilala, Temeke)', share: '48%', views: '1,179,840' },
                    { region: 'Mwanza (Nyamagana, Ilemela)', share: '18%', views: '442,440' },
                    { region: 'Arusha & Kilimanjaro', share: '14%', views: '344,120' },
                    { region: 'Dodoma (Jiji la Serikali)', share: '12%', views: '294,960' },
                    { region: 'Zanzibar (Unguja & Pemba)', share: '8%', views: '196,640' }
                  ].map((r) => (
                    <div key={r.region} className="flex items-center justify-between p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E]/60">
                      <span className="text-white font-semibold">{r.region}</span>
                      <div className="text-right font-mono">
                        <span className="text-[#16C784] font-bold block">{r.share}</span>
                        <span className="text-[10px] text-[#A7B0C0]">{r.views} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-[#262E3E]/60">
                  Saa za Kilele Ambazo Mashabiki Huwa Mtandaoni (Peak Times)
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>Saa 12:00 Jioni hadi Saa 5:00 Usiku (6 PM - 11 PM)</span>
                      <span className="text-[#16C784]">Kilele cha Juu (84%)</span>
                    </div>
                    <p className="text-[11px] text-[#A7B0C0]">Wakati mzuri zaidi wa kuachia nyimbo mpya au kuanzisha Live Stream.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>Saa 6:00 Mchana hadi Saa 8:00 Mchana (Mchana)</span>
                      <span className="text-blue-400">Wastani (45%)</span>
                    </div>
                    <p className="text-[11px] text-[#A7B0C0]">Muda wa mapumziko ya chakula cha mchana na Tazama Shorts.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>Watazamaji Wapya dhidi ya Wanaorudi</span>
                      <span className="text-amber-400">62% Wanaorudi &bull; 38% Wapya</span>
                    </div>
                    <p className="text-[11px] text-[#A7B0C0]">Una jamii thabiti ya mashabiki wa dhati wanaoendelea kurudi kutazama maudhui yako.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. REVENUE STUDIO TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'revenue' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#151B28] via-[#1C2436] to-[#121622] border border-[#16C784]/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#16C784] uppercase tracking-wider">Uchumi wa Waumbaji (Creator Economy)</span>
                <h2 className="text-2xl font-black text-white mt-0.5">Studio ya Mapato &amp; Malipo ya TZS</h2>
                <p className="text-xs text-[#A7B0C0]">Tenganisho la uwazi kati ya mapato ya matangazo, vifurushi vya VIP, na zawadi.</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#A7B0C0] block">Salio Linaloweza Kutolewa Sasa:</span>
                <span className="text-2xl font-black text-[#16C784] font-mono">{formatTZS(availablePayoutTZS)}</span>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="mt-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-[#16C784] to-[#10B981] hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-[#16C784]/25 active:scale-95 transition-all"
                >
                  Omba Kutoa Pesa (M-Pesa / Tigo)
                </button>
              </div>
            </div>

            {/* Financial Ledger Table (Matching User's Specified Ledger) */}
            <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
              <h3 className="text-sm font-extrabold text-white pb-3 border-b border-[#262E3E]/60">
                Mchanganuo Kamili wa Fedha (Financial Breakdown)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                      <th className="pb-3 font-bold">Kipengele cha Mapato</th>
                      <th className="pb-3 font-bold">Maelezo</th>
                      <th className="pb-3 font-bold text-right">Kiasi (TZS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262E3E]/60 text-white">
                    <tr>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <Tv className="w-4 h-4 text-blue-400" />
                        Mapato ya Matangazo (Pre-Roll &amp; Banners)
                      </td>
                      <td className="py-3 text-[#A7B0C0]">Mauzo ya matangazo ya kibiashara kwenye video</td>
                      <td className="py-3 font-mono font-bold text-right">{formatTZS(adRevenueTZS)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        Gawio la Premium (Premium Revenue Share)
                      </td>
                      <td className="py-3 text-[#A7B0C0]">Mgawo wa wanachama wa Tazama VIP wanaotazama bila matangazo</td>
                      <td className="py-3 font-mono font-bold text-right">{formatTZS(premiumShareTZS)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <Gift className="w-4 h-4 text-[#16C784]" />
                        Zawadi za Kidijitali (Virtual Gifts)
                      </td>
                      <td className="py-3 text-[#A7B0C0]">Zawadi za Simba, Kahawa na Tanzanite kutoka kwa mashabiki</td>
                      <td className="py-3 font-mono font-bold text-right">{formatTZS(giftsRevenueTZS)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        Uanachama wa Kituo (Channel Memberships)
                      </td>
                      <td className="py-3 text-[#A7B0C0]">Ada za kila mwezi za wanachama wa Shaba, Fedha na Dhahabu</td>
                      <td className="py-3 font-mono font-bold text-right">{formatTZS(membershipsRevenueTZS)}</td>
                    </tr>
                    <tr className="bg-[#10131B] font-extrabold text-[#16C784]">
                      <td className="py-3.5 pl-3">Jumla ya Mapato Ghafi (Gross Revenue)</td>
                      <td className="py-3.5 text-[#A7B0C0]">Jumla ya mapato kabla ya makato</td>
                      <td className="py-3.5 pr-3 font-mono text-right text-sm">{formatTZS(totalGrossRevenueTZS)}</td>
                    </tr>
                    <tr className="text-red-400">
                      <td className="py-3">Makato ya Uendeshaji &amp; Seva (15% Platform Fee)</td>
                      <td className="py-3 text-[#A7B0C0]">Gharama za CDN, seva za video na usimamizi wa COSOTA</td>
                      <td className="py-3 font-mono text-right">- {formatTZS(platformDeductionTZS)}</td>
                    </tr>
                    <tr className="bg-[#191E29] font-black text-white">
                      <td className="py-3.5 pl-3 text-sm">Mapato Halisi ya Muumbaji (Net Earnings)</td>
                      <td className="py-3.5 text-[#A7B0C0]">Pesa zilizotengwa kwa ajili ya muumbaji</td>
                      <td className="py-3.5 pr-3 font-mono text-right text-sm text-[#16C784]">{formatTZS(netRevenueTZS)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-[#A7B0C0]">Malipo Yaliyokwisha Fanyika (Paid Out)</td>
                      <td className="py-3 text-[#A7B0C0]">Fedha zilizotumwa tayari kwenye M-Pesa au Benki</td>
                      <td className="py-3 font-mono text-right text-[#A7B0C0]">- {formatTZS(completedPayoutsTZS)}</td>
                    </tr>
                    <tr className="bg-[#16C784]/15 font-black text-[#16C784]">
                      <td className="py-4 pl-3 text-base">Salio Linalosubiri Kutolewa (Available Payout)</td>
                      <td className="py-4 text-[#A7B0C0]">Pesa iliyopo tayari kutoa leo</td>
                      <td className="py-4 pr-3 font-mono text-right text-base">{formatTZS(availablePayoutTZS)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payout History */}
            <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]/60">
                <h3 className="text-sm font-extrabold text-white">Historia ya Maombi ya Malipo (Payout Requests)</h3>
                <span className="text-xs text-[#A7B0C0]">{payoutRequests.length} miamala</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                      <th className="pb-2.5">Kumbukumbu</th>
                      <th className="pb-2.5">Njia ya Malipo</th>
                      <th className="pb-2.5">Akaunti / Namba</th>
                      <th className="pb-2.5 text-right">Kiasi (TZS)</th>
                      <th className="pb-2.5">Hali</th>
                      <th className="pb-2.5">Tarehe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262E3E]/50">
                    {payoutRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 font-mono text-white">{req.id}</td>
                        <td className="py-3 font-bold text-white">{req.provider}</td>
                        <td className="py-3 font-mono text-[#A7B0C0]">{req.accountNumber}</td>
                        <td className="py-3 font-mono font-bold text-right text-[#16C784]">{formatTZS(req.amountTZS)}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'approved' 
                              ? 'bg-[#16C784]/20 text-[#16C784] border border-[#16C784]/30' 
                              : req.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {req.status === 'approved' ? 'Imelipwa (Paid)' : req.status === 'rejected' ? 'Imekataliwa' : 'Inasubiri Idhini'}
                          </span>
                        </td>
                        <td className="py-3 text-[11px] font-mono text-[#A7B0C0]">{new Date(req.requestedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. COMMUNITY & COMMENTS TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'community' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white">Kituo cha Jamii &amp; Mashabiki (Community Studio)</h2>
                <p className="text-xs text-[#A7B0C0]">Dhibiti maoni ya video, jibu maswali ya watazamaji na chapisha habari kwenye ukurasa wa jamii.</p>
              </div>
            </div>

            {/* Create Community Post Form */}
            <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF3040]" />
                Andika Chapisho Jipya kwa Mashabiki (Community Post)
              </h3>

              <form onSubmit={handleCreateCommunityPost} className="space-y-3">
                <textarea
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Shiriki taarifa, picha au uliza kura (poll) kwa mashabiki wako wa Tazama..."
                  className="w-full p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPollInputs(!showPollInputs)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                        showPollInputs ? 'bg-[#FF3040]/20 border-[#FF3040] text-[#FF3040]' : 'border-[#262E3E] text-[#A7B0C0] hover:text-white'
                      }`}
                    >
                      📊 Weka Kura (Poll)
                    </button>
                    <input
                      type="text"
                      value={newPostImageUrl}
                      onChange={(e) => setNewPostImageUrl(e.target.value)}
                      placeholder="URL ya picha (hiari)..."
                      className="px-3 py-1.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs max-w-xs font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="px-6 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                  >
                    Chapisha Post
                  </button>
                </div>

                {showPollInputs && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-xs">
                    <div>
                      <label className="block text-[#A7B0C0] mb-1">Chaguo la 1:</label>
                      <input
                        type="text"
                        value={pollOption1}
                        onChange={(e) => setPollOption1(e.target.value)}
                        placeholder="k.m. Harmonize"
                        className="w-full p-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A7B0C0] mb-1">Chaguo la 2:</label>
                      <input
                        type="text"
                        value={pollOption2}
                        onChange={(e) => setPollOption2(e.target.value)}
                        placeholder="k.m. Rayvanny"
                        className="w-full p-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Existing Community Posts */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Machapisho Yaliyopita</h3>
              {communityPosts.map((post) => (
                <div key={post.id} className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={post.channelAvatar} alt={post.channelName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{post.channelName}</h4>
                        <span className="text-[10px] text-[#A7B0C0]">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCommunityPost(post.id)}
                      className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-white leading-relaxed whitespace-pre-line">{post.content}</p>

                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post attachment" className="w-full max-h-72 object-cover rounded-2xl border border-[#262E3E]" />
                  )}

                  {post.pollOptions && (
                    <div className="space-y-2 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                      {post.pollOptions.map((opt, i) => (
                        <div key={i} className="flex justify-between p-2 rounded-xl bg-[#191E29] text-xs font-semibold text-white">
                          <span>{opt.option}</span>
                          <span className="font-mono text-[#16C784]">{opt.votes} kura</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-[#262E3E]/60 text-xs text-[#A7B0C0]">
                    <button 
                      onClick={() => likeCommunityPost(post.id)}
                      className={`flex items-center gap-1.5 hover:text-white ${post.isLiked ? 'text-[#FF3040] font-bold' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#FF3040]' : ''}`} />
                      <span>{post.likesCount}</span>
                    </button>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount} maoni</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Comments Moderation Feed */}
            <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]/60">
                <h3 className="text-sm font-extrabold text-white">Usimamizi wa Maoni ya Video (Comments Moderation)</h3>
                <span className="text-xs text-[#A7B0C0]">{creatorCommentsList.length} maoni</span>
              </div>

              <div className="space-y-3">
                {creatorCommentsList.map(({ comment, videoTitle, videoId }) => (
                  <div key={comment.id} className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={comment.userAvatar} alt={comment.userName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <span className="text-xs font-bold text-white block">{comment.userName}</span>
                          <span className="text-[10px] text-[#A7B0C0]">Kwenye: {videoTitle}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#A7B0C0] font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs text-white pl-9">{comment.text}</p>

                    <div className="flex items-center gap-3 pl-9 pt-1 text-xs text-[#A7B0C0]">
                      <button className="flex items-center gap-1 hover:text-[#16C784]">
                        <Heart className="w-3.5 h-3.5" />
                        <span>Upendo wa Muumbaji</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-white">
                        <Pin className="w-3.5 h-3.5" />
                        <span>Weka Juu (Pin)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 7. CHANNEL CUSTOMIZATION TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'customization' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            
            <div className="p-6 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-6">
              
              <div className="pb-4 border-b border-[#262E3E]">
                <h2 className="text-xl font-black text-white">Kuboresha Mwonekano wa Kituo (Channel Customization)</h2>
                <p className="text-xs text-[#A7B0C0]">Tengeneza utambulisho wako, picha ya wasifu, bango, maelezo na uombe beji ya uthibitisho.</p>
              </div>

              {custSavedToast && (
                <div className="p-3 rounded-2xl bg-[#16C784]/20 border border-[#16C784]/50 text-[#16C784] font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Taarifa za kituo zimehifadhiwa kikamilifu!</span>
                </div>
              )}

              <form onSubmit={handleSaveCustomization} className="space-y-4 text-xs">
                
                {/* Banner preview & input */}
                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">Picha ya Bango (Channel Banner 1200x300)</label>
                  <img src={custBanner} alt="Banner Preview" className="w-full h-32 object-cover rounded-2xl border border-[#262E3E] mb-2" />
                  <input
                    type="text"
                    value={custBanner}
                    onChange={(e) => setCustBanner(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono"
                  />
                </div>

                {/* Avatar preview & input */}
                <div className="flex items-center gap-4">
                  <img src={custAvatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#FF3040]" />
                  <div className="flex-1">
                    <label className="block font-bold text-[#A7B0C0] mb-1">Picha ya Wasifu (Avatar)</label>
                    <input
                      type="text"
                      value={custAvatar}
                      onChange={(e) => setCustAvatar(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#A7B0C0] mb-1">Jina la Kituo (Channel Name)</label>
                    <input
                      type="text"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#A7B0C0] mb-1">Jina Maalum (Handle)</label>
                    <input
                      type="text"
                      value={custHandle}
                      onChange={(e) => setCustHandle(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#A7B0C0] mb-1">Kuhusu Kituo (Bio / Description)</label>
                  <textarea
                    rows={3}
                    value={custBio}
                    onChange={(e) => setCustBio(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-[#FF3040] hover:bg-[#E02635] text-white font-extrabold text-xs shadow-md"
                  >
                    Hifadhi Mabadiliko
                  </button>
                </div>
              </form>

              {/* Creator Verification Request Section */}
              <div className="pt-6 border-t border-[#262E3E] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-blue-400" />
                      Uthibitisho wa Kituo (Creator Verification Badge)
                    </h3>
                    <p className="text-[11px] text-[#A7B0C0]">Omba alama rasmi ya buluu kuthibitisha utambulisho wa chapa yako.</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    creatorChannel.isVerified 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {creatorChannel.isVerified ? '✓ Umethibitishwa' : 'Haijathibitishwa'}
                  </span>
                </div>

                {verifSubmittedToast && (
                  <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs">
                    Ombi lako la uthibitisho limewasilishwa kwa usalama kwa msimamizi wa mfumo!
                  </div>
                )}

                {!creatorChannel.isVerified && (
                  <form onSubmit={handleApplyVerification} className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#A7B0C0] mb-1">Aina ya Kitambulisho:</label>
                        <select
                          value={verifDocType}
                          onChange={(e) => setVerifDocType(e.target.value as any)}
                          className="w-full p-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white text-xs"
                        >
                          <option value="NIDA">Kitambulisho cha Taifa (NIDA)</option>
                          <option value="Passport">Paspoti ya Kusafiria</option>
                          <option value="Leseni ya Udereva">Leseni ya Udereva</option>
                          <option value="BRELA">Cheti cha Usajili cha BRELA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#A7B0C0] mb-1">Namba ya Kitambulisho:</label>
                        <input
                          type="text"
                          required
                          value={verifDocNum}
                          onChange={(e) => setVerifDocNum(e.target.value)}
                          className="w-full p-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Wasilisha Ombi la Beji ya Buluu
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 8. COPYRIGHT & POLICY TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'copyright' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-[#FF3040]" />
                  <span>Ulinzi wa Hakimiliki &amp; Maudhui (Tazama Content Shield)</span>
                </h2>
                <p className="text-xs text-[#A7B0C0]">
                  Komesha wizi wa kazi: Zuia watu kupakia kazi zako na kutengeneza faida kubwa kuliko wewe mwenyewe.
                </p>
              </div>

              {/* Sub-tabs for Copyright Center */}
              <div className="flex items-center gap-1.5 bg-[#10131B] p-1 rounded-2xl border border-[#262E3E] text-xs">
                <button
                  type="button"
                  onClick={() => setCopyrightSubTab('shield')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    copyrightSubTab === 'shield' ? 'bg-[#FF3040] text-white shadow-md' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                >
                  🛡️ Waliopakia Kazi Zangu ({copyrightClaims.filter(c => c.matchPercentage >= 70).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCopyrightSubTab('registry')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    copyrightSubTab === 'registry' ? 'bg-[#FF3040] text-white shadow-md' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                >
                  📑 Sajili Kazi za Asili (COSOTA)
                </button>
                <button
                  type="button"
                  onClick={() => setCopyrightSubTab('claims')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    copyrightSubTab === 'claims' ? 'bg-[#FF3040] text-white shadow-md' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                >
                  ⚖️ Madai Dhidi Yangu ({copyrightClaims.length})
                </button>
              </div>
            </div>

            {/* Strikes Status banner */}
            <div className="p-5 rounded-3xl bg-[#121622] border border-[#16C784]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#16C784]/20 text-[#16C784] flex items-center justify-center font-black text-lg">
                  0/3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Akaunti Iko Salama Kabisa (Zero Copyright Strikes)</h3>
                  <p className="text-xs text-[#A7B0C0]">Maudhui yako yanatambuliwa na kulindwa na mfumo wa Alama za Kidijitali wa Tazama.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#16C784]/20 text-[#16C784]">
                Hali Nzuri
              </span>
            </div>

            {/* ---------------- SUBTAB 1: CONTENT SHIELD ANTI-THEFT MATCHES ---------------- */}
            {copyrightSubTab === 'shield' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#191E29] to-transparent border border-amber-500/30">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Ulinzi wa Kazi kwa Mfumo wa Escrow (Tazama Shield):</span>
                  </h3>
                  <p className="text-xs text-[#A7B0C0] mt-1 leading-relaxed">
                    Kazi yako ikipatikana kwenye video nyingine (hata ikiwa na ulinganifu wa 94%), mapato ya video hiyo <strong className="text-white">yanashikiliwa kwanza kwenye Escrow ya muda</strong>. Hayahamishwi kiholela; uhamishaji wa 100% hufanyika baada ya uhakiki wa haki na dirisha la siku 14 la rufaa kumalizika.
                  </p>
                </div>

                <div className="space-y-3">
                  {copyrightClaims.map((claim) => (
                    <div key={claim.id} className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                            Ulinganifu wa Mawimbi: {claim.matchPercentage}% Match
                          </span>
                          <span className="text-xs font-bold text-white">
                            Chaneli Iliyopakia: <strong className="text-amber-400">{claim.targetChannelName}</strong>
                          </span>
                        </div>

                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          claim.escrowStatus === 'released_to_claimant'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : claim.escrowStatus === 'held_in_escrow'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : claim.actionTaken === 'takedown_strike'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {claim.escrowStatus === 'released_to_claimant'
                            ? '💰 Mapato Yameidhinishwa & Kulipwa Kwako (100%)'
                            : claim.escrowStatus === 'held_in_escrow'
                            ? '⏳ Yameshikiwa Kwenye Escrow (Uhakiki Unaendelea)'
                            : claim.actionTaken === 'takedown_strike'
                            ? '🚫 Video Imefutwa (Strike)'
                            : 'Inasubiri Hatua'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#10131B] p-3.5 rounded-2xl border border-[#262E3E]">
                        <div>
                          <span className="text-[10px] text-[#A7B0C0] uppercase font-bold block">Kazi Yako ya Asili:</span>
                          <p className="font-bold text-white text-sm mt-0.5">{claim.infringedWorkTitle}</p>
                          <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                            Ushahidi: {claim.cosotaCertNumber ? `Cheti cha COSOTA #${claim.cosotaCertNumber} (Ushahidi wa Kusaidia)` : 'Alama ya Sauti ya Tazama'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#A7B0C0] uppercase font-bold block">Video Inayobishaniwa:</span>
                          <p className="font-bold text-white text-sm mt-0.5 truncate">{claim.targetVideoTitle}</p>
                          <div className="flex items-center gap-3 mt-1 font-mono text-[11px]">
                            <span className="text-[#A7B0C0]">Watazamaji: <strong>142,500</strong></span>
                            <span className="text-amber-400 font-bold">Kiasi cha Escrow: TZS {(claim.disputedRevenueTZS || 185000).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Escrow and Due Process Explanation */}
                      <div className="p-3 rounded-2xl bg-[#191E29] border border-[#262E3E] text-xs text-[#A7B0C0] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white font-semibold flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-400" />
                            Hali ya Fedha na Hatari:
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {claim.escrowStatus === 'released_to_claimant' ? 'IMEKAMILIKA' : 'INASHIKILIWA'}
                          </span>
                        </div>
                        <p className="text-[11px]">
                          {claim.escrowStatus === 'released_to_claimant'
                            ? `Uhakiki umekamilika. TZS ${(claim.divertedRevenueTZS || 185000).toLocaleString()} zimeongezwa kwenye mkoba wako wa mapato.`
                            : `TZS ${(claim.disputedRevenueTZS || 185000).toLocaleString()} zimeshikiliwa kwenye Escrow ya muda ili kumlinda uploader na haki zako. Mwizi hawezi kutoa kiasi hiki, lakini fedha zake zingine zisizohusika haziathiriwi.`}
                        </p>
                      </div>

                      {claim.escrowStatus !== 'released_to_claimant' && claim.status !== 'rejected' && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#262E3E]">
                          <button
                            type="button"
                            onClick={() => {
                              updateCopyrightClaim(claim.id, 'approved', 'divert_revenue', 'Uhakiki wa kisheria umekamilika na mapato ya Escrow yametolewa.');
                              alert(`Ombi limethibitishwa! TZS ${(claim.disputedRevenueTZS || 185000).toLocaleString()} zilizokuwa kwenye Escrow zimeelekezwa rasmi kwenye akaunti yako ya Tazama.`);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Thibitisha &amp; Toa Mapato ya Escrow (Claim &amp; Divert)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('Weka sababu za kufuta video na kutoa ilani ya Strike (Notisi ya siku 14 ya rufaa itatolewa kwa uploader):');
                              if (reason) {
                                updateCopyrightClaim(claim.id, 'approved', 'takedown_strike', reason);
                                alert(`Video ya "${claim.targetVideoTitle}" imeondolewa. Aliyepakia amepewa ilani ya siku 14 ya kuwasilisha Counter-Notice kabla ya adhabu ya kudumu.`);
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Ondoa Video &amp; Toa Ilani ya Strike (Takedown)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateCopyrightClaim(claim.id, 'approved', 'revenue_share', 'Mgawanyo wa 50/50 kwa remix/reaction.');
                              alert('Umekubali mgawanyo wa 50% ya mapato kwa sababu ni Remix / Reaction video.');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#191E29] hover:bg-[#262E3E] text-white font-semibold text-xs border border-[#262E3E]"
                          >
                            🤝 Gawana 50/50 (Remix / Reaction)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- SUBTAB 2: REGISTER ORIGINAL WORKS ---------------- */}
            {copyrightSubTab === 'registry' && (
              <div className="p-6 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-5">
                <div className="pb-3 border-b border-[#262E3E]">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span>Usajili wa Alama za Kidijitali &amp; Ushahidi wa COSOTA (Digital Rights Registry)</span>
                  </h3>
                  <div className="mt-2 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 space-y-1">
                    <strong className="block font-bold">Ufafanuzi Muhimu wa Kisheria (COSOTA Supporting Evidence):</strong>
                    <p className="text-[11px] text-[#A7B0C0] leading-relaxed">
                      Namba ya cheti cha COSOTA inayowekwa hapa inachukuliwa kama <span className="text-blue-300 font-semibold">"Ushahidi wa Kusaidia Uhakiki" (Supporting Evidence)</span> na si uthibitisho wa moja kwa moja kwamba msajili ndiye anayemiliki kila haki inayohusika (k.m. leseni za beats, watunzi wenza, au sampuli). Uhakiki wa kina utafanyika kwenye daftari la COSOTA kabla ya uamuzi wowote wa mwisho.
                    </p>
                  </div>
                </div>

                {workProtectionSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Kazi yako imepokelewa na kuwekwa alama ya kidijitali. Cheti cha COSOTA kimerekodiwa kama ushahidi wa kusaidia uhakiki endapo dai litatokea!</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newWorkTitle.trim()) return;
                    setWorkProtectionSuccess(true);
                    setTimeout(() => setWorkProtectionSuccess(false), 5000);
                    setNewWorkTitle('');
                    setNewWorkCosotaNumber('');
                  }}
                  className="space-y-4 max-w-xl text-xs"
                >
                  <div>
                    <label className="block text-[#A7B0C0] mb-1 font-bold">Jina la Kazi ya Asili (Wimbo, Filamu, Skit, au Kipindi):</label>
                    <input
                      type="text"
                      required
                      value={newWorkTitle}
                      onChange={(e) => setNewWorkTitle(e.target.value)}
                      placeholder="k.m. 'Bongo Flava Anthem 2026' au 'Kichekesho cha Vunjambavu Episode 4'"
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs placeholder-[#A7B0C0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A7B0C0] mb-1 font-bold">Namba ya Cheti cha COSOTA (Ushahidi wa Kusaidia Uhakiki):</label>
                    <input
                      type="text"
                      value={newWorkCosotaNumber}
                      onChange={(e) => setNewWorkCosotaNumber(e.target.value)}
                      placeholder="k.m. COSOTA-TZ-2026-9041 (Hiari)"
                      className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono placeholder-[#A7B0C0]"
                    />
                    <span className="text-[10px] text-[#A7B0C0] mt-1 block">
                      Cheti hiki kitasaidia timu ya ukaguzi kuthibitisha umiliki wako kwenye daftari la COSOTA Tanzania.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[#A7B0C0] mb-1 font-bold">Sera ya Ushikiliaji wa Escrow Iwapo Mtu Ataiga Kazi Hii:</label>
                    <select className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs">
                      <option value="escrow_review">⏳ Shikilia Mapato kwenye Escrow ya Muda Wakati wa Uhakiki (Inapendekezwa)</option>
                      <option value="notice_takedown">📋 Toa Notisi ya Siku 14 ya Kisheria na Zuio la Video</option>
                      <option value="share">🤝 Ruhusu Mgawanyo wa 50% ya Mapato kwa Remix/Reaction</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white font-extrabold text-xs shadow-lg transition-transform active:scale-95"
                  >
                    Washa Ulinzi wa Content Shield Sasa
                  </button>
                </form>
              </div>
            )}

            {/* ---------------- SUBTAB 3: CLAIMS AGAINST ME ---------------- */}
            {copyrightSubTab === 'claims' && (
              <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
                <div className="pb-3 border-b border-[#262E3E]/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Madai ya Hakimiliki Dhidi ya Kituo Chako</h3>
                    <p className="text-xs text-[#A7B0C0]">Usimamizi wa haki, zuio la muda la escrow, na nafasi ya kuwasilisha Counter-Notice.</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-[#191E29] border border-[#262E3E] text-emerald-400 font-bold">
                    Salio Lililo Huru Linabaki Salama
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                        <th className="pb-2.5">Video Yako</th>
                        <th className="pb-2.5">Mmiliki wa Haki (Mdai)</th>
                        <th className="pb-2.5">Kiasi cha Escrow (Zuio)</th>
                        <th className="pb-2.5">Hali ya Kisheria</th>
                        <th className="pb-2.5">Upeo wa Zuio</th>
                        <th className="pb-2.5 text-right">Hatua / Counter-Notice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262E3E]/50">
                      {copyrightClaims.map((claim) => (
                        <tr key={claim.id}>
                          <td className="py-3 font-semibold text-white max-w-xs truncate">{claim.targetVideoTitle}</td>
                          <td className="py-3 text-white">
                            <div>
                              <span>{claim.claimantName}</span>
                              <span className="block text-[10px] text-[#A7B0C0]">{claim.claimantOrg}</span>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-amber-400 font-bold">
                            TZS {(claim.disputedRevenueTZS || 185000).toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              claim.status === 'disputed' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : claim.status === 'approved' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {claim.status === 'disputed' 
                                ? 'Counter-Notice Inapitiwa' 
                                : claim.status === 'approved' 
                                ? 'Imethibitishwa' 
                                : 'Kwenye Escrow (Uchunguzi)'}
                            </span>
                          </td>
                          <td className="py-3 text-[11px] text-[#A7B0C0]">
                            <span className="text-emerald-400 font-semibold">Video hii pekee</span> (Salio lingine liko huru)
                          </td>
                          <td className="py-3 text-right">
                            {claim.counterNoticeSubmitted ? (
                              <span className="text-blue-400 text-[11px] font-bold">Counter-Notice Imewasilishwa</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt('Wasilisha kipingamizi chako cha kisheria (Counter-Notice / Leseni / Fair Use):');
                                  if (reason) {
                                    submitCounterNotice(claim.id, reason);
                                    alert('Counter-Notice yako imepokelewa na kuwasilishwa kwa jopo la kisheria. Zuio la video linabaki kwenye Escrow hadi uamuzi rasmi ufanyike.');
                                  }
                                }}
                                className="px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30"
                              >
                                Wasilisha Counter-Notice
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 9. LIVE STUDIO TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'live' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white">Studio ya Mubashara (Live Studio Control Room)</h2>
                <p className="text-xs text-[#A7B0C0]">Kuanzisha matangazo ya moja kwa moja, RTMP keys na usimamizi wa mazungumzo.</p>
              </div>

              <button
                onClick={() => setIsLiveActive(!isLiveActive)}
                className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-xs shadow-lg transition-all ${
                  isLiveActive ? 'bg-red-600 text-white animate-pulse' : 'bg-[#FF3040] text-white hover:brightness-110'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{isLiveActive ? 'Katisha Matangazo (End Stream)' : 'Anzisha Mubashara Sasa'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Stream Preview & Config */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Video Monitor Box */}
                <div className="relative aspect-video rounded-3xl bg-black border border-[#262E3E] overflow-hidden flex flex-col items-center justify-center text-center p-6">
                  {isLiveActive ? (
                    <div className="space-y-3">
                      <span className="w-4 h-4 rounded-full bg-red-600 animate-ping mx-auto block" />
                      <h3 className="text-base font-black text-white">{liveStreamTitle}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white font-mono">
                        LIVE &bull; {liveViewersCount.toLocaleString()} watazamaji
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-[#A7B0C0]">
                      <Radio className="w-12 h-12 text-[#FF3040] mx-auto opacity-70" />
                      <h3 className="text-sm font-bold text-white">Hakuna Matangazo Yaliyo Hewani</h3>
                      <p className="text-xs max-w-sm">
                        Unganisha programu yako ya utangazaji (OBS Studio, vMix, au Prism Live) kwa kutumia RTMP URL na Stream Key hapo chini.
                      </p>
                    </div>
                  )}
                </div>

                {/* RTMP Credentials */}
                <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-3 text-xs">
                  <h3 className="font-extrabold text-white">Mipangilio ya RTMP (Encoder Setup)</h3>
                  
                  <div>
                    <label className="block text-[#A7B0C0] mb-1">Server URL:</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value="rtmp://live.tazama.co.tz/live-app" 
                        className="flex-1 p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white font-mono"
                      />
                      <button 
                        onClick={() => alert('Server URL imenakiliwa!')}
                        className="px-3 py-2.5 rounded-xl bg-[#191E29] hover:bg-[#262E3E] text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A7B0C0] mb-1">Stream Key (Siri):</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="password" 
                        readOnly 
                        value="tzm_live_9845_wasafi_secret_key_prod" 
                        className="flex-1 p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white font-mono"
                      />
                      <button 
                        onClick={() => alert('Stream key imenakiliwa!')}
                        className="px-3 py-2.5 rounded-xl bg-[#191E29] hover:bg-[#262E3E] text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Col: Live Chat Moderation Simulator */}
              <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] flex flex-col h-[520px]">
                <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]/60">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#16C784]" />
                    Mazungumzo ya Moja kwa Moja (Live Chat)
                  </span>
                  <span className="text-[10px] text-[#16C784] font-bold">Muda Halisi</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 py-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E]">
                    <span className="text-[#16C784] font-bold">Amina Salum: </span>
                    <span className="text-white">Wimbo wa pili uwe wa Sukari tafadhali! 🔥</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#10131B] border border-amber-500/30">
                    <span className="text-amber-400 font-bold">Kelvin Mushi (VIP): </span>
                    <span className="text-white">Ametuma zawadi ya Simba! TZS 5,000</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E]">
                    <span className="text-blue-400 font-bold">Baraka Mrema: </span>
                    <span className="text-white">Sauti inasikika vizuri sana kutoka Arusha 🇹🇿</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#262E3E]/60">
                  <input
                    type="text"
                    placeholder="Tuma ujumbe kama Muumbaji..."
                    className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 10. PLAYLISTS TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'playlists' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white">Orodha za Video (Playlists)</h2>
                <p className="text-xs text-[#A7B0C0]">Panga video zako katika mfululizo ili kuongeza muda wa watazamaji kukaa kwenye kituo.</p>
              </div>

              <button
                onClick={() => {
                  const title = prompt('Weka jina la playlist mpya:');
                  if (title) createPlaylist(title, 'Playlist iliyotengenezwa na Creator');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Unda Playlist Mpya</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playlists.map((pl) => (
                <div key={pl.id} className="p-4 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#262E3E]">
                    <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <ListMusic className="w-8 h-8 text-white" />
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] text-white font-mono font-bold">
                      {pl.videoIds.length} video
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-white line-clamp-1">{pl.title}</h4>
                      <p className="text-[10px] text-[#A7B0C0] line-clamp-1">{pl.description || 'Hakuna maelezo'}</p>
                    </div>
                    <button
                      onClick={() => deletePlaylist(pl.id)}
                      className="p-1 rounded text-[#A7B0C0] hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 11. SUBTITLES TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'subtitles' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white">Manukuu &amp; Tafsiri (Subtitles Studio)</h2>
                <p className="text-xs text-[#A7B0C0]">Ongeza manukuu ya Kiswahili na Kiingereza ili kuongeza hadhira ya kimataifa.</p>
              </div>
            </div>

            {/* Subtitles list */}
            <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                      <th className="pb-2.5">Video</th>
                      <th className="pb-2.5">Lugha</th>
                      <th className="pb-2.5">Muundo</th>
                      <th className="pb-2.5">Hali</th>
                      <th className="pb-2.5">Tarehe</th>
                      <th className="pb-2.5 text-right">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262E3E]/50">
                    {subtitles.map((sub) => (
                      <tr key={sub.id}>
                        <td className="py-3 font-semibold text-white max-w-xs truncate">{sub.videoTitle}</td>
                        <td className="py-3 text-white font-bold">{sub.languageLabel}</td>
                        <td className="py-3 font-mono uppercase text-[#A7B0C0]">{sub.format}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16C784]/20 text-[#16C784]">
                            Imechapishwa
                          </span>
                        </td>
                        <td className="py-3 text-[11px] font-mono text-[#A7B0C0]">{new Date(sub.updatedAt).toLocaleDateString()}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteSubtitleTrack(sub.id)}
                            className="p-1 rounded text-[#A7B0C0] hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 12. CREATOR MEMBERSHIPS TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'memberships' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white">Uanachama wa Kituo (Creator Memberships)</h2>
                <p className="text-xs text-[#A7B0C0]">Weka ngazi za mashabiki wanaolipia kila mwezi ili kupata maudhui ya kipekee.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {membershipTiers.map((tier) => (
                <div 
                  key={tier.id}
                  className="p-5 rounded-3xl bg-[#121622] border space-y-4 shadow-lg"
                  style={{ borderColor: `${tier.badgeColor}40` }}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-black text-black"
                      style={{ backgroundColor: tier.badgeColor }}
                    >
                      {tier.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{tier.memberCount} wanachama</span>
                  </div>

                  <div className="text-xl font-black font-mono text-white">
                    {formatTZS(tier.priceTZS)} <span className="text-xs text-[#A7B0C0] font-sans font-normal">/ mwezi</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#262E3E]/60 text-xs text-[#A7B0C0]">
                    <span className="font-bold text-white block">Faida za Ngazi Hii:</span>
                    {tier.perks.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#16C784] shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 13. PROMOTIONS TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'promotions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#262E3E]">
              <div>
                <h2 className="text-xl font-black text-white">Kutangaza Video &amp; Kampeni (Promotions Studio)</h2>
                <p className="text-xs text-[#A7B0C0]">Tangaza video zako kwenye ukurasa mkuu wa Tazama na matokeo ya utafutaji.</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                      <th className="pb-2.5">Video</th>
                      <th className="pb-2.5">Lengo</th>
                      <th className="pb-2.5">Bajeti</th>
                      <th className="pb-2.5">Iliyotumika</th>
                      <th className="pb-2.5">Impressions / Clicks</th>
                      <th className="pb-2.5">Hali</th>
                      <th className="pb-2.5 text-right">Kitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262E3E]/50">
                    {creatorPromotions.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-semibold text-white max-w-xs truncate">{p.videoTitle}</td>
                        <td className="py-3 capitalize text-white font-bold">{p.goal}</td>
                        <td className="py-3 font-mono text-white">{formatTZS(p.budgetTZS)}</td>
                        <td className="py-3 font-mono text-[#16C784] font-bold">{formatTZS(p.spentTZS)}</td>
                        <td className="py-3 font-mono text-[#A7B0C0]">{p.impressions.toLocaleString()} / {p.clicks.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'active' ? 'bg-[#16C784]/20 text-[#16C784]' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {p.status === 'active' ? 'Inaonyeshwa' : 'Imesimamishwa'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => togglePromotionStatus(p.id)}
                            className="px-3 py-1 rounded-xl bg-[#10131B] hover:bg-[#262E3E] text-white text-xs font-bold border border-[#262E3E]"
                          >
                            {p.status === 'active' ? 'Simamisha' : 'Washa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 14. AI CREATOR ASSISTANT TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ai_assistant' && (
          <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
            
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#191E29] via-[#1E2538] to-[#121622] border border-[#FF3040]/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-orange-500 text-white flex items-center justify-center shadow-lg shadow-[#FF3040]/30">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">AI Creator Assistant (Mshauri Mahiri wa Takwimu)</h2>
                  <p className="text-xs text-[#A7B0C0]">Ushauri unaotumia takwimu halisi za kituo chako, bila kubuni namba za uongo.</p>
                </div>
              </div>
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
              {[
                'Kwa nini video yangu ya mwisho haijapata views nyingi?',
                'Ni video gani inayowavutia subscribers wapya?',
                'Ni aina gani ya maudhui ninayopaswa kujaribu wiki ijayo?',
                'Watazamaji wanaacha kutazama video yangu dakika gani?'
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAiMessage(pill)}
                  className="px-3 py-1.5 rounded-full bg-[#121622] hover:bg-[#191E29] border border-[#262E3E] text-white text-xs whitespace-nowrap transition-all shrink-0 active:scale-95"
                >
                  💬 {pill}
                </button>
              ))}
            </div>

            {/* Chat Box */}
            <div className="p-5 rounded-3xl bg-[#121622] border border-[#262E3E] flex flex-col h-[460px]">
              
              <div className="flex-1 overflow-y-auto space-y-3.5 p-2">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'user' ? 'bg-[#FF3040] text-white' : 'bg-[#191E29] text-amber-400 border border-[#262E3E]'
                    }`}>
                      {msg.sender === 'user' ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-[#FF3040] text-white font-medium' 
                        : 'bg-[#10131B] border border-[#262E3E] text-white whitespace-pre-line'
                    }`}>
                      {msg.text}
                      <span className="block text-[10px] text-[#A7B0C0] mt-1 text-right font-mono">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-center gap-2 text-xs text-[#A7B0C0] p-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3040] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#FF3040] animate-bounce delay-150" />
                    <span className="w-2 h-2 rounded-full bg-[#FF3040] animate-bounce delay-300" />
                    <span>AI inachambua metriki za channel yako...</span>
                  </div>
                )}
              </div>

              {/* Input row */}
              <div className="pt-3 border-t border-[#262E3E]/60 flex items-center gap-2">
                <input
                  type="text"
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendAiMessage();
                  }}
                  placeholder="Uliza chochote kuhusu mwelekeo wa watazamaji, thumbnails, au mapato ya kituo..."
                  className="flex-1 p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
                />
                <button
                  onClick={() => handleSendAiMessage()}
                  className="p-3 rounded-2xl bg-[#FF3040] hover:bg-[#E02635] text-white transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 15. CREATOR SETTINGS TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            
            <div className="p-6 rounded-3xl bg-[#121622] border border-[#262E3E] space-y-6">
              
              <div className="pb-4 border-b border-[#262E3E]">
                <h2 className="text-xl font-black text-white">Mipangilio ya Kituo &amp; Akaunti (Creator Settings)</h2>
                <p className="text-xs text-[#A7B0C0]">Usimamizi wa usalama, ruhusa za washirika (RBAC), arifa na njia chaguomsingi za malipo.</p>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Permissions & Roles */}
                <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Ruhusa za Washirika (Channel Permissions)</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-[11px] text-[#A7B0C0]">
                    Unaweza kuongeza Mameneja au Wahariri (Editors) kusaidia kupakia video bila kuwapa nenosiri lako.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#191E29] text-xs">
                      <div>
                        <span className="font-bold text-white block">Diamond Platnumz (Wewe)</span>
                        <span className="text-[10px] text-[#A7B0C0]">diamond@wasafi.co.tz</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3040]/20 text-[#FF3040]">
                        Mmiliki Mkuu (Owner)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Default Payout Provider */}
                <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Njia Chaguomsingi ya Malipo ya Moja kwa Moja</span>
                    <Wallet className="w-4 h-4 text-[#16C784]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A7B0C0] mb-1">Mtandao wa Simu / Benki:</label>
                      <select className="w-full p-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white text-xs">
                        <option>Vodacom M-Pesa</option>
                        <option>Tigo Pesa</option>
                        <option>Airtel Money</option>
                        <option>CRDB Bank PLC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#A7B0C0] mb-1">Namba Iliyothibitishwa:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="0754 987 654" 
                        className="w-full p-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Security & 2FA */}
                <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Uthibitishaji wa Hatua Mbili (2-Step Verification)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16C784]/20 text-[#16C784]">
                      Inatumika
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7B0C0]">
                    Akaunti yako inalindwa kwa nambari ya siri ya SMS ya M-Pesa/Google Authenticator kabla ya kutoa fedha.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODALS: Request Payout, Edit Video, Video Analytics */}
      {/* ------------------------------------------------------------- */}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-6">
            <h3 className="text-base font-bold text-white mb-1">Omba Kutoa Mapato (Creator Payout)</h3>
            <p className="text-xs text-[#A7B0C0] mb-4">Hamisha fedha zako moja kwa moja kwenda kwenye mtandao wa simu au benki</p>

            {payoutSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#16C784] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white">Ombi la Malipo Limeidhinishwa!</h4>
                <p className="text-xs text-[#A7B0C0]">Pesa zitatumwa kwenye {accountNumber} ({payoutProvider}) ndani ya saa 2.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">Njia ya Malipo:</label>
                  <select
                    value={payoutProvider}
                    onChange={(e) => setPayoutProvider(e.target.value as any)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="M-Pesa">Vodacom M-Pesa</option>
                    <option value="Tigo Pesa">Tigo Pesa / Yas</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Halopesa">Halopesa</option>
                    <option value="CRDB Bank">CRDB Bank PLC</option>
                    <option value="NMB Bank">NMB Bank PLC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">Namba ya Simu / Akaunti:</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">Jina Lililosajiliwa:</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">Kiasi cha Kutoa (TZS):</label>
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
                    Salio linalopatikana: {formatTZS(availablePayoutTZS)}
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
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#16C784] hover:bg-[#13A76E] text-black font-extrabold text-xs shadow-md"
                  >
                    Thibitisha Kutoa Fedha
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <h3 className="text-base font-bold text-white">Hariri Video (Edit Metadata)</h3>
              <button 
                onClick={() => setEditingVideo(null)}
                className="text-[#A7B0C0] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A7B0C0] mb-1 font-bold">Kichwa cha Video:</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[#A7B0C0] mb-1 font-bold">Maelezo (Description):</label>
                <textarea
                  rows={3}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A7B0C0] mb-1 font-bold">Ufikiaji (Visibility):</label>
                  <select
                    value={editingVideo.visibility}
                    onChange={(e) => setEditingVideo({ ...editingVideo, visibility: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs capitalize"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#A7B0C0] mb-1 font-bold">Kundi (Category):</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs"
                  >
                    <option value="Muziki">Muziki</option>
                    <option value="Vichekesho">Vichekesho</option>
                    <option value="Habari">Habari</option>
                    <option value="Elimu">Elimu</option>
                    <option value="Michezo">Michezo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl border border-[#262E3E] text-[#A7B0C0]"
                >
                  Ghairi
                </button>
                <button
                  onClick={() => {
                    editVideo(editingVideo.id, editingVideo);
                    setEditingVideo(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white font-bold"
                >
                  Hifadhi Mabadiliko
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Level Analytics Modal */}
      {analyzingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <div>
                <h3 className="text-sm font-extrabold text-white">Takwimu za Video: {analyzingVideo.title}</h3>
                <span className="text-[10px] text-[#A7B0C0]">Uchambuzi wa kina wa video hii pekee</span>
              </div>
              <button 
                onClick={() => setAnalyzingVideo(null)}
                className="text-[#A7B0C0] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                <span className="text-[10px] text-[#A7B0C0] block">Matazamio</span>
                <span className="text-base font-black text-white font-mono">{formatViews(analyzingVideo.viewsCount, language)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                <span className="text-[10px] text-[#A7B0C0] block">Likes</span>
                <span className="text-base font-black text-[#16C784] font-mono">{analyzingVideo.likesCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                <span className="text-[10px] text-[#A7B0C0] block">Retention</span>
                <span className="text-base font-black text-amber-400 font-mono">71.2%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-2 text-xs">
              <span className="font-bold text-white block">Matokeo ya Utafutaji na CTR:</span>
              <p className="text-[11px] text-[#A7B0C0]">
                Video hii inafanya vizuri sana kwenye mapendekezo ya jukwaa (Suggested Videos: 54%) na watu wanaotafuta neno #{analyzingVideo.category}.
              </p>
            </div>

            <button
              onClick={() => setAnalyzingVideo(null)}
              className="w-full py-2.5 rounded-2xl bg-[#232A39] hover:bg-[#2c3548] text-white text-xs font-bold"
            >
              Funga Dirisha
            </button>
          </div>
        </div>
      )}

      {/* Upload Completed Toast */}
      {uploadCompletedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16C784] text-black font-extrabold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>Video yako imechapishwa kikamilifu kwenye Tazama na sasa ipo hewani!</span>
        </div>
      )}

    </div>
  );
};
