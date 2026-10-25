import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  VideoItem, 
  Channel, 
  CommentItem, 
  GiftTransaction, 
  UserMembership, 
  ContentReport, 
  VideoCategory,
  PayoutRequest,
  UserProfile,
  UserRole,
  PremiumPlan,
  PlatformSettings,
  AuditLogEntry,
  Playlist,
  LiveStream,
  OfflineDownload,
  STKPushRequest,
  LiveChatMessage,
  CopyrightClaim,
  CreatorVerificationRequest,
  CreatorMonetizationApplication,
  PromoCode,
  UserAppeal,
  SecurityLogEvent,
  AdCampaign,
  CommunityPost,
  CreatorMembershipTier,
  VideoSubtitleTrack,
  CreatorPromotion
} from '../types';
import { 
  INITIAL_VIDEOS, 
  INITIAL_SHORTS, 
  INITIAL_CHANNELS, 
  VIRTUAL_GIFTS,
  INITIAL_USERS,
  INITIAL_PREMIUM_PLANS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PLAYLISTS,
  INITIAL_LIVE_STREAMS,
  INITIAL_COPYRIGHT_CLAIMS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_MONETIZATION_APPLICATIONS,
  INITIAL_PROMO_CODES,
  INITIAL_USER_APPEALS,
  INITIAL_SECURITY_LOGS,
  SAMPLE_AD_CAMPAIGNS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_CREATOR_MEMBERSHIP_TIERS,
  INITIAL_VIDEO_SUBTITLES,
  INITIAL_CREATOR_PROMOTIONS
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface VideoContextType {
  videos: VideoItem[];
  shorts: VideoItem[];
  channels: Channel[];
  users: UserProfile[];
  premiumPlans: PremiumPlan[];
  platformSettings: PlatformSettings;
  auditLogs: AuditLogEntry[];
  currentVideo: VideoItem | null;
  searchQuery: string;
  selectedCategory: string;
  userSubscriptions: string[]; // Channel IDs
  likedVideoIds: string[];
  watchHistory: VideoItem[];
  comments: Record<string, CommentItem[]>;
  giftTransactions: GiftTransaction[];
  memberships: UserMembership[];
  reports: ContentReport[];
  payoutRequests: PayoutRequest[];
  setCurrentVideo: (video: VideoItem | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  toggleSubscribe: (channelId: string) => void;
  toggleLike: (videoId: string) => void;
  recordView: (videoId: string) => void;
  addComment: (videoId: string, text: string) => void;
  sendGiftToCreator: (videoId: string, channelId: string, giftId: string, message?: string) => Promise<boolean>;
  joinMembership: (channelId: string, tierId: string, tierName: string, priceTZS: number) => Promise<boolean>;
  submitReport: (targetType: 'video' | 'comment' | 'channel', targetId: string, targetTitle: string, reason: string, details: string) => void;
  uploadNewVideo: (videoData: Partial<VideoItem>) => Promise<VideoItem>;
  requestPayout: (amountTZS: number, provider: PayoutRequest['provider'], accountNumber: string, accountHolderName: string) => boolean;
  updateReportStatus: (reportId: string, newStatus: ContentReport['status']) => void;
  // Admin & Premium Management operations
  deleteUser: (uid: string) => boolean;
  toggleBlockUser: (uid: string, reason?: string) => void;
  updateUserRole: (uid: string, newRole: UserRole) => void;
  updateUserBalance: (uid: string, deltaTZS: number) => void;
  toggleChannelVerification: (channelId: string) => void;
  toggleBlockChannel: (channelId: string, reason?: string) => void;
  deleteVideo: (videoId: string) => void;
  updateVideoStatus: (videoId: string, status: 'ready' | 'processing' | 'error', visibility?: 'public' | 'unlisted' | 'private') => void;
  updatePremiumPlan: (planId: string, updates: Partial<PremiumPlan>) => void;
  addPremiumPlan: (planData: Omit<PremiumPlan, 'id' | 'subscribersCount'>) => void;
  subscribeToPremiumPlan: (planId: string) => Promise<boolean>;
  updatePayoutStatus: (payoutId: string, status: 'approved' | 'rejected' | 'processed', notes?: string) => void;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  addAuditLog: (action: string, target: string, details: string, status?: 'SUCCESS' | 'WARNING' | 'REJECTED') => void;
  // Mini Player
  miniPlayerVideo: VideoItem | null;
  isMiniPlayerPlaying: boolean;
  setMiniPlayerVideo: (video: VideoItem | null) => void;
  toggleMiniPlayerPlay: () => void;
  closeMiniPlayer: () => void;
  // Offline Downloads
  offlineDownloads: OfflineDownload[];
  downloadVideo: (video: VideoItem) => void;
  removeDownload: (videoId: string) => void;
  isDownloaded: (videoId: string) => boolean;
  // Data Saver
  isDataSaver: boolean;
  toggleDataSaver: () => void;
  // Playlists
  playlists: Playlist[];
  createPlaylist: (title: string, description?: string) => string;
  addToPlaylist: (playlistId: string, videoId: string) => void;
  removeFromPlaylist: (playlistId: string, videoId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  // Live Streams
  liveStreams: LiveStream[];
  activeLiveStream: LiveStream | null;
  setActiveLiveStream: (stream: LiveStream | null) => void;
  liveChatMessages: Record<string, LiveChatMessage[]>;
  sendLiveChatMessage: (streamId: string, text: string) => void;
  sendLiveTip: (streamId: string, amountTZS: number, giftName: string) => Promise<boolean>;
  // STK Push Simulator
  stkPushRequest: STKPushRequest | null;
  triggerSTKPush: (req: STKPushRequest) => void;
  confirmSTKPush: (pin: string) => Promise<boolean>;
  cancelSTKPush: () => void;
  // Copyright Management
  copyrightClaims: CopyrightClaim[];
  updateCopyrightClaim: (claimId: string, status: CopyrightClaim['status'], actionTaken?: 'takedown_strike' | 'warning' | 'dismissed', notes?: string) => void;
  // Creator Verification
  verificationRequests: CreatorVerificationRequest[];
  updateVerificationRequest: (reqId: string, status: 'approved' | 'rejected') => void;
  // Creator Monetization
  monetizationApplications: CreatorMonetizationApplication[];
  updateMonetizationApplication: (appId: string, status: 'approved' | 'rejected', notes?: string) => void;
  // Promo Codes & Discounts
  promoCodes: PromoCode[];
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usedCount'>) => void;
  togglePromoCode: (promoId: string) => void;
  deletePromoCode: (promoId: string) => void;
  // User Appeals & Recovery
  userAppeals: UserAppeal[];
  updateUserAppeal: (appealId: string, status: 'approved' | 'rejected', notes?: string) => void;
  // Security Logs & Events
  securityLogs: SecurityLogEvent[];
  addSecurityLog: (event: Omit<SecurityLogEvent, 'id' | 'timestamp'>) => void;
  // Ad Campaigns
  adCampaigns: AdCampaign[];
  addAdCampaign: (campaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'spendTZS'>) => void;
  updateAdCampaignStatus: (campaignId: string, status: AdCampaign['status']) => void;
  // Featured Videos
  featuredVideoIds: string[];
  toggleFeaturedVideo: (videoId: string) => void;
  // Creator Studio Specific Operations
  editVideo: (videoId: string, updates: Partial<VideoItem>) => void;
  bulkDeleteVideos: (videoIds: string[]) => void;
  bulkUpdateVisibility: (videoIds: string[], visibility: 'public' | 'unlisted' | 'private') => void;
  communityPosts: CommunityPost[];
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => void;
  likeCommunityPost: (postId: string) => void;
  deleteCommunityPost: (postId: string) => void;
  membershipTiers: CreatorMembershipTier[];
  addMembershipTier: (tier: Omit<CreatorMembershipTier, 'id' | 'memberCount'>) => void;
  subtitles: VideoSubtitleTrack[];
  addSubtitleTrack: (track: Omit<VideoSubtitleTrack, 'id' | 'updatedAt'>) => void;
  deleteSubtitleTrack: (subId: string) => void;
  creatorPromotions: CreatorPromotion[];
  addCreatorPromotion: (promo: Omit<CreatorPromotion, 'id' | 'spentTZS' | 'impressions' | 'clicks' | 'startDate'>) => void;
  togglePromotionStatus: (promoId: string) => void;
  applyForVerification: (channelId: string, docType: CreatorVerificationRequest['documentType'], docNum: string) => boolean;
  applyForMonetization: (channelId: string) => boolean;
  submitCopyrightAppeal: (claimId: string, explanation: string) => void;
  updateChannelInfo: (channelId: string, updates: Partial<Channel>) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, deductBalance } = useAuth();

  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [shorts, setShorts] = useState<VideoItem[]>(INITIAL_SHORTS);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Zote');
  const [userSubscriptions, setUserSubscriptions] = useState<string[]>(['ch-wasafi']);
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(['vid-wasafi-fest']);
  const [watchHistory, setWatchHistory] = useState<VideoItem[]>(INITIAL_VIDEOS.slice(0, 3));
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({
    'vid-wasafi-fest': [
      {
        id: 'c-1',
        videoId: 'vid-wasafi-fest',
        userId: 'u-1',
        userName: 'Amina Salum',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'Mwanza mlikinukisha sana! Diamond Platnumz anabaki kuwa nambari moja Afrika Mashariki 🔥🇹🇿',
        likesCount: 342,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'c-2',
        videoId: 'vid-wasafi-fest',
        userId: 'u-2',
        userName: 'Baraka Mrema',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        text: 'Ubora wa picha na sauti ya Tazama ni level nyingine kabisa. Hakuna kubana mtandao!',
        likesCount: 128,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ],
    'vid-sgr-dar': [
      {
        id: 'c-3',
        videoId: 'vid-sgr-dar',
        userId: 'u-3',
        userName: 'Neema Mwamba',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        text: 'Nilisafiri na SGR wiki iliyopita, huduma ni za kimataifa kabisa. Hongera sana Serikali ya Tanzania!',
        likesCount: 512,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  });

  const [giftTransactions, setGiftTransactions] = useState<GiftTransaction[]>([]);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([
    {
      id: 'rep-1',
      reporterId: 'u-reporter-01',
      targetType: 'video',
      targetId: 'vid-wasafi-fest',
      targetTitle: 'WASAFIBURN LIVE MWANZA',
      reason: 'Hakimiliki (COSOTA Review)',
      details: 'Dai la ulinganifu wa sauti ya bendi ya nyuma.',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ]);

  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>(INITIAL_PREMIUM_PLANS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([
    {
      id: 'pay-001',
      creatorId: 'user-diamond',
      channelName: 'Wasafi Media',
      amountTZS: 5000000,
      provider: 'M-Pesa',
      accountNumber: '0754 123 456',
      accountHolderName: 'Naseeb Abdul Juma',
      status: 'approved',
      requestedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      processedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      notes: 'Imeidhinishwa na Msimamizi wa Fedha wa Tazama'
    }
  ]);

  // Mini Player State
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<VideoItem | null>(null);
  const [isMiniPlayerPlaying, setIsMiniPlayerPlaying] = useState<boolean>(true);

  const toggleMiniPlayerPlay = () => {
    setIsMiniPlayerPlaying(prev => !prev);
  };

  const closeMiniPlayer = () => {
    setMiniPlayerVideo(null);
  };

  // Offline Downloads State
  const [offlineDownloads, setOfflineDownloads] = useState<OfflineDownload[]>([
    {
      videoId: INITIAL_VIDEOS[0].id,
      video: INITIAL_VIDEOS[0],
      downloadedAt: new Date(Date.now() - 86400000).toISOString(),
      fileSizeBytes: 42800000 // ~42.8 MB
    }
  ]);

  const downloadVideo = (video: VideoItem) => {
    setOfflineDownloads(prev => {
      if (prev.some(d => d.videoId === video.id)) return prev;
      return [
        {
          videoId: video.id,
          video,
          downloadedAt: new Date().toISOString(),
          fileSizeBytes: Math.floor(Math.random() * 35000000) + 18000000
        },
        ...prev
      ];
    });
  };

  const removeDownload = (videoId: string) => {
    setOfflineDownloads(prev => prev.filter(d => d.videoId !== videoId));
  };

  const isDownloaded = (videoId: string) => {
    return offlineDownloads.some(d => d.videoId === videoId);
  };

  // Data Saver Mode State
  const [isDataSaver, setIsDataSaver] = useState<boolean>(false);

  const toggleDataSaver = () => {
    setIsDataSaver(prev => !prev);
  };

  // Playlists State
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);

  const createPlaylist = (title: string, description?: string): string => {
    const newId = `pl-${Date.now()}`;
    const newPlaylist: Playlist = {
      id: newId,
      title,
      description,
      coverUrl: INITIAL_VIDEOS[0].thumbnailUrl,
      videoIds: [],
      createdAt: new Date().toISOString()
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    return newId;
  };

  const addToPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.videoIds.includes(videoId)) {
        return { ...p, videoIds: [...p.videoIds, videoId] };
      }
      return p;
    }));
  };

  const removeFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, videoIds: p.videoIds.filter(id => id !== videoId) };
      }
      return p;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  // Live Streams State
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(INITIAL_LIVE_STREAMS);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStream | null>(null);
  const [liveChatMessages, setLiveChatMessages] = useState<Record<string, LiveChatMessage[]>>({
    'live-diamond-dar': [
      {
        id: 'msg-1',
        senderName: 'Bakari Mwita',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        message: 'Kituo cha Wasafi hewani kipo moto sana leo! 🔥🔥',
        timestamp: '19:42'
      },
      {
        id: 'msg-2',
        senderName: 'Halima Khamis (Zanzibar)',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        message: 'Wimbo unaofuata tafadhali Aje na Sukari!',
        timestamp: '19:43'
      },
      {
        id: 'msg-3',
        senderName: 'Kelvin Mushi',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        message: 'Sauti iko safi sana, Tazama mmeweza sana hii!',
        isTip: true,
        tipAmountTZS: 5000,
        timestamp: '19:44'
      }
    ]
  });

  const sendLiveChatMessage = (streamId: string, text: string) => {
    const newMessage: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: profile?.displayName || 'Mtazamaji',
      senderAvatar: profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLiveChatMessages(prev => ({
      ...prev,
      [streamId]: [...(prev[streamId] || []), newMessage]
    }));
  };

  const sendLiveTip = async (streamId: string, amountTZS: number, giftName: string): Promise<boolean> => {
    if (!profile || profile.balanceTZS < amountTZS) {
      return false;
    }
    const success = deductBalance(amountTZS);
    if (success) {
      const tipMsg: LiveChatMessage = {
        id: `tip-${Date.now()}`,
        senderName: profile?.displayName || 'Shabiki Mkuu',
        senderAvatar: profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        message: `Ametuma zawadi ya ${giftName}! TZS ${amountTZS.toLocaleString()}`,
        isTip: true,
        tipAmountTZS: amountTZS,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setLiveChatMessages(prev => ({
        ...prev,
        [streamId]: [...(prev[streamId] || []), tipMsg]
      }));
      return true;
    }
    return false;
  };

  // STK Push Simulator State
  const [stkPushRequest, setStkPushRequest] = useState<STKPushRequest | null>(null);

  const triggerSTKPush = (req: STKPushRequest) => {
    setStkPushRequest(req);
  };

  const confirmSTKPush = async (pin: string): Promise<boolean> => {
    if (!pin || pin.length < 4) return false;
    // Simulate real network STK verification delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setStkPushRequest(null);
    return true;
  };

  const cancelSTKPush = () => {
    setStkPushRequest(null);
  };

  // Copyright State & Actions
  const [copyrightClaims, setCopyrightClaims] = useState<CopyrightClaim[]>(INITIAL_COPYRIGHT_CLAIMS);

  const updateCopyrightClaim = (
    claimId: string, 
    status: CopyrightClaim['status'], 
    actionTaken?: 'takedown_strike' | 'warning' | 'dismissed', 
    notes?: string
  ) => {
    setCopyrightClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, status, actionTaken, notes: notes || c.notes };
      }
      return c;
    }));
    addAuditLog(
      `COPYRIGHT_CLAIM_${status.toUpperCase()}`,
      `Claim ID: ${claimId}`,
      `Hatua: ${actionTaken || status}. Maelezo: ${notes || 'Hakuna'}`,
      status === 'approved' ? 'SUCCESS' : 'WARNING'
    );
  };

  // Creator Verification Requests
  const [verificationRequests, setVerificationRequests] = useState<CreatorVerificationRequest[]>(INITIAL_VERIFICATION_REQUESTS);

  const updateVerificationRequest = (reqId: string, status: 'approved' | 'rejected') => {
    setVerificationRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return { ...r, status, reviewedAt: new Date().toISOString() };
      }
      return r;
    }));
    const req = verificationRequests.find(r => r.id === reqId);
    if (req && status === 'approved') {
      toggleChannelVerification(req.channelId);
    }
    addAuditLog(
      `CREATOR_VERIFICATION_${status.toUpperCase()}`,
      `Channel: ${req?.channelName || reqId}`,
      `Ombi la uthibitisho wa akaunti limekuwa ${status === 'approved' ? 'limeidhinishwa' : 'limekataliwa'}.`,
      status === 'approved' ? 'SUCCESS' : 'WARNING'
    );
  };

  // Creator Monetization Applications
  const [monetizationApplications, setMonetizationApplications] = useState<CreatorMonetizationApplication[]>(INITIAL_MONETIZATION_APPLICATIONS);

  const updateMonetizationApplication = (appId: string, status: 'approved' | 'rejected', notes?: string) => {
    setMonetizationApplications(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, status, notes: notes || a.notes };
      }
      return a;
    }));
    const app = monetizationApplications.find(a => a.id === appId);
    if (app && status === 'approved') {
      setChannels(prev => prev.map(c => c.id === app.channelId ? { ...c, isMonetized: true } : c));
    }
    addAuditLog(
      `MONETIZATION_${status.toUpperCase()}`,
      `Creator: ${app?.channelName || appId}`,
      `Ombi la monetization ${status === 'approved' ? 'limeidhinishwa' : 'limekataliwa'}. ${notes || ''}`,
      status === 'approved' ? 'SUCCESS' : 'WARNING'
    );
  };

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);

  const addPromoCode = (promo: Omit<PromoCode, 'id' | 'usedCount'>) => {
    const newPromo: PromoCode = {
      ...promo,
      id: `promo-${Date.now()}`,
      usedCount: 0
    };
    setPromoCodes(prev => [newPromo, ...prev]);
    addAuditLog('PROMO_CODE_CREATED', `Code: ${promo.code}`, `Punguzo la ${promo.discountPercent}% linafanya kazi hadi ${promo.validUntil}.`, 'SUCCESS');
  };

  const togglePromoCode = (promoId: string) => {
    setPromoCodes(prev => prev.map(p => p.id === promoId ? { ...p, isActive: !p.isActive } : p));
  };

  const deletePromoCode = (promoId: string) => {
    setPromoCodes(prev => prev.filter(p => p.id !== promoId));
    addAuditLog('PROMO_CODE_DELETED', `Promo ID: ${promoId}`, `Msimbo wa promo umefutwa.`, 'WARNING');
  };

  // User Appeals & Recovery
  const [userAppeals, setUserAppeals] = useState<UserAppeal[]>(INITIAL_USER_APPEALS);

  const updateUserAppeal = (appealId: string, status: 'approved' | 'rejected', notes?: string) => {
    setUserAppeals(prev => prev.map(a => {
      if (a.id === appealId) {
        return { ...a, status, decisionNotes: notes };
      }
      return a;
    }));
    const appeal = userAppeals.find(a => a.id === appealId);
    if (appeal && status === 'approved') {
      toggleBlockUser(appeal.userId);
    }
    addAuditLog(
      `APPEAL_${status.toUpperCase()}`,
      `User: ${appeal?.userName || appealId}`,
      `Rufaa ya mtumiaji ${status === 'approved' ? 'imekubaliwa na akaunti imefunguliwa' : 'imekataliwa'}. ${notes || ''}`,
      status === 'approved' ? 'SUCCESS' : 'WARNING'
    );
  };

  // Security Logs & Events
  const [securityLogs, setSecurityLogs] = useState<SecurityLogEvent[]>(INITIAL_SECURITY_LOGS);

  const addSecurityLog = (event: Omit<SecurityLogEvent, 'id' | 'timestamp'>) => {
    const newEvent: SecurityLogEvent = {
      ...event,
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setSecurityLogs(prev => [newEvent, ...prev]);
  };

  // Ad Campaigns State
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(SAMPLE_AD_CAMPAIGNS);

  const addAdCampaign = (campaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'spendTZS'>) => {
    const newCamp: AdCampaign = {
      ...campaign,
      id: `ad-${Date.now()}`,
      impressions: 0,
      clicks: 0,
      spendTZS: 0
    };
    setAdCampaigns(prev => [newCamp, ...prev]);
    addAuditLog('AD_CAMPAIGN_CREATED', `Campaign: ${campaign.title}`, `Mtangazaji: ${campaign.advertiserName}, Bajeti: TZS ${campaign.budgetTZS.toLocaleString()}`, 'SUCCESS');
  };

  const updateAdCampaignStatus = (campaignId: string, status: AdCampaign['status']) => {
    setAdCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status } : c));
    addAuditLog('AD_CAMPAIGN_STATUS', `Campaign ID: ${campaignId}`, `Hali mpya: ${status}`, 'SUCCESS');
  };

  // Featured Videos State
  const [featuredVideoIds, setFeaturedVideoIds] = useState<string[]>(['vid-wasafi-fest', 'vid-sgr-dar']);

  const toggleFeaturedVideo = (videoId: string) => {
    setFeaturedVideoIds(prev => {
      const exists = prev.includes(videoId);
      const next = exists ? prev.filter(id => id !== videoId) : [...prev, videoId];
      addAuditLog(
        exists ? 'FEATURED_VIDEO_REMOVED' : 'FEATURED_VIDEO_ADDED',
        `Video ID: ${videoId}`,
        exists ? 'Video imeondolewa kwenye zilizopendekezwa ukurasa mkuu.' : 'Video imewekwa kuwa Featured kwenye ukurasa mkuu.',
        'SUCCESS'
      );
      return next;
    });
  };

  // Creator Studio Specific Operations & State
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [membershipTiers, setMembershipTiers] = useState<CreatorMembershipTier[]>(INITIAL_CREATOR_MEMBERSHIP_TIERS);
  const [subtitles, setSubtitles] = useState<VideoSubtitleTrack[]>(INITIAL_VIDEO_SUBTITLES);
  const [creatorPromotions, setCreatorPromotions] = useState<CreatorPromotion[]>(INITIAL_CREATOR_PROMOTIONS);

  const editVideo = (videoId: string, updates: Partial<VideoItem>) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...updates } : v));
    setShorts(prev => prev.map(s => s.id === videoId ? { ...s, ...updates } : s));
  };

  const bulkDeleteVideos = (videoIds: string[]) => {
    setVideos(prev => prev.filter(v => !videoIds.includes(v.id)));
    setShorts(prev => prev.filter(s => !videoIds.includes(s.id)));
  };

  const bulkUpdateVisibility = (videoIds: string[], visibility: 'public' | 'unlisted' | 'private') => {
    setVideos(prev => prev.map(v => videoIds.includes(v.id) ? { ...v, visibility } : v));
    setShorts(prev => prev.map(s => videoIds.includes(s.id) ? { ...s, visibility } : s));
  };

  const addCommunityPost = (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => {
    const newPost: CommunityPost = {
      ...post,
      id: 'post-' + Date.now(),
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };
    setCommunityPosts(prev => [newPost, ...prev]);
  };

  const likeCommunityPost = (postId: string) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likesCount: p.isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1
        };
      }
      return p;
    }));
  };

  const deleteCommunityPost = (postId: string) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== postId));
  };

  const addMembershipTier = (tier: Omit<CreatorMembershipTier, 'id' | 'memberCount'>) => {
    const newTier: CreatorMembershipTier = {
      ...tier,
      id: 'tier-' + Date.now(),
      memberCount: 0
    };
    setMembershipTiers(prev => [...prev, newTier]);
  };

  const addSubtitleTrack = (track: Omit<VideoSubtitleTrack, 'id' | 'updatedAt'>) => {
    const newTrack: VideoSubtitleTrack = {
      ...track,
      id: 'sub-' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    setSubtitles(prev => [newTrack, ...prev]);
  };

  const deleteSubtitleTrack = (subId: string) => {
    setSubtitles(prev => prev.filter(s => s.id !== subId));
  };

  const addCreatorPromotion = (promo: Omit<CreatorPromotion, 'id' | 'spentTZS' | 'impressions' | 'clicks' | 'startDate'>) => {
    const newPromo: CreatorPromotion = {
      ...promo,
      id: 'promo-' + Date.now(),
      spentTZS: 0,
      impressions: 0,
      clicks: 0,
      startDate: new Date().toISOString()
    };
    setCreatorPromotions(prev => [newPromo, ...prev]);
  };

  const togglePromotionStatus = (promoId: string) => {
    setCreatorPromotions(prev => prev.map(p => {
      if (p.id === promoId) {
        return { ...p, status: p.status === 'active' ? 'paused' : 'active' };
      }
      return p;
    }));
  };

  const applyForVerification = (channelId: string, docType: CreatorVerificationRequest['documentType'], docNum: string): boolean => {
    const ch = channels.find(c => c.id === channelId);
    const newReq: CreatorVerificationRequest = {
      id: 'verif-' + Date.now(),
      userId: profile?.uid || 'user-current',
      userName: profile?.displayName || 'Creator User',
      channelId,
      channelName: ch?.name || 'My Channel',
      subscriberCount: ch?.subscriberCount || 1200,
      documentType: docType,
      documentNumber: docNum,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setVerificationRequests(prev => [newReq, ...prev]);
    return true;
  };

  const applyForMonetization = (channelId: string): boolean => {
    const ch = channels.find(c => c.id === channelId);
    const newApp: CreatorMonetizationApplication = {
      id: 'mon-' + Date.now(),
      userId: profile?.uid || 'user-current',
      userName: profile?.displayName || 'Creator User',
      channelId,
      channelName: ch?.name || 'My Channel',
      subscriberCount: ch?.subscriberCount || 1200,
      watchHours: 4120,
      totalViews: 92400,
      strikesCount: 0,
      paymentDetailsConfigured: true,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: 'Ombi la kujiunga na Mpango wa Mapato ya Waumbaji (Tazama Creator Partner Program)'
    };
    setMonetizationApplications(prev => [newApp, ...prev]);
    return true;
  };

  const submitCopyrightAppeal = (claimId: string, explanation: string) => {
    setCopyrightClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'disputed',
          notes: `Rufaa imewasilishwa na Creator: ${explanation}`
        };
      }
      return c;
    }));
  };

  const updateChannelInfo = (channelId: string, updates: Partial<Channel>) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, ...updates } : c));
  };


  // Track deduplicated views in current session
  const [viewedVideoIds, setViewedVideoIds] = useState<Set<string>>(new Set());

  const recordView = (videoId: string) => {
    if (viewedVideoIds.has(videoId)) return; // Prevent duplicate counts in session
    setViewedVideoIds(prev => new Set(prev).add(videoId));
    
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        return { ...v, viewsCount: v.viewsCount + 1 };
      }
      return v;
    }));

    // Add to history
    const target = videos.find(v => v.id === videoId) || shorts.find(s => s.id === videoId);
    if (target) {
      setWatchHistory(prev => [target, ...prev.filter(item => item.id !== videoId)].slice(0, 50));
    }
  };

  const toggleSubscribe = (channelId: string) => {
    setUserSubscriptions(prev => {
      const isSubbed = prev.includes(channelId);
      const updated = isSubbed ? prev.filter(id => id !== channelId) : [...prev, channelId];
      
      // Update channel subscriber count
      setChannels(chList => chList.map(ch => {
        if (ch.id === channelId) {
          return {
            ...ch,
            subscriberCount: isSubbed ? Math.max(0, ch.subscriberCount - 1) : ch.subscriberCount + 1
          };
        }
        return ch;
      }));

      return updated;
    });
  };

  const toggleLike = (videoId: string) => {
    setLikedVideoIds(prev => {
      const isLiked = prev.includes(videoId);
      const updated = isLiked ? prev.filter(id => id !== videoId) : [...prev, videoId];

      setVideos(vids => vids.map(v => {
        if (v.id === videoId) {
          return {
            ...v,
            likesCount: isLiked ? Math.max(0, v.likesCount - 1) : v.likesCount + 1
          };
        }
        return v;
      }));

      setShorts(shList => shList.map(s => {
        if (s.id === videoId) {
          return {
            ...s,
            likesCount: isLiked ? Math.max(0, s.likesCount - 1) : s.likesCount + 1
          };
        }
        return s;
      }));

      return updated;
    });
  };

  const addComment = (videoId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: CommentItem = {
      id: 'comment-' + Date.now(),
      videoId,
      userId: profile?.uid || 'guest-user',
      userName: profile?.displayName || 'Mwanachama wa Tazama',
      userAvatar: profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: text.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString()
    };

    setComments(prev => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])]
    }));

    setVideos(vids => vids.map(v => v.id === videoId ? { ...v, commentsCount: v.commentsCount + 1 } : v));
  };

  const sendGiftToCreator = async (
    videoId: string, 
    channelId: string, 
    giftId: string, 
    message?: string
  ): Promise<boolean> => {
    const giftConfig = VIRTUAL_GIFTS.find(g => g.id === giftId);
    if (!giftConfig) return false;

    // Deduct user's TZS wallet balance
    const success = deductBalance(giftConfig.priceTZS);
    if (!success) return false;

    const newTx: GiftTransaction = {
      id: 'tx-' + Date.now(),
      senderId: profile?.uid || 'guest',
      senderName: profile?.displayName || 'Shabiki wa Tazama',
      channelId,
      videoId,
      giftId: giftConfig.id,
      giftName: giftConfig.name.sw,
      icon: giftConfig.icon,
      amountTZS: giftConfig.priceTZS,
      message,
      createdAt: new Date().toISOString()
    };

    setGiftTransactions(prev => [newTx, ...prev]);

    // Attribute earnings to the channel
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          monthlyEarningsTZS: (ch.monthlyEarningsTZS || 0) + giftConfig.priceTZS
        };
      }
      return ch;
    }));

    return true;
  };

  const joinMembership = async (
    channelId: string, 
    tierId: string, 
    tierName: string, 
    priceTZS: number
  ): Promise<boolean> => {
    const success = deductBalance(priceTZS);
    if (!success) return false;

    const newMembership: UserMembership = {
      id: 'mship-' + Date.now(),
      userId: profile?.uid || 'user-guest',
      channelId,
      tierId,
      tierName,
      monthlyFeeTZS: priceTZS,
      status: 'active',
      renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    setMemberships(prev => [newMembership, ...prev]);

    // Attribute creator membership revenue
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          monthlyEarningsTZS: (ch.monthlyEarningsTZS || 0) + priceTZS
        };
      }
      return ch;
    }));

    return true;
  };

  const submitReport = (
    targetType: 'video' | 'comment' | 'channel', 
    targetId: string, 
    targetTitle: string, 
    reason: string, 
    details: string
  ) => {
    const newReport: ContentReport = {
      id: 'rep-' + Date.now(),
      reporterId: profile?.uid || 'guest',
      targetType,
      targetId,
      targetTitle,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
  };

  const updateReportStatus = (reportId: string, newStatus: ContentReport['status']) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
  };

  const uploadNewVideo = async (videoData: Partial<VideoItem>): Promise<VideoItem> => {
    const newVid: VideoItem = {
      id: 'vid-cf-' + Date.now(),
      channelId: profile?.channelId || 'ch-wasafi',
      channelName: profile?.displayName || 'Kituo Changu cha Tazama',
      channelAvatar: profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      channelOwnerId: profile?.uid,
      isChannelVerified: true,
      title: videoData.title || 'Video Isiyo na Jina',
      description: videoData.description || '',
      videoUrl: videoData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      streamPlaybackId: 'cf-stream-direct-' + Math.random().toString(36).substring(7),
      thumbnailUrl: videoData.thumbnailUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      durationSeconds: videoData.durationSeconds || 180,
      category: (videoData.category as VideoCategory) || 'Burudani',
      tags: videoData.tags || ['Tazama', 'Tanzania'],
      visibility: videoData.visibility || 'public',
      isShort: videoData.isShort || false,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      processingStatus: 'ready',
      createdAt: new Date().toISOString()
    };

    if (newVid.isShort) {
      setShorts(prev => [newVid, ...prev]);
    } else {
      setVideos(prev => [newVid, ...prev]);
    }

    return newVid;
  };

  const requestPayout = (
    amountTZS: number, 
    provider: PayoutRequest['provider'], 
    accountNumber: string, 
    accountHolderName: string
  ): boolean => {
    if (amountTZS < 10000) return false;
    const newReq: PayoutRequest = {
      id: 'pay-' + Date.now(),
      creatorId: profile?.uid || 'user-current',
      channelName: profile?.displayName || 'Creator Channel',
      amountTZS: Math.round(amountTZS),
      provider,
      accountNumber,
      accountHolderName,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    setPayoutRequests(prev => [newReq, ...prev]);
    return true;
  };

  const addAuditLog = (
    action: string, 
    target: string, 
    details: string, 
    status: 'SUCCESS' | 'WARNING' | 'REJECTED' = 'SUCCESS'
  ) => {
    const newLog: AuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      adminEmail: profile?.email || 'amytzee@gmail.com',
      target,
      details,
      status,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const deleteUser = (uid: string): boolean => {
    const targetUser = users.find(u => u.uid === uid);
    if (!targetUser) return false;
    
    // Prevent deleting primary super admin
    if (targetUser.email === 'amytzee@gmail.com' && users.filter(u => u.role === 'admin').length <= 1) {
      addAuditLog('DELETE_USER_PREVENTED', targetUser.email, 'Kushindwa kufuta Root Super Admin wa mfumo.', 'REJECTED');
      return false;
    }

    setUsers(prev => prev.filter(u => u.uid !== uid));
    if (targetUser.channelId) {
      setChannels(prev => prev.filter(c => c.id !== targetUser.channelId));
      setVideos(prev => prev.filter(v => v.channelId !== targetUser.channelId));
      setShorts(prev => prev.filter(s => s.channelId !== targetUser.channelId));
    }
    addAuditLog('USER_DELETED', targetUser.displayName || targetUser.email, `Mtumiaji ${targetUser.email} amefutwa kabisa kwenye mfumo.`);
    return true;
  };

  const toggleBlockUser = (uid: string, reason?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        const nextBlocked = !u.isBlocked;
        const note = nextBlocked 
          ? (reason || 'Akaunti imezuiwa na msimamizi kwa kukiuka miongozo ya jamii ya Tazama.')
          : undefined;
        
        addAuditLog(
          nextBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
          u.displayName || u.email,
          nextBlocked ? `Mtumiaji amezuiwa: ${note}` : 'Mtumiaji amefunguliwa na kuruhusiwa kutumia huduma zote za jukwaa.',
          nextBlocked ? 'WARNING' : 'SUCCESS'
        );

        return {
          ...u,
          isBlocked: nextBlocked,
          blockReason: note
        };
      }
      return u;
    }));

    // Also update their channel status if user owns a channel
    const target = users.find(u => u.uid === uid);
    if (target?.channelId) {
      setChannels(prev => prev.map(c => {
        if (c.id === target.channelId) {
          return { ...c, isBlocked: !target.isBlocked, blockReason: reason };
        }
        return c;
      }));
    }
  };

  const updateUserRole = (uid: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        addAuditLog('USER_ROLE_CHANGED', u.displayName || u.email, `Jukumu la mtumiaji limebadilishwa kutoka ${u.role} kwenda ${newRole}.`);
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  const updateUserBalance = (uid: string, deltaTZS: number) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        const newBal = Math.max(0, u.balanceTZS + Math.round(deltaTZS));
        addAuditLog('USER_BALANCE_ADJUSTED', u.displayName || u.email, `Salio limebadilishwa kwa TZS ${deltaTZS >= 0 ? '+' : ''}${deltaTZS.toLocaleString()} (Salio jipya: TZS ${newBal.toLocaleString()}).`);
        return { ...u, balanceTZS: newBal };
      }
      return u;
    }));
  };

  const toggleChannelVerification = (channelId: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        const nextVerified = !c.isVerified;
        addAuditLog(
          nextVerified ? 'CHANNEL_VERIFIED' : 'CHANNEL_UNVERIFIED',
          c.name,
          nextVerified ? 'Kituo kimeidhinishwa na kupewa beji ya uthibitisho.' : 'Beji ya uthibitisho imeondolewa kwenye kituo.'
        );
        return { ...c, isVerified: nextVerified };
      }
      return c;
    }));

    // Update videos cache
    setVideos(prev => prev.map(v => v.channelId === channelId ? { ...v, isChannelVerified: !v.isChannelVerified } : v));
  };

  const toggleBlockChannel = (channelId: string, reason?: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        const nextBlocked = !c.isBlocked;
        addAuditLog(
          nextBlocked ? 'CHANNEL_BLOCKED' : 'CHANNEL_UNBLOCKED',
          c.name,
          nextBlocked ? `Kituo kimezuiwa: ${reason || 'Ukiukaji wa haki za kidijitali'}` : 'Kituo kimefunguliwa tena hadharani.',
          nextBlocked ? 'WARNING' : 'SUCCESS'
        );
        return { ...c, isBlocked: nextBlocked, blockReason: reason };
      }
      return c;
    }));
  };

  const deleteVideo = (videoId: string) => {
    const target = videos.find(v => v.id === videoId) || shorts.find(s => s.id === videoId);
    setVideos(prev => prev.filter(v => v.id !== videoId));
    setShorts(prev => prev.filter(s => s.id !== videoId));
    setReports(prev => prev.filter(r => r.targetId !== videoId));
    if (target) {
      addAuditLog('VIDEO_DELETED', target.title, `Video "${target.title}" imefutwa kabisa na msimamizi wa mfumo.`);
    }
  };

  const updateVideoStatus = (
    videoId: string, 
    status: 'ready' | 'processing' | 'error', 
    visibility?: 'public' | 'unlisted' | 'private'
  ) => {
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        return { 
          ...v, 
          processingStatus: status, 
          ...(visibility ? { visibility } : {}) 
        };
      }
      return v;
    }));
    addAuditLog('VIDEO_STATUS_UPDATED', videoId, `Hali ya video imewekwa kuwa ${status}${visibility ? `, ufikiaji: ${visibility}` : ''}`);
  };

  const updatePremiumPlan = (planId: string, updates: Partial<PremiumPlan>) => {
    setPremiumPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updated = { ...p, ...updates };
        addAuditLog('PREMIUM_PLAN_UPDATED', p.name, `Kifurushi cha Premium ${p.name} kimebadilishwa. Bei: TZS ${updated.priceTZS.toLocaleString()}`);
        return updated;
      }
      return p;
    }));
  };

  const addPremiumPlan = (planData: Omit<PremiumPlan, 'id' | 'subscribersCount'>) => {
    const newPlan: PremiumPlan = {
      ...planData,
      id: 'plan-' + Date.now(),
      subscribersCount: 0
    };
    setPremiumPlans(prev => [...prev, newPlan]);
    addAuditLog('PREMIUM_PLAN_CREATED', newPlan.name, `Kifurushi kipya cha Premium kimeongezwa: ${newPlan.name} (TZS ${newPlan.priceTZS.toLocaleString()})`);
  };

  const subscribeToPremiumPlan = async (planId: string): Promise<boolean> => {
    const plan = premiumPlans.find(p => p.id === planId);
    if (!plan) return false;

    if (plan.priceTZS > 0) {
      const ok = deductBalance(plan.priceTZS);
      if (!ok) return false;
    }

    setPremiumPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, subscribersCount: (p.subscribersCount || 0) + 1 };
      }
      return p;
    }));

    addAuditLog('PREMIUM_SUBSCRIPTION_ACTIVE', plan.name, `Mtumiaji amejiunga na kifurushi cha ${plan.name} kwa TZS ${plan.priceTZS.toLocaleString()}`);
    return true;
  };

  const updatePayoutStatus = (
    payoutId: string, 
    status: 'approved' | 'rejected' | 'processed', 
    notes?: string
  ) => {
    setPayoutRequests(prev => prev.map(p => {
      if (p.id === payoutId) {
        const updated: PayoutRequest = {
          ...p,
          status,
          processedAt: new Date().toISOString(),
          notes: notes || p.notes
        };
        addAuditLog(
          status === 'approved' ? 'PAYOUT_APPROVED' : status === 'rejected' ? 'PAYOUT_REJECTED' : 'PAYOUT_PROCESSED',
          p.channelName,
          `Ombi la kutoa TZS ${p.amountTZS.toLocaleString()} kwenda ${p.provider} (${p.accountNumber}) limebadilishwa kuwa: ${status.toUpperCase()}`,
          status === 'rejected' ? 'WARNING' : 'SUCCESS'
        );
        return updated;
      }
      return p;
    }));
  };

  const updatePlatformSettings = (newSettings: Partial<PlatformSettings>) => {
    setPlatformSettings(prev => {
      const merged = { ...prev, ...newSettings };
      addAuditLog('PLATFORM_SETTINGS_UPDATED', 'Global Configuration', `Mipangilio ya jukwaa imesasishwa: Kamisheni ${merged.platformCommissionPercent}%, Gawio ${merged.creatorRevenuePercent}%, Kima cha chini TZS ${merged.minPayoutTZS.toLocaleString()}`);
      return merged;
    });
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        shorts,
        channels,
        users,
        premiumPlans,
        platformSettings,
        auditLogs,
        currentVideo,
        searchQuery,
        selectedCategory,
        userSubscriptions,
        likedVideoIds,
        watchHistory,
        comments,
        giftTransactions,
        memberships,
        reports,
        payoutRequests,
        setCurrentVideo,
        setSearchQuery,
        setSelectedCategory,
        toggleSubscribe,
        toggleLike,
        recordView,
        addComment,
        sendGiftToCreator,
        joinMembership,
        submitReport,
        uploadNewVideo,
        requestPayout,
        updateReportStatus,
        deleteUser,
        toggleBlockUser,
        updateUserRole,
        updateUserBalance,
        toggleChannelVerification,
        toggleBlockChannel,
        deleteVideo,
        updateVideoStatus,
        updatePremiumPlan,
        addPremiumPlan,
        subscribeToPremiumPlan,
        updatePayoutStatus,
        updatePlatformSettings,
        addAuditLog,
        // Mini Player
        miniPlayerVideo,
        isMiniPlayerPlaying,
        setMiniPlayerVideo,
        toggleMiniPlayerPlay,
        closeMiniPlayer,
        // Offline Downloads
        offlineDownloads,
        downloadVideo,
        removeDownload,
        isDownloaded,
        // Data Saver
        isDataSaver,
        toggleDataSaver,
        // Playlists
        playlists,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        // Live Streams
        liveStreams,
        activeLiveStream,
        setActiveLiveStream,
        liveChatMessages,
        sendLiveChatMessage,
        sendLiveTip,
        // STK Push Simulator
        stkPushRequest,
        triggerSTKPush,
        confirmSTKPush,
        cancelSTKPush,
        // Copyright
        copyrightClaims,
        updateCopyrightClaim,
        // Verification
        verificationRequests,
        updateVerificationRequest,
        // Monetization
        monetizationApplications,
        updateMonetizationApplication,
        // Promo Codes
        promoCodes,
        addPromoCode,
        togglePromoCode,
        deletePromoCode,
        // User Appeals
        userAppeals,
        updateUserAppeal,
        // Security
        securityLogs,
        addSecurityLog,
        // Ad Campaigns
        adCampaigns,
        addAdCampaign,
        updateAdCampaignStatus,
        // Featured
        featuredVideoIds,
        toggleFeaturedVideo,
        // Creator Studio
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
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};
