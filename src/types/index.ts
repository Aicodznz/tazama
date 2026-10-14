export type Language = 'sw' | 'en';
export type Theme = 'dark' | 'light';

export type UserRole = 'viewer' | 'creator' | 'moderator' | 'admin';

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

