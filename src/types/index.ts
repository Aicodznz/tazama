export type Language = 'sw' | 'en';
export type Theme = 'dark' | 'light';

export type UserRole = 'viewer' | 'creator' | 'moderator' | 'admin' | 'finance' | 'copyright' | 'support' | 'analyst';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  country: string;
  preferredLanguage: Language;
  channelId?: string;
  balanceTZS: number;
  isBlocked?: boolean;
  blockReason?: string;
  premiumPlanId?: string;
  creatorPlanId?: string;
  premiumExpiry?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Channel {
  id: string;
  ownerId: string;
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  videoCount: number;
  isVerified: boolean;
  isMonetized: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  copyrightStrikes?: number;
  totalViews: number;
  monthlyEarningsTZS?: number;
  joinedDate: string;
}

export type VideoCategory = 
  | 'Muziki' 
  | 'Vichekesho' 
  | 'Habari' 
  | 'Elimu' 
  | 'Michezo' 
  | 'Teknolojia' 
  | 'Mtindo wa Maisha' 
  | 'Burudani' 
  | 'Filamu';

export interface VideoItem {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  channelOwnerId?: string;
  isChannelVerified?: boolean;
  title: string;
  description: string;
  videoUrl: string;
  streamPlaybackId?: string;
  thumbnailUrl: string;
  durationSeconds: number;
  category: VideoCategory;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  isShort?: boolean;
  viewsCount: number;
  likesCount: number;
  dislikesCount?: number;
  commentsCount: number;
  processingStatus: 'ready' | 'processing' | 'error';
  createdAt: string;
  isMembersOnly?: boolean;
}

export interface CommentItem {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likesCount: number;
  isLikedByUser?: boolean;
  createdAt: string;
  replies?: CommentItem[];
}

export interface VirtualGift {
  id: string;
  name: { sw: string; en: string };
  icon: string;
  priceTZS: number;
  animationClass?: string;
  description: { sw: string; en: string };
}

export interface GiftTransaction {
  id: string;
  senderId: string;
  senderName: string;
  channelId: string;
  videoId?: string;
  giftId: string;
  giftName: string;
  icon: string;
  amountTZS: number;
  message?: string;
  createdAt: string;
}

export interface MembershipTier {
  id: string;
  channelId: string;
  name: string;
  priceTZS: number;
  perks: string[];
  badgeColor: string;
}

export interface UserMembership {
  id: string;
  userId: string;
  channelId: string;
  tierId: string;
  tierName: string;
  monthlyFeeTZS: number;
  status: 'active' | 'cancelled' | 'expired';
  renewsAt: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  creatorId: string;
  channelName: string;
  amountTZS: number;
  provider: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa' | 'NMB Bank' | 'CRDB Bank';
  accountNumber: string;
  accountHolderName: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  targetType: 'video' | 'comment' | 'channel';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  advertiserName: string;
  adType: 'pre-roll' | 'banner' | 'sponsored-card';
  targetCategory: string;
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  budgetTZS: number;
  spendTZS: number;
}

export type PlanTarget = 'viewer' | 'creator';

export interface PremiumPlan {
  id: string;
  name: string;
  description: string;
  target: PlanTarget;
  priceTZS: number;
  billingPeriod: 'month' | 'year';
  perks: string[];
  badgeColor: string;
  badgeLabel: string;
  isActive: boolean;
  popular?: boolean;
  subscribersCount: number;
}

export interface PlatformSettings {
  platformCommissionPercent: number; // e.g. 30
  creatorRevenuePercent: number; // e.g. 70
  minPayoutTZS: number; // e.g. 10000
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  autoApprovePayoutsUnderTZS: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  adminEmail: string;
  target: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'REJECTED';
  timestamp: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  videoIds: string[];
  createdAt: string;
}

export interface OfflineDownload {
  videoId: string;
  video: VideoItem;
  downloadedAt: string;
  fileSizeBytes: number;
}

export interface LiveChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  isTip?: boolean;
  tipAmountTZS?: number;
  timestamp: string;
}

export interface LiveStream {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  category: VideoCategory;
  viewerCount: number;
  streamUrl: string;
  thumbnailUrl: string;
  startedAt: string;
  description: string;
}

export interface STKPushRequest {
  provider: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa';
  phoneNumber: string;
  amountTZS: number;
  reference: string;
}

export interface CopyrightClaim {
  id: string;
  claimantName: string;
  claimantOrg: string;
  claimantChannelId?: string;
  infringedWorkTitle: string;
  targetVideoId: string;
  targetVideoTitle: string;
  targetChannelName: string;
  matchPercentage: number;
  status: 'pending' | 'approved' | 'rejected' | 'disputed';
  actionTaken?: 'takedown_strike' | 'divert_revenue' | 'revenue_share' | 'warning' | 'dismissed';
  divertedRevenueTZS?: number;
  isPayoutFrozen?: boolean;
  evidenceUrl?: string;
  createdAt: string;
  notes?: string;
}

export interface CreatorVerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  channelId: string;
  channelName: string;
  subscriberCount: number;
  documentType: 'NIDA' | 'Passport' | 'Leseni ya Udereva' | 'BRELA';
  documentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface CreatorMonetizationApplication {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  channelId: string;
  channelName: string;
  subscriberCount: number;
  watchHours: number;
  totalViews: number;
  strikesCount: number;
  paymentDetailsConfigured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
}

export interface UserAppeal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  penalizedAction: string;
  reason: string;
  explanation: string;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  decisionNotes?: string;
}

export interface SecurityLogEvent {
  id: string;
  userId: string;
  userEmail: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PASSWORD_RESET' | 'SUSPICIOUS_SPIKE' | 'ROLE_CHANGED' | 'SESSION_TERMINATED';
  ipAddress: string;
  location: string;
  device: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CommunityPost {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  content: string;
  imageUrl?: string;
  pollOptions?: { option: string; votes: number }[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked?: boolean;
}

export interface CreatorMembershipTier {
  id: string;
  channelId: string;
  name: string;
  priceTZS: number;
  perks: string[];
  memberCount: number;
  badgeColor: string;
}

export interface VideoSubtitleTrack {
  id: string;
  videoId: string;
  videoTitle: string;
  language: 'sw' | 'en';
  languageLabel: string;
  status: 'published' | 'draft' | 'auto_generated';
  format: 'vtt' | 'srt';
  updatedAt: string;
}

export interface CreatorPromotion {
  id: string;
  videoId: string;
  videoTitle: string;
  goal: 'views' | 'subscribers' | 'engagement';
  targetAudience: string;
  budgetTZS: number;
  spentTZS: number;
  impressions: number;
  clicks: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
}

