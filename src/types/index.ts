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
  escrowHeldTZS?: number;
  isBlocked?: boolean;
  blockReason?: string;
  premiumPlanId?: string;
  creatorPlanId?: string;
  premiumExpiry?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CreatorIdentityStatus = 'Haijathibitishwa' | 'Inasubiri ukaguzi' | 'Imethibitishwa' | 'Inahitaji hatua zaidi';

export interface ChannelPolicyAgreement {
  version: string;
  acceptedAt: string;
  accountId: string;
  termsAccepted: boolean;
  contentPolicyAccepted: boolean;
  rightsConfirmed: boolean;
  monetizationAcknowledged: boolean;
}

export interface ChannelRightsInfo {
  ownershipType: string;
  rightsHolderName?: string;
  rightsType?: string;
  productionDate?: string;
  cosotaNumber?: string;
  licenseTerritory?: string;
  revenueTerms?: string;
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
  categories?: string[];
  primaryLanguage?: string;
  country?: string;
  identityStatus?: CreatorIdentityStatus;
  publicEmail?: string;
  showPublicEmail?: boolean;
  publicPhone?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  rightsInfo?: ChannelRightsInfo;
  policyAgreement?: ChannelPolicyAgreement;
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

export type AdFormat = 
  | 'skippable_instream'       // Skippable in-stream (video na kitufe cha kuruka)
  | 'non_skippable_instream'   // Non-skippable in-stream (video ya lazima kutazama)
  | 'bumper'                   // Bumper (video fupi sekunde 6)
  | 'shorts'                   // YouTube Shorts (tangazo la video ya wima kwenye shorts)
  | 'masthead'                 // YouTube Masthead Video Ad (tangazo kubwa la video ukurasa mkuu)
  | 'image_ad'                 // Image Ad (tangazo la picha)
  | 'in_feed'                  // In-feed / In-feed Ad (tangazo kwenye orodha ya video)
  | 'preroll'                  // Pre-roll Ad (kabla ya video kuanza)
  | 'midroll'                  // Mid-roll Ad (katikati ya video)
  | 'sponsored_placement';     // Sponsored Placement (nafasi maalumu ya matangazo)

export type AdCTA = 'Tembelea Tovuti' | 'Nunua Sasa' | 'Wasiliana Nasi';

export type AdStatus = 
  | 'pending_payment'   // Inasubiri malipo
  | 'pending_approval'  // Inasubiri idhini ya admin
  | 'active'            // Imeidhinishwa na inaonyeshwa
  | 'paused'            // Imesimamishwa kwa muda
  | 'rejected'          // Imekataliwa na admin
  | 'completed';        // Muda wa kampeni umekwisha

export interface AdCampaign {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorRole: 'viewer' | 'creator' | 'admin';
  campaignName: string;         // Jina la kampeni (Mfano: Tangazo la Simu Mpya)
  adFormat: AdFormat;           // Aina ya tangazo
  mediaType: 'video' | 'image'; // Video au picha
  mediaUrl: string;             // Faili ya tangazo (Video au Picha URL)
  headline: string;             // Kichwa cha tangazo (Mfano: Nunua Simu Yako Leo)
  description: string;          // Maelezo (Ujumbe mfupi wa tangazo)
  ctaText: AdCTA;               // Kitufe cha hatua
  destinationUrl: string;       // Kiungo (Tovuti au ukurasa wa bidhaa)
  startDate: string;            // Tarehe ya kuanza
  endDate: string;              // Tarehe ya kuisha
  
  // Malipo & Bajeti
  budgetTZS: number;            // Jumla ya fedha zilizolipwa
  dailyBudgetTZS?: number;
  spendTZS: number;             // Kiasi kilichotumika
  paymentProvider?: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa' | 'Salio la Tazama';
  paymentReference?: string;
  paidAt?: string;

  // Idhini ya Admin
  status: AdStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  // Metriki za Matangazo
  impressions: number;
  clicks: number;
  createdAt: string;

  // Legacy compatibility fields
  title?: string;
  advertiserName?: string;
  adType?: string;
  targetCategory?: string;
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
  status: 'pending' | 'under_investigation' | 'approved' | 'rejected' | 'disputed';
  actionTaken?: 'takedown_strike' | 'divert_revenue' | 'revenue_share' | 'warning' | 'dismissed';
  
  // 1. Claim & Divert Revenue with Escrow
  escrowStatus?: 'held_in_escrow' | 'released_to_claimant' | 'returned_to_uploader' | 'none';
  disputedRevenueTZS?: number;
  divertedRevenueTZS?: number;

  // 2. Proportional Payout Freeze
  isPayoutFrozen?: boolean;
  freezeScope?: 'disputed_video_only' | 'full_account';
  freezeReason?: string;
  freezeExpiresAt?: string;

  // 3. Due Process & Strike Appeals
  strikeStage?: 'none' | 'proposed' | 'appeal_window' | 'confirmed' | 'revoked';
  appealDeadline?: string;
  counterNoticeSubmitted?: boolean;
  counterNoticeText?: string;

  // 4. COSOTA Supporting Evidence
  cosotaCertNumber?: string;
  cosotaEvidenceStatus?: 'unverified_lead' | 'supporting_evidence' | 'verified_with_authority' | 'rejected';

  evidenceUrl?: string;
  createdAt: string;
  notes?: string;
  investigationNotes?: string;
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

