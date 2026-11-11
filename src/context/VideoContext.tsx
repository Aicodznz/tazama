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
  AdFormat,
  AdStatus,
  CommunityPost,
  CreatorMembershipTier,
  VideoSubtitleTrack,
  CreatorPromotion,
  TazamaNotification
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
  INITIAL_CREATOR_PROMOTIONS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { db, doc, setDoc, deleteDoc, collection, onSnapshot, getDocs, query, where } from '../lib/firebase';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';

const SEED_VIDEO_MAP = new Map<string, VideoItem>(
  INITIAL_VIDEOS.filter(v => Boolean(v && v.id)).map(v => [v.id, v])
);
const SEED_CHANNEL_MAP = new Map<string, Channel>(
  INITIAL_CHANNELS.filter(c => Boolean(c && c.id)).map(c => [c.id, c])
);

const isStaleSeedUrl = (url?: string): boolean => {
  if (!url) return true;
  return url.includes('unsplash.com') || url.includes('img.youtube.com');
};

const preserveLocalSeedVideo = (incoming: VideoItem, existing?: VideoItem): VideoItem => {
  const seed = SEED_VIDEO_MAP.get(incoming.id);
  const merged = existing ? { ...existing, ...incoming } : incoming;
  if (!seed) return merged;
  return {
    ...merged,
    videoUrl: seed.videoUrl,
    thumbnailUrl: isStaleSeedUrl(merged.thumbnailUrl) ? seed.thumbnailUrl : merged.thumbnailUrl,
    channelAvatar: isStaleSeedUrl(merged.channelAvatar) ? seed.channelAvatar : merged.channelAvatar,
  };
};

const preserveLocalSeedChannel = (incoming: Channel, existing?: Channel): Channel => {
  const seed = SEED_CHANNEL_MAP.get(incoming.id);
  const merged = existing ? { ...existing, ...incoming } : incoming;
  if (!seed) return merged;
  return {
    ...merged,
    avatarUrl: isStaleSeedUrl(merged.avatarUrl) ? seed.avatarUrl : merged.avatarUrl,
    bannerUrl: isStaleSeedUrl(merged.bannerUrl) ? seed.bannerUrl : merged.bannerUrl,
  };
};

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
  syncServerViews: (videoId: string, serverViewsCount: number, uniqueViewers?: number, watchTimeSeconds?: number) => void;
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
  // Playback Queue
  playbackQueue: VideoItem[];
  addToQueue: (video: VideoItem) => void;
  removeFromQueue: (videoId: string) => void;
  clearQueue: () => void;
  isInQueue: (videoId: string) => boolean;
  // Feed Preferences (Not Interested / Hide Channel)
  notInterestedIds: string[];
  hiddenChannelIds: string[];
  markNotInterested: (videoId: string) => void;
  undoNotInterested: (videoId: string) => void;
  hideChannelRecommendations: (channelId: string) => void;
  unhideChannelRecommendations: (channelId: string) => void;
  // Playlists
  playlists: Playlist[];
  createPlaylist: (title: string, description?: string) => string;
  addToPlaylist: (playlistId: string, videoId: string) => void;
  removeFromPlaylist: (playlistId: string, videoId: string) => void;
  toggleWatchLater: (videoId: string) => boolean;
  isInWatchLater: (videoId: string) => boolean;
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
  copyrightClaims: CopyrightClaim[];
  updateCopyrightClaim: (
    claimId: string, 
    status: CopyrightClaim['status'], 
    actionTaken?: 'takedown_strike' | 'divert_revenue' | 'revenue_share' | 'warning' | 'dismissed', 
    notes?: string
  ) => void;
  submitCounterNotice: (claimId: string, counterText: string) => void;
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
  addAdCampaign: (campaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'spendTZS' | 'createdAt'>) => string;
  updateAdCampaignStatus: (campaignId: string, status: AdCampaign['status']) => void;
  approveAdCampaign: (campaignId: string, adminEmail?: string) => void;
  rejectAdCampaign: (campaignId: string, reason: string, adminEmail?: string) => void;
  recordAdImpression: (campaignId: string) => void;
  recordAdClick: (campaignId: string) => void;
  getActiveAds: (format?: AdFormat | AdFormat[]) => AdCampaign[];
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
  // Notifications
  notifications: TazamaNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<TazamaNotification, 'id' | 'createdAt'>) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, deductBalance } = useAuth();

  // PRODUCTION STATE: Start with clean seed videos + dynamic user uploads
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_custom_videos');
      const map = new Map<string, VideoItem>();
      INITIAL_VIDEOS.forEach(v => { if (v && v.id) map.set(v.id, v); });
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.filter((item: any) => Boolean(item && item.id && item.videoUrl && item.title)).forEach(v => {
            map.set(v.id, preserveLocalSeedVideo(v));
          });
        }
      }
      const combined = Array.from(map.values());
      try { localStorage.setItem('tazama_custom_videos', JSON.stringify(combined)); } catch {}
      return combined;
    } catch {}
    return INITIAL_VIDEOS;
  });

  const [shorts, setShorts] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_custom_shorts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((item: any) => Boolean(item && item.id && item.videoUrl && item.title));
          try { localStorage.setItem('tazama_custom_shorts', JSON.stringify(cleaned)); } catch {}
          return cleaned;
        }
      }
    } catch {}
    return [];
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_custom_channels');
      const map = new Map<string, Channel>();
      INITIAL_CHANNELS.forEach(c => { if (c && c.id) map.set(c.id, c); });
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.filter((item: any) => Boolean(item && item.id && item.name)).forEach(c => {
            map.set(c.id, preserveLocalSeedChannel(c));
          });
        }
      }
      const combinedChannels = Array.from(map.values());
      try { localStorage.setItem('tazama_custom_channels', JSON.stringify(combinedChannels)); } catch {}
      return combinedChannels;
    } catch {}
    return INITIAL_CHANNELS;
  });

  // Global Sync: Listen in real-time to Firestore videos & channels + sync with server API
  useEffect(() => {
    // 1. Initial fetch from server API
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          const serverVideos: VideoItem[] = data.videos.filter((v: any) => Boolean(v && v.id && v.videoUrl));

    // 1b. Initial fetch for ad campaigns from server API
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.ads) && data.ads.length > 0) {
          setAdCampaigns(prev => {
            const map = new Map<string, AdCampaign>();
            prev.forEach(a => { if (a && a.id) map.set(a.id, a); });
            data.ads.forEach((a: AdCampaign) => {
              if (a && a.id) map.set(a.id, a);
            });
            const merged = Array.from(map.values());
            try { localStorage.setItem('tazama_custom_ads', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});
          const serverLongVideos = serverVideos.filter(v => !v.isShort);
          const serverShorts = serverVideos.filter(v => Boolean(v.isShort));

          setVideos(prev => {
            const map = new Map<string, VideoItem>();
            prev.forEach(v => { if (v && v.id) map.set(v.id, v); });
            serverLongVideos.forEach(v => {
              const existing = map.get(v.id);
              const nextVideo = preserveLocalSeedVideo(v, existing);
              map.set(v.id, {
                ...nextVideo,
                viewsCount: typeof v.viewsCount === 'number' ? v.viewsCount : (existing?.viewsCount || 0),
                likesCount: Math.max(v.likesCount || 0, existing?.likesCount || 0)
              });
            });
            const merged = Array.from(map.values());
            try { localStorage.setItem('tazama_custom_videos', JSON.stringify(merged)); } catch {}
            return merged;
          });

          setShorts(prev => {
            const map = new Map<string, VideoItem>();
            prev.forEach(s => { if (s && s.id) map.set(s.id, s); });
            serverShorts.forEach(s => {
              const existing = map.get(s.id);
              if (existing) {
                map.set(s.id, {
                  ...existing,
                  ...s,
                  viewsCount: typeof s.viewsCount === 'number' ? s.viewsCount : (existing.viewsCount || 0),
                  likesCount: Math.max(s.likesCount || 0, existing.likesCount || 0)
                });
              } else {
                map.set(s.id, s);
              }
            });
            const merged = Array.from(map.values());
            try { localStorage.setItem('tazama_custom_shorts', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      })
      .catch(err => console.warn('Could not fetch server videos:', err));

    // 2. Initial fetch from server channels
    fetch('/api/channels')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.channels) && data.channels.length > 0) {
          setChannels(prev => {
            const map = new Map<string, Channel>();
            prev.forEach(c => { if (c && c.id) map.set(c.id, c); });
            data.channels.forEach((c: Channel) => {
              const existing = map.get(c.id);
              const nextChannel = preserveLocalSeedChannel(c, existing);
              map.set(c.id, {
                ...nextChannel,
                totalViews: Math.max(c.totalViews || 0, existing?.totalViews || 0),
                subscriberCount: Math.max(c.subscriberCount || 0, existing?.subscriberCount || 0)
              });
            });
            const merged = Array.from(map.values());
            try { localStorage.setItem('tazama_custom_channels', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});

    // 3. Real-Time Firestore Listener for all uploaded Videos
    let unsubscribeVideos: (() => void) | undefined;
    try {
      unsubscribeVideos = onSnapshot(collection(db, 'videos'), (snapshot) => {
        const firestoreList: VideoItem[] = [];
        snapshot.forEach((docSnap) => {
          const vData = docSnap.data() as VideoItem;
          if (vData && (vData.id || docSnap.id)) {
            firestoreList.push({
              ...vData,
              id: vData.id || docSnap.id
            });
          }
        });

        if (firestoreList.length > 0) {
          const longVids = firestoreList.filter(v => !v.isShort);
          const shortVids = firestoreList.filter(v => Boolean(v.isShort));

          setVideos(prev => {
            const map = new Map<string, VideoItem>();
            prev.forEach(v => { if (v && v.id) map.set(v.id, v); });
            longVids.forEach(v => {
              const existing = map.get(v.id);
              const nextVideo = preserveLocalSeedVideo(v, existing);
              map.set(v.id, {
                ...nextVideo,
                viewsCount: Math.max(v.viewsCount || 0, existing?.viewsCount || 0),
                likesCount: Math.max(v.likesCount || 0, existing?.likesCount || 0)
              });
            });
            const merged = Array.from(map.values());
            try { localStorage.setItem('tazama_custom_videos', JSON.stringify(merged)); } catch {}
            return merged;
          });

          setShorts(prev => {
            const map = new Map<string, VideoItem>();
            prev.forEach(s => { if (s && s.id) map.set(s.id, s); });
            shortVids.forEach(s => {
              const existing = map.get(s.id);
              if (existing) {
                map.set(s.id, {
                  ...existing,
                  ...s,
                  viewsCount: Math.max(s.viewsCount || 0, existing.viewsCount || 0),
                  likesCount: Math.max(s.likesCount || 0, existing.likesCount || 0)
                });
              } else {
                map.set(s.id, s);
              }
            });
            const merged = Array.from(map.values());
            try { localStorage.setItem('tazama_custom_shorts', JSON.stringify(merged)); } catch {}
            return merged;
          });

          // Sync to server disk cache so all clients have fast fallback
          fetch('/api/videos/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videos: firestoreList })
          }).catch(() => {});
        }
      }, (err) => {
        console.warn('Firestore onSnapshot videos notice:', err.message);
      });
    } catch (err) {
      console.warn('Error setting up Firestore videos listener:', err);
    }

    // 4. Real-Time Firestore Listener for Channels
    let unsubscribeChannels: (() => void) | undefined;
    try {
      unsubscribeChannels = onSnapshot(collection(db, 'channels'), (snapshot) => {
        const firestoreChannels: Channel[] = [];
        snapshot.forEach((docSnap) => {
          const cData = docSnap.data() as Channel;
          if (cData && (cData.id || docSnap.id)) {
            firestoreChannels.push({
              ...cData,
              id: cData.id || docSnap.id
            });
          }
        });

        if (firestoreChannels.length > 0) {
          setChannels(prev => {
            const map = new Map<string, Channel>();
            prev.forEach(c => { if (c && c.id) map.set(c.id, c); });
            firestoreChannels.forEach(c => {
              const existing = map.get(c.id);
              map.set(c.id, preserveLocalSeedChannel(c, existing));
            });
            const merged = Array.from(map.values());
            try { localStorage.setItem('tazama_custom_channels', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      }, (err) => {
        console.warn('Firestore onSnapshot channels notice:', err.message);
      });
    } catch (err) {
      console.warn('Error setting up Firestore channels listener:', err);
    }

    return () => {
      if (unsubscribeVideos) unsubscribeVideos();
      if (unsubscribeChannels) unsubscribeChannels();
    };
  }, []);

  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Zote');

  const [userSubscriptions, setUserSubscriptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_subscriptions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(() => {
    try {
      const savedUser = localStorage.getItem('tazama_session_profile');
      const uid = savedUser ? JSON.parse(savedUser)?.uid : null;
      if (uid) {
        const userSaved = localStorage.getItem(`tazama_liked_videos_${uid}`);
        if (userSaved) return JSON.parse(userSaved);
      }
      const saved = localStorage.getItem('tazama_liked_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Cross-device & page refresh synchronization for authenticated user's likes
  useEffect(() => {
    if (!profile?.uid) {
      setLikedVideoIds([]);
      return;
    }

    const userUid = profile.uid;

    // 1. Hydrate from user-specific cache
    try {
      const cached = localStorage.getItem(`tazama_liked_videos_${userUid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setLikedVideoIds(parsed);
      }
    } catch {}

    // 2. Fetch authoritative likes from Server API (ensuring cross-device recognition)
    fetch(`/api/users/${encodeURIComponent(userUid)}/likes`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.likedVideoIds)) {
          setLikedVideoIds(data.likedVideoIds);
          try {
            localStorage.setItem(`tazama_liked_videos_${userUid}`, JSON.stringify(data.likedVideoIds));
            localStorage.setItem('tazama_liked_videos', JSON.stringify(data.likedVideoIds));
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Real-time Firestore sync across open tabs and multiple devices
    let unsubscribeLikes: (() => void) | undefined;
    try {
      const q = query(collection(db, 'likes'), where('userId', '==', userUid));
      unsubscribeLikes = onSnapshot(q, (snapshot) => {
        const serverLikedIds: string[] = [];
        snapshot.forEach(docSnap => {
          const lData = docSnap.data();
          if (lData && lData.videoId) {
            serverLikedIds.push(lData.videoId);
          }
        });
        if (serverLikedIds.length > 0) {
          setLikedVideoIds(prev => {
            const merged = Array.from(new Set([...prev, ...serverLikedIds]));
            try {
              localStorage.setItem(`tazama_liked_videos_${userUid}`, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }, (err) => {
        console.warn('Firestore likes sync notice:', err.message);
      });
    } catch (err) {
      console.warn('Error setting up likes listener:', err);
    }

    return () => {
      if (unsubscribeLikes) unsubscribeLikes();
    };
  }, [profile?.uid]);

  const [watchHistory, setWatchHistory] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_watch_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((item: any) => Boolean(item && item.id));
      }
    } catch {}
    return [];
  });

  const [comments, setComments] = useState<Record<string, CommentItem[]>>(() => {
    try {
      const saved = localStorage.getItem('tazama_comments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [giftTransactions, setGiftTransactions] = useState<GiftTransaction[]>([]);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_registered_users');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>(INITIAL_PREMIUM_PLANS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);

  // Mini Player State
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<VideoItem | null>(null);
  const [isMiniPlayerPlaying, setIsMiniPlayerPlaying] = useState<boolean>(true);

  // In-App Notifications State
  const [notifications, setNotifications] = useState<TazamaNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addNotification = (notif: Omit<TazamaNotification, 'id' | 'createdAt'>) => {
    const newNotif: TazamaNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const toggleMiniPlayerPlay = () => {
    setIsMiniPlayerPlaying(prev => !prev);
  };

  const closeMiniPlayer = () => {
    setMiniPlayerVideo(null);
  };

  // Offline Downloads State (Persisted locally)
  const [offlineDownloads, setOfflineDownloads] = useState<OfflineDownload[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_offline_downloads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((d: any) => Boolean(d && d.videoId && d.video));
      }
    } catch {}
    return [];
  });

  const downloadVideo = (video: VideoItem) => {
    setOfflineDownloads(prev => {
      if (prev.some(d => d.videoId === video.id)) return prev;
      const next = [
        {
          videoId: video.id,
          video,
          downloadedAt: new Date().toISOString(),
          fileSizeBytes: Math.floor(Math.random() * 35000000) + 18000000
        },
        ...prev
      ];
      try { localStorage.setItem('tazama_offline_downloads', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeDownload = (videoId: string) => {
    setOfflineDownloads(prev => {
      const next = prev.filter(d => d.videoId !== videoId);
      try { localStorage.setItem('tazama_offline_downloads', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isDownloaded = (videoId: string) => {
    return offlineDownloads.some(d => d.videoId === videoId);
  };

  // Data Saver Mode State
  const [isDataSaver, setIsDataSaver] = useState<boolean>(false);

  const toggleDataSaver = () => {
    setIsDataSaver(prev => !prev);
  };

  // Playback Queue State (Persisted locally)
  const [playbackQueue, setPlaybackQueue] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_playback_queue');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((v: any) => Boolean(v && v.id && v.videoUrl));
      }
    } catch {}
    return [];
  });

  const addToQueue = (video: VideoItem) => {
    if (!video || !video.id) return;
    setPlaybackQueue(prev => {
      if (prev.some(v => v.id === video.id)) return prev;
      const next = [...prev, video];
      try { localStorage.setItem('tazama_playback_queue', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeFromQueue = (videoId: string) => {
    setPlaybackQueue(prev => {
      const next = prev.filter(v => v.id !== videoId);
      try { localStorage.setItem('tazama_playback_queue', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clearQueue = () => {
    setPlaybackQueue([]);
    try { localStorage.setItem('tazama_playback_queue', JSON.stringify([])); } catch {}
  };

  const isInQueue = (videoId: string) => {
    return playbackQueue.some(v => v.id === videoId);
  };

  // Feed Preferences: Not Interested & Don't Recommend Channel
  const [notInterestedIds, setNotInterestedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_not_interested_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [hiddenChannelIds, setHiddenChannelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_hidden_channel_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const markNotInterested = (videoId: string) => {
    if (!videoId) return;
    setNotInterestedIds(prev => {
      if (prev.includes(videoId)) return prev;
      const next = [...prev, videoId];
      try { localStorage.setItem('tazama_not_interested_ids', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const undoNotInterested = (videoId: string) => {
    setNotInterestedIds(prev => {
      const next = prev.filter(id => id !== videoId);
      try { localStorage.setItem('tazama_not_interested_ids', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const hideChannelRecommendations = (channelId: string) => {
    if (!channelId) return;
    setHiddenChannelIds(prev => {
      if (prev.includes(channelId)) return prev;
      const next = [...prev, channelId];
      try { localStorage.setItem('tazama_hidden_channel_ids', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const unhideChannelRecommendations = (channelId: string) => {
    setHiddenChannelIds(prev => {
      const next = prev.filter(id => id !== channelId);
      try { localStorage.setItem('tazama_hidden_channel_ids', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Playlists State (Persisted locally, ensures Watch Later works automatically)
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_playlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((p: any) => Boolean(p && p.id && p.title));
      }
    } catch {}
    return INITIAL_PLAYLISTS;
  });

  const createPlaylist = (title: string, description?: string): string => {
    const newId = `pl-${Date.now()}`;
    const newPlaylist: Playlist = {
      id: newId,
      title,
      description,
      coverUrl: '',
      videoIds: [],
      createdAt: new Date().toISOString()
    };
    setPlaylists(prev => {
      const next = [newPlaylist, ...prev];
      try { localStorage.setItem('tazama_playlists', JSON.stringify(next)); } catch {}
      return next;
    });
    return newId;
  };

  const addToPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => {
      const next = prev.map(p => {
        if (p.id === playlistId && !p.videoIds.includes(videoId)) {
          return { ...p, videoIds: [...p.videoIds, videoId] };
        }
        return p;
      });
      try { localStorage.setItem('tazama_playlists', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => {
      const next = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, videoIds: p.videoIds.filter(id => id !== videoId) };
        }
        return p;
      });
      try { localStorage.setItem('tazama_playlists', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleWatchLater = (videoId: string): boolean => {
    if (!videoId) return false;
    const existing = playlists.find(p => p.id === 'pl-watch-later');
    const willAdd = !(existing?.videoIds.includes(videoId));

    setPlaylists(prev => {
      const target = prev.find(p => p.id === 'pl-watch-later');
      let next: Playlist[];
      if (!target) {
        const watchLaterList: Playlist = {
          id: 'pl-watch-later',
          title: 'Tazama Baadaye',
          description: 'Video zilizohifadhiwa kutazama baadaye',
          coverUrl: '',
          videoIds: [videoId],
          createdAt: new Date().toISOString()
        };
        next = [watchLaterList, ...prev];
      } else {
        const hasVideo = target.videoIds.includes(videoId);
        next = prev.map(p =>
          p.id === 'pl-watch-later'
            ? {
                ...p,
                videoIds: hasVideo
                  ? p.videoIds.filter(id => id !== videoId)
                  : [...p.videoIds, videoId]
              }
            : p
        );
      }
      try { localStorage.setItem('tazama_playlists', JSON.stringify(next)); } catch {}
      return next;
    });

    return willAdd;
  };

  const isInWatchLater = (videoId: string): boolean => {
    const watchLater = playlists.find(p => p.id === 'pl-watch-later');
    return Boolean(watchLater && watchLater.videoIds.includes(videoId));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== playlistId);
      try { localStorage.setItem('tazama_playlists', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Live Streams State
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(INITIAL_LIVE_STREAMS);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStream | null>(null);
  const [liveChatMessages, setLiveChatMessages] = useState<Record<string, LiveChatMessage[]>>({
    'live-diamond-dar': [
      {
        id: 'msg-1',
        senderName: 'Bakari Mwita',
        senderAvatar: createAvatarSvgDataUri('Bakari Mwita'),
        message: 'Kituo cha Wasafi hewani kipo moto sana leo! 🔥🔥',
        timestamp: '19:42'
      },
      {
        id: 'msg-2',
        senderName: 'Halima Khamis (Zanzibar)',
        senderAvatar: createAvatarSvgDataUri('Halima Khamis'),
        message: 'Wimbo unaofuata tafadhali Aje na Sukari!',
        timestamp: '19:43'
      },
      {
        id: 'msg-3',
        senderName: 'Kelvin Mushi',
        senderAvatar: createAvatarSvgDataUri('Kelvin Mushi'),
        message: 'Sauti iko safi sana, Tazama mmeweza sana hii!',
        isTip: true,
        tipAmountTZS: 5000,
        timestamp: '19:44'
      }
    ]
  });

  const sendLiveChatMessage = (streamId: string, text: string) => {
    const senderName = profile?.displayName || 'Mtazamaji';
    const newMessage: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      senderName,
      senderAvatar: profile?.photoURL || createAvatarSvgDataUri(senderName),
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
      const senderName = profile?.displayName || 'Shabiki Mkuu';
      const tipMsg: LiveChatMessage = {
        id: `tip-${Date.now()}`,
        senderName,
        senderAvatar: profile?.photoURL || createAvatarSvgDataUri(senderName),
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
    actionTaken?: 'takedown_strike' | 'divert_revenue' | 'revenue_share' | 'warning' | 'dismissed', 
    notes?: string
  ) => {
    const claim = copyrightClaims.find(c => c.id === claimId);
    const amountInEscrow = claim?.disputedRevenueTZS || 185000;
    let newEscrowStatus: CopyrightClaim['escrowStatus'] = claim?.escrowStatus || 'held_in_escrow';

    if (actionTaken === 'divert_revenue' && status === 'approved') {
      // 1. Claim & Divert Revenue: ONLY release from escrow after formal verification
      newEscrowStatus = 'released_to_claimant';
      if (claim?.claimantChannelId) {
        const originalUser = users.find(u => u.channelId === claim.claimantChannelId);
        if (originalUser) {
          updateUserBalance(originalUser.uid, amountInEscrow);
        }
      }
      // Deduct escrow hold from target user without blocking their entire unrelated balance
      const targetUser = users.find(u => u.channelId === claim?.targetChannelName);
      if (targetUser) {
        setUsers(prev => prev.map(u => u.uid === targetUser.uid ? {
          ...u,
          escrowHeldTZS: Math.max(0, (u.escrowHeldTZS || 0) - amountInEscrow)
        } : u));
      }
    } else if (status === 'rejected' || actionTaken === 'dismissed') {
      // Return escrow to uploader if claim was dismissed or false
      newEscrowStatus = 'returned_to_uploader';
    }

    if (actionTaken === 'takedown_strike' && claim?.targetVideoId) {
      deleteVideo(claim.targetVideoId);
      // Increment strikes with due-process review window
      setChannels(prev => prev.map(ch => {
        if (ch?.name && claim?.targetChannelName && ch.name.toLowerCase() === claim.targetChannelName.toLowerCase()) {
          const newStrikes = (ch.copyrightStrikes || 0) + 1;
          const isBlocked = newStrikes >= 3;
          return {
            ...ch,
            copyrightStrikes: newStrikes,
            isBlocked: isBlocked || ch.isBlocked,
            blockReason: isBlocked ? 'Akaunti imesimamishwa kwa kufikisha Copyright Strikes 3. Haki ya kukata rufaa (Appeal) inapatikana.' : ch.blockReason
          };
        }
        return ch;
      }));
    }

    setCopyrightClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { 
          ...c, 
          status, 
          actionTaken, 
          escrowStatus: newEscrowStatus,
          divertedRevenueTZS: actionTaken === 'divert_revenue' && status === 'approved' ? amountInEscrow : c.divertedRevenueTZS,
          isPayoutFrozen: status === 'under_investigation' || status === 'pending',
          freezeScope: 'disputed_video_only',
          freezeReason: status === 'under_investigation' 
            ? `Zuio la muda la TZS ${amountInEscrow.toLocaleString()} kwa video ya "${c.targetVideoTitle}". Fedha zingine ziko huru.` 
            : undefined,
          notes: notes || c.notes 
        };
      }
      return c;
    }));

    addAuditLog(
      `COPYRIGHT_${actionTaken ? actionTaken.toUpperCase() : status.toUpperCase()}`,
      `Dai: ${claim?.infringedWorkTitle || claimId}`,
      actionTaken === 'divert_revenue' && status === 'approved'
        ? `Uchunguzi umekamilika: Mapato ya Escrow (TZS ${amountInEscrow.toLocaleString()}) yametolewa kwa mmiliki halisi (${claim?.claimantName}).` 
        : actionTaken === 'takedown_strike'
        ? `Video "${claim?.targetVideoTitle}" imefutwa. Notisi ya Strike imetolewa ikiwa na dirisha la siku 14 la rufaa.`
        : `Hatua ya hakimiliki: ${actionTaken || status}. Maelezo: ${notes || 'Hakuna'}`,
      status === 'approved' ? 'SUCCESS' : 'WARNING'
    );
  };

  const submitCounterNotice = (claimId: string, counterText: string) => {
    setCopyrightClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'disputed',
          counterNoticeSubmitted: true,
          counterNoticeText: counterText,
          notes: `Counter-Notice imewasilishwa: "${counterText}". Inasubiri ukaguzi wa jopo la kisheria.`
        };
      }
      return c;
    }));

    addAuditLog(
      'COPYRIGHT_COUNTER_NOTICE',
      `Claim ID: ${claimId}`,
      `Uploader amewasilisha rufaa rasmi (Counter-Notice) ya kisheria. Zuio la video linabaki kwenye Escrow hadi uamuzi ufanyike.`,
      'SUCCESS'
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

  // Ad Campaigns State (Loaded from localStorage + synchronized with Server /api/ads)
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_custom_ads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_AD_CAMPAIGNS;
  });

  const addAdCampaign = (campaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'spendTZS' | 'createdAt'>): string => {
    const newId = `ad-${Date.now()}`;
    // STRICT TAZAMA ADS RULE: Kila tangazo jipya lazima lianze na hali ya 'pending_approval'
    // Mpaka Admin a-confirm (Approve) ndipo litakapobadilika kuwa 'active' na kuanza kuonekana!
    const newCamp: AdCampaign = {
      ...campaign,
      id: newId,
      status: 'pending_approval',
      impressions: 0,
      clicks: 0,
      spendTZS: 0,
      createdAt: new Date().toISOString(),
      title: campaign.campaignName,
      advertiserName: campaign.creatorName
    };
    setAdCampaigns(prev => {
      const next = [newCamp, ...prev.filter(a => a.id !== newId)];
      try { localStorage.setItem('tazama_custom_ads', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCamp)
    }).catch(err => console.warn('Could not post ad to server:', err));

    addAuditLog(
      'AD_CAMPAIGN_CREATED', 
      `Kampeni: ${campaign.campaignName}`, 
      `Mtangazaji: ${campaign.creatorName} (${campaign.creatorRole}). Muundo: ${campaign.adFormat}. Bajeti: TZS ${campaign.budgetTZS.toLocaleString()}. Hali: Inasubiri Idhini ya Admin kabla ya kuonyeshwa.`, 
      'SUCCESS'
    );
    return newId;
  };

  const updateAdCampaignStatus = (campaignId: string, status: AdCampaign['status']) => {
    setAdCampaigns(prev => {
      const next = prev.map(c => c.id === campaignId ? { ...c, status } : c);
      try { localStorage.setItem('tazama_custom_ads', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/ads/${encodeURIComponent(campaignId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
    addAuditLog('AD_CAMPAIGN_STATUS', `Campaign ID: ${campaignId}`, `Hali mpya: ${status}`, 'SUCCESS');
  };

  const approveAdCampaign = (campaignId: string, adminEmail: string = 'amytzee@gmail.com') => {
    const target = adCampaigns.find(c => c.id === campaignId);
    setAdCampaigns(prev => {
      const next = prev.map(c => c.id === campaignId ? {
        ...c,
        status: 'active' as AdStatus,
        reviewedBy: adminEmail,
        reviewedAt: new Date().toISOString()
      } : c);
      try { localStorage.setItem('tazama_custom_ads', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/ads/${encodeURIComponent(campaignId)}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail })
    }).catch(err => console.warn('Could not approve ad on server:', err));

    addAuditLog(
      'AD_CAMPAIGN_APPROVED',
      `Campaign: ${target?.campaignName || campaignId}`,
      `Tangazo limeidhinishwa na Msimamizi (${adminEmail}). Sasa lipo hewani kwa watazamaji wote.`,
      'SUCCESS'
    );
  };

  const rejectAdCampaign = (campaignId: string, reason: string, adminEmail: string = 'amytzee@gmail.com') => {
    const target = adCampaigns.find(c => c.id === campaignId);
    setAdCampaigns(prev => {
      const next = prev.map(c => c.id === campaignId ? {
        ...c,
        status: 'rejected' as AdStatus,
        rejectionReason: reason,
        reviewedBy: adminEmail,
        reviewedAt: new Date().toISOString()
      } : c);
      try { localStorage.setItem('tazama_custom_ads', JSON.stringify(next)); } catch {}
      return next;
    });
    fetch(`/api/ads/${encodeURIComponent(campaignId)}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, adminEmail })
    }).catch(err => console.warn('Could not reject ad on server:', err));

    addAuditLog(
      'AD_CAMPAIGN_REJECTED',
      `Campaign: ${target?.campaignName || campaignId}`,
      `Tangazo limekataliwa na Admin (${adminEmail}). Sababu: ${reason}`,
      'WARNING'
    );
  };

  const recordAdImpression = (campaignId: string) => {
    setAdCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        // Increment impression and calculate micro-spend
        const newImpressions = c.impressions + 1;
        const microSpend = Math.min(c.budgetTZS, c.spendTZS + Math.round((c.budgetTZS / Math.max(1, (c.impressions + 500)))));
        return {
          ...c,
          impressions: newImpressions,
          spendTZS: microSpend
        };
      }
      return c;
    }));
  };

  const recordAdClick = (campaignId: string) => {
    setAdCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          clicks: c.clicks + 1
        };
      }
      return c;
    }));
  };

  const getActiveAds = (format?: AdFormat | AdFormat[]): AdCampaign[] => {
    const activeOnly = adCampaigns.filter(c => c.status === 'active');
    if (!format) return activeOnly;
    if (Array.isArray(format)) {
      return activeOnly.filter(c => format.includes(c.adFormat));
    }
    return activeOnly.filter(c => c.adFormat === format);
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

  // Authoritative server-verified views synchronizer
  const syncServerViews = (videoId: string, serverViewsCount: number, uniqueViewers?: number, watchTimeSeconds?: number) => {
    if (!videoId) return;

    setVideos(prev => {
      const next = prev.map(v => {
        if (v && v.id === videoId) {
          return {
            ...v,
            viewsCount: serverViewsCount,
            uniqueViewers: typeof uniqueViewers === 'number' ? uniqueViewers : v.uniqueViewers,
            watchTimeSeconds: typeof watchTimeSeconds === 'number' ? watchTimeSeconds : v.watchTimeSeconds
          };
        }
        return v;
      });
      try { localStorage.setItem('tazama_custom_videos', JSON.stringify(next)); } catch {}
      return next;
    });

    setShorts(prev => {
      const next = prev.map(s => {
        if (s && s.id === videoId) {
          return {
            ...s,
            viewsCount: serverViewsCount,
            uniqueViewers: typeof uniqueViewers === 'number' ? uniqueViewers : s.uniqueViewers,
            watchTimeSeconds: typeof watchTimeSeconds === 'number' ? watchTimeSeconds : s.watchTimeSeconds
          };
        }
        return s;
      });
      try { localStorage.setItem('tazama_custom_shorts', JSON.stringify(next)); } catch {}
      return next;
    });

    setCurrentVideo(prev => {
      if (prev && prev.id === videoId) {
        return {
          ...prev,
          viewsCount: serverViewsCount,
          uniqueViewers: typeof uniqueViewers === 'number' ? uniqueViewers : prev.uniqueViewers,
          watchTimeSeconds: typeof watchTimeSeconds === 'number' ? watchTimeSeconds : prev.watchTimeSeconds
        };
      }
      return prev;
    });

    // Sync authoritative view count to Firestore
    try {
      const videoDocRef = doc(db, 'videos', videoId);
      setDoc(videoDocRef, { viewsCount: serverViewsCount }, { merge: true }).catch(() => {});
    } catch {}
  };

  const recordView = (videoId: string) => {
    if (!videoId) return;

    const target = (videos && videos.find(v => Boolean(v && v.id === videoId))) || 
                   (shorts && shorts.find(s => Boolean(s && s.id === videoId))) ||
                   (currentVideo && currentVideo.id === videoId ? currentVideo : null);

    // 1. Add to local watch history
    if (target) {
      setWatchHistory(prev => [
        target,
        ...(Array.isArray(prev) ? prev.filter(item => Boolean(item && item.id && item.id !== videoId)) : [])
      ].slice(0, 50));
    }

    // 2. Read persistent device id
    let deviceId = '';
    try {
      deviceId = localStorage.getItem('tazama_device_id') || '';
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('tazama_device_id', deviceId);
      }
    } catch {}

    // 3. Post to Server API for final server-side authority validation
    // Notice: Server has final authority. The client does NOT unilaterally bump view count!
    fetch(`/api/videos/${encodeURIComponent(videoId)}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viewerUid: profile?.uid || null,
        viewerChannelId: profile?.channelId || null,
        viewerName: profile?.displayName || null,
        deviceId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.success && typeof data.viewsCount === 'number') {
        syncServerViews(videoId, data.viewsCount, data.uniqueViewers, data.watchTimeSeconds);
      }
    })
    .catch(err => {
      console.warn('View recording request error:', err);
    });
  };

  const toggleSubscribe = (channelId: string) => {
    setUserSubscriptions(prev => {
      const isSubbed = prev.includes(channelId);
      const updated = isSubbed ? prev.filter(id => id !== channelId) : [...prev, channelId];
      try { localStorage.setItem('tazama_subscriptions', JSON.stringify(updated)); } catch {}
      
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
    if (!videoId) return;

    // 1. MUST BE AUTHENTICATED: Guest users without account are NOT allowed to like
    if (!profile || !profile.uid) {
      window.dispatchEvent(new CustomEvent('tazama_show_auth_modal', {
        detail: { action: 'kupiga kura ya Like (Kupenda video)' }
      }));
      return;
    }

    const userUid = profile.uid;
    const isCurrentlyLiked = likedVideoIds.includes(videoId);
    const willBeLiked = !isCurrentlyLiked;

    // 2. Optimistic UI update
    setLikedVideoIds(prev => {
      const next = willBeLiked ? [...prev.filter(id => id !== videoId), videoId] : prev.filter(id => id !== videoId);
      try {
        localStorage.setItem(`tazama_liked_videos_${userUid}`, JSON.stringify(next));
        localStorage.setItem('tazama_liked_videos', JSON.stringify(next));
      } catch {}
      return next;
    });

    setVideos(vids => vids.map(v => {
      if (v.id === videoId) {
        return {
          ...v,
          likesCount: willBeLiked ? (v.likesCount || 0) + 1 : Math.max(0, (v.likesCount || 1) - 1)
        };
      }
      return v;
    }));

    setShorts(shList => shList.map(s => {
      if (s.id === videoId) {
        return {
          ...s,
          likesCount: willBeLiked ? (s.likesCount || 0) + 1 : Math.max(0, (s.likesCount || 1) - 1)
        };
      }
      return s;
    }));

    setCurrentVideo(prev => {
      if (prev && prev.id === videoId) {
        return {
          ...prev,
          likesCount: willBeLiked ? (prev.likesCount || 0) + 1 : Math.max(0, (prev.likesCount || 1) - 1)
        };
      }
      return prev;
    });

    // 3. Post to Server API for authoritative concurrency-locked update
    fetch(`/api/videos/${encodeURIComponent(videoId)}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userUid })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.success && typeof data.likesCount === 'number') {
        const confirmedLiked = Boolean(data.isLiked);
        // Sync confirmed authoritative likes count
        setVideos(vids => vids.map(v => v.id === videoId ? { ...v, likesCount: data.likesCount } : v));
        setShorts(shList => shList.map(s => s.id === videoId ? { ...s, likesCount: data.likesCount } : s));
        setCurrentVideo(prev => prev && prev.id === videoId ? { ...prev, likesCount: data.likesCount } : prev);
        
        // Ensure user's liked state matches server
        setLikedVideoIds(prev => {
          const next = confirmedLiked ? [...prev.filter(id => id !== videoId), videoId] : prev.filter(id => id !== videoId);
          try {
            localStorage.setItem(`tazama_liked_videos_${userUid}`, JSON.stringify(next));
          } catch {}
          return next;
        });

        // 4. Sync to Firestore for real-time consistency
        try {
          const likeDocRef = doc(db, 'likes', `${videoId}_${userUid}`);
          if (confirmedLiked) {
            setDoc(likeDocRef, {
              id: `${videoId}_${userUid}`,
              videoId,
              userId: userUid,
              isLike: true,
              createdAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          } else {
            deleteDoc(likeDocRef).catch(() => {});
          }

          const videoDocRef = doc(db, 'videos', videoId);
          setDoc(videoDocRef, { likesCount: data.likesCount }, { merge: true }).catch(() => {});
        } catch {}
      }
    })
    .catch(err => {
      console.warn('Error syncing like to server:', err);
    });
  };

  const addComment = (videoId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: CommentItem = {
      id: 'comment-' + Date.now(),
      videoId,
      userId: profile?.uid || 'guest-user',
      userName: profile?.displayName || 'Mwanachama wa Tazama',
      userAvatar: profile?.photoURL || createAvatarSvgDataUri(profile?.displayName || 'Mwanachama'),
      text: text.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString()
    };

    setComments(prev => {
      const next = {
        ...prev,
        [videoId]: [newComment, ...(prev[videoId] || [])]
      };
      try { localStorage.setItem('tazama_comments', JSON.stringify(next)); } catch {}
      return next;
    });

    setVideos(vids => vids.map(v => v.id === videoId ? { ...v, commentsCount: v.commentsCount + 1 } : v));
    setShorts(shList => shList.map(s => s.id === videoId ? { ...s, commentsCount: s.commentsCount + 1 } : s));
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
    const creatorUid = profile?.uid || 'user-current';
    const creatorName = profile?.displayName || 'Kituo Changu cha Tazama';
    const creatorAvatar = profile?.photoURL || createAvatarSvgDataUri(creatorName);
    const channelId = profile?.channelId || `ch-${creatorUid}`;

    const newVid: VideoItem = {
      id: 'vid-tz-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      channelId,
      channelName: creatorName,
      channelAvatar: creatorAvatar,
      channelOwnerId: creatorUid,
      isChannelVerified: true,
      title: videoData.title || 'Video Isiyo na Jina',
      description: videoData.description || '',
      videoUrl: videoData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      streamPlaybackId: videoData.streamPlaybackId || ('stream-' + Math.random().toString(36).substring(2, 9)),
      thumbnailUrl: videoData.thumbnailUrl || createThumbnailSvgDataUri(videoData.title || 'Tazama Video', videoData.category || 'Burudani'),
      durationSeconds: videoData.durationSeconds || 180,
      category: (videoData.category as VideoCategory) || 'Burudani',
      tags: videoData.tags || ['Tazama', 'Tanzania'],
      visibility: videoData.visibility || 'public',
      isShort: Boolean(videoData.isShort),
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      processingStatus: 'ready',
      createdAt: new Date().toISOString()
    };

    // 1. Update React state and local storage immediately
    if (newVid.isShort) {
      setShorts(prev => {
        const next = [newVid, ...prev.filter(s => s && s.id !== newVid.id)];
        try { localStorage.setItem('tazama_custom_shorts', JSON.stringify(next)); } catch {}
        return next;
      });
    } else {
      setVideos(prev => {
        const next = [newVid, ...prev.filter(v => v && v.id !== newVid.id)];
        try { localStorage.setItem('tazama_custom_videos', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    // 2. Ensure creator channel exists in state and server
    setChannels(prev => {
      const exists = prev.some(c => c && c.id === channelId);
      if (!exists) {
        const newChannel: Channel = {
          id: channelId,
          ownerId: creatorUid,
          handle: '@' + (creatorName || 'muundaji').toLowerCase().replace(/[^a-z0-9]/g, ''),
          name: creatorName,
          bio: 'Kituo rasmi cha video na ubunifu kwenye Tazama.',
          avatarUrl: creatorAvatar,
          bannerUrl: createThumbnailSvgDataUri(creatorName, 'Burudani'),
          subscriberCount: 1,
          videoCount: 1,
          isVerified: true,
          isMonetized: false,
          totalViews: 0,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        const next = [newChannel, ...prev];
        try { localStorage.setItem('tazama_custom_channels', JSON.stringify(next)); } catch {}
        fetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newChannel)
        }).catch(() => {});
        return next;
      }
      return prev;
    });

    // 3. PERSIST TO SERVER (/api/videos) SO ALL USERS ON ANY DEVICE CAN SEE IT
    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVid)
      });
    } catch (err) {
      console.warn('Could not post video to server /api/videos:', err);
    }

    // 4. PERSIST TO FIRESTORE
    try {
      const videoDocRef = doc(db, 'videos', newVid.id);
      await setDoc(videoDocRef, newVid);
    } catch (err) {
      console.warn('Firestore video sync notification:', err);
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
    const target = videos.find(v => Boolean(v && v.id === videoId)) || shorts.find(s => Boolean(s && s.id === videoId));
    setVideos(prev => {
      const next = prev.filter(v => Boolean(v && v.id !== videoId));
      try { localStorage.setItem('tazama_custom_videos', JSON.stringify(next)); } catch {}
      return next;
    });
    setShorts(prev => {
      const next = prev.filter(s => Boolean(s && s.id !== videoId));
      try { localStorage.setItem('tazama_custom_shorts', JSON.stringify(next)); } catch {}
      return next;
    });
    setReports(prev => prev.filter(r => Boolean(r && r.targetId !== videoId)));
    fetch('/api/videos/' + videoId, { method: 'DELETE' }).catch(() => {});
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
        syncServerViews,
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
        // Playback Queue
        playbackQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        isInQueue,
        // Feed Preferences
        notInterestedIds,
        hiddenChannelIds,
        markNotInterested,
        undoNotInterested,
        hideChannelRecommendations,
        unhideChannelRecommendations,
        // Playlists
        playlists,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        toggleWatchLater,
        isInWatchLater,
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
        submitCounterNotice,
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
        approveAdCampaign,
        rejectAdCampaign,
        recordAdImpression,
        recordAdClick,
        getActiveAds,
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
        updateChannelInfo,
        // Notifications
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification
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
