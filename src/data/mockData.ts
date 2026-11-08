import { 
  VideoItem, 
  Channel, 
  VirtualGift, 
  MembershipTier, 
  AdCampaign, 
  UserProfile, 
  PremiumPlan, 
  PlatformSettings, 
  AuditLogEntry,
  Playlist,
  LiveStream,
  OfflineDownload,
  CopyrightClaim,
  CreatorVerificationRequest,
  CreatorMonetizationApplication,
  PromoCode,
  UserAppeal,
  SecurityLogEvent,
  CommunityPost,
  CreatorMembershipTier,
  VideoSubtitleTrack,
  CreatorPromotion,
  TazamaNotification
} from '../types';

// PRODUCTION MODE: All demo channels, videos, shorts, users, and ad campaigns start empty.
// Real content is created dynamically by registered users and persisted to database/storage.
export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'ch-lucifer-donghua-tz',
    name: 'Lucifer Donghua TZ',
    ownerId: 'user-admin-amytzee',
    handle: '@luciferdonghua',
    bio: 'Nyumba rasmi ya Donghua (Chinese Anime), First Dragon, Mortal\'s Journey na vipindi bora vya kusisimua kwa lugha ya Kiswahili na Kiingereza.',
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 24800,
    videoCount: 2,
    isVerified: true,
    isMonetized: true,
    totalViews: 52650,
    joinedDate: '2026-11-05'
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-donghua-first-dragon-ep1',
    channelId: 'ch-lucifer-donghua-tz',
    channelName: 'Lucifer Donghua TZ',
    channelAvatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-admin-amytzee',
    isChannelVerified: true,
    title: 'First Dragon (Yuan Long) - Episode 1 [Donghua Multi-Dub]',
    description: 'Msururu maarufu wa uhuishaji wa Kichina (Donghua) Yuan Long (First Dragon). Hadithi ya askari hodari Wang Sheng aliyejikuta akizama katika ulimwengu wa roho ya Yuan na kupambana ili kuwa joka kuu. Tazama moja kwa moja kupitia mfumo wa streaming wa Tazama!',
    videoUrl: 'https://www.youtube.com/watch?v=Dv0mX1heJVc',
    thumbnailUrl: 'https://img.youtube.com/vi/Dv0mX1heJVc/hqdefault.jpg',
    durationSeconds: 1260,
    category: 'Burudani',
    tags: [
      'Donghua',
      'First Dragon',
      'Yuan Long',
      'LuciferDonghua',
      'Action',
      'Anime'
    ],
    visibility: 'public',
    isShort: false,
    viewsCount: 18450,
    likesCount: 1240,
    commentsCount: 156,
    processingStatus: 'ready',
    createdAt: '2026-11-05T12:00:00.000Z',
    uniqueViewers: 12400,
    watchTimeSeconds: 380000
  },
  {
    id: 'vid-donghua-mortals-journey-ep1',
    channelId: 'ch-lucifer-donghua-tz',
    channelName: 'Lucifer Donghua TZ',
    channelAvatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-admin-amytzee',
    isChannelVerified: true,
    title: 'A Record of Mortal\'s Journey to Immortality - Episode 1 [VIP]',
    description: 'Kazi bora ya hadhi ya juu ya Donghua ya Han Li, mvulana wa kawaida kutoka kijijini anayeanza safari ndefu ya mafunzo ya kiroho kuelekea kutokufa (Cultivation / Immortality). Video hii ni sehemu ya maudhui maalum ya Tazama Premium VIP yenye kingo za kung\'aa za dhahabu.',
    videoUrl: 'https://www.youtube.com/watch?v=lG3YdTdfOCM',
    thumbnailUrl: 'https://img.youtube.com/vi/lG3YdTdfOCM/hqdefault.jpg',
    durationSeconds: 1380,
    category: 'Burudani',
    tags: [
      'Donghua',
      'Mortals Journey',
      'Cultivation',
      'VIP',
      'LuciferDonghua',
      'Premium'
    ],
    visibility: 'public',
    isShort: false,
    isMembersOnly: true,
    viewsCount: 34200,
    likesCount: 2980,
    commentsCount: 342,
    processingStatus: 'ready',
    createdAt: '2026-11-06T14:30:00.000Z',
    uniqueViewers: 28100,
    watchTimeSeconds: 890000
  }
];

export const INITIAL_SHORTS: VideoItem[] = [];

// Platform Gift Catalog (Official Tanzanian TZS Gift Definitions)
export const VIRTUAL_GIFTS: VirtualGift[] = [
  {
    id: 'gift-simba',
    name: { sw: 'Simba wa Serengeti', en: 'Serengeti Lion' },
    icon: '🦁',
    priceTZS: 5000,
    description: { sw: 'Simba hodari, heshima na ujasiri kwa mtayarishaji!', en: 'Mighty lion of honor and bravery for creator!' }
  },
  {
    id: 'gift-kahawa',
    name: { sw: 'Kahawa ya Kilimanjaro', en: 'Kilimanjaro Coffee' },
    icon: '☕',
    priceTZS: 2500,
    description: { sw: 'Mpe mtayarishaji kikombe cha kahawa moto aendelee kuunda.', en: 'Treat the creator to fresh Arabica coffee.' }
  },
  {
    id: 'gift-tanzanite',
    name: { sw: 'Madini ya Tanzanite', en: 'Tanzanite Gemstone' },
    icon: '💎',
    priceTZS: 25000,
    description: { sw: 'Kito adimu na cha thamani kubwa cha Tanzania pekee.', en: 'Rare and precious gemstone found only in Tanzania.' }
  },
  {
    id: 'gift-mwenge',
    name: { sw: 'Mwenge wa Uhuru', en: 'Freedom Torch' },
    icon: '🔥',
    priceTZS: 10000,
    description: { sw: 'Washa moto wa maendeleo na motisha kwa kituo hiki!', en: 'Light the flame of creativity and community support!' }
  },
  {
    id: 'gift-mbuyu',
    name: { sw: 'Mbuyu wa Asili', en: 'Ancient Baobab' },
    icon: '🌳',
    priceTZS: 15000,
    description: { sw: 'Uimara, mizizi imara, na maisha marefu ya kazi nzuri.', en: 'Strength, deep roots and lasting excellence.' }
  },
  {
    id: 'gift-dhow',
    name: { sw: 'Jahazi la Zanzibar', en: 'Zanzibar Dhow' },
    icon: '⛵',
    priceTZS: 50000,
    description: { sw: 'Zawadi ya hadhi ya juu ya kifalme kwa kazi ya kipekee!', en: 'Premium royal gift for legendary African content!' }
  }
];

// Channel Membership Tier Templates
export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'tier-shaba',
    channelId: '',
    name: 'Shaba (Bronze Tier)',
    priceTZS: 5000,
    badgeColor: '#CD7F32',
    perks: [
      'Beji maalum ya mfuasi waaminifu pembeni ya jina lako kwenye maoni',
      'Emoji rasmi za kituo unazoweza kutumia kwenye maoni',
      'Majibu ya kipaumbele kutoka kwa mtayarishaji'
    ]
  },
  {
    id: 'tier-fedha',
    channelId: '',
    name: 'Fedha (Silver VIP)',
    priceTZS: 15000,
    badgeColor: '#C0C0C0',
    perks: [
      'Faida zote za ngazi ya Shaba',
      'Kutazama video mpya saa 24 kabla hazijawekwa hadharani',
      'Kushiriki kwenye kura za kuamua mada za vipindi vinavyofuata'
    ]
  },
  {
    id: 'tier-dhahabu',
    channelId: '',
    name: 'Dhahabu (Gold Elite)',
    priceTZS: 35000,
    badgeColor: '#FFD700',
    perks: [
      'Faida zote za Shaba na Fedha',
      'Kushiriki kwenye gumzo za moja kwa moja za wanachama pekee (VIP Live Chat)',
      'Kutajwa kwa jina mwishoni mwa kila video kubwa ya mwezi',
      'Punguzo la tiketi za matamasha'
    ]
  }
];

// Production: No demo ad campaigns. Only real advertiser-submitted campaigns.
export const SAMPLE_AD_CAMPAIGNS: AdCampaign[] = [];

// Production: No demo users. Only real registered accounts.
export const INITIAL_USERS: UserProfile[] = [];

// Official Tazama Premium Subscription Plans
export const INITIAL_PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'plan-viewer-free',
    name: 'Tazama Bure (Standard)',
    description: 'Ufikiaji wa kawaida wa video zote zilizochapishwa kwenye Tazama na matangazo.',
    target: 'viewer',
    priceTZS: 0,
    billingPeriod: 'month',
    perks: [
      'Video zenye ubora wa hadi 1080p',
      'Kushiriki maoni na kujiunga na vituo vya waundaji',
      'Hali ya kubana bando (Data Saver)',
      'Kutazama kwa matangazo ya kawaida'
    ],
    popular: false,
    badgeColor: '#A7B0C0',
    badgeLabel: 'Bure',
    isActive: true,
    subscribersCount: 0
  },
  {
    id: 'plan-viewer-monthly',
    name: 'Tazama VIP (Binafsi Mwezi)',
    description: 'Kutazama bila matangazo kabisa, video za kipekee, na kupakua nje ya mtandao.',
    target: 'viewer',
    priceTZS: 4999,
    billingPeriod: 'month',
    perks: [
      'Kutazama video zote BILA matangazo (100% Ad-Free)',
      'Kupakua video kwenye simu kutazama bila intaneti (Offline)',
      'Kucheza sauti nyuma ya pazia (Background & Mini Play)',
      'Ubora wa juu wa 4K na sauti ya Dolby Digital',
      'Ufikiaji wa maudhui ya kwanza ya VIP (Early Access)'
    ],
    popular: true,
    badgeColor: '#FF3040',
    badgeLabel: 'Maarufu Zaidi',
    isActive: true,
    subscribersCount: 0
  },
  {
    id: 'plan-viewer-yearly',
    name: 'Tazama VIP Mwaka Mzima',
    description: 'Pata ofa ya miezi 2 bure ukinunua mpango wa mwaka mzima kwa mara moja.',
    target: 'viewer',
    priceTZS: 49990,
    billingPeriod: 'year',
    perks: [
      'Faida zote za Tazama VIP Mwezi',
      'Ofa ya punguzo la miezi miwili bure (Save 17%)',
      'Beji maalum ya mwanachama wa dhahabu wa Tazama',
      'Kadi ya uanachama ya kidijitali'
    ],
    popular: false,
    badgeColor: '#EAB308',
    badgeLabel: 'Okoa 17%',
    isActive: true,
    subscribersCount: 0
  },
  {
    id: 'plan-creator-free',
    name: 'Studio ya Awali (Starter Creator)',
    description: 'Fungua kituo na anza kupakia video na kupata hadhira Tanzania.',
    target: 'creator',
    priceTZS: 0,
    billingPeriod: 'month',
    perks: [
      'Kupakia video zisizo na kikomo (hadi 1080p)',
      'Takwimu za msingi za watazamaji na likes',
      'Kuwezesha mapato baada ya kufikia vigezo (1,000 subs)',
      'Hifadhi ya kawaida ya Cloudflare Stream'
    ],
    popular: false,
    badgeColor: '#16C784',
    badgeLabel: 'Bure',
    isActive: true,
    subscribersCount: 0
  },
  {
    id: 'plan-creator-pro',
    name: 'Muundaji Mahiri (Creator Pro)',
    description: 'Zana za kisasa za ukuzaji, ulinzi wa hakimiliki (Content Shield), na malipo ya haraka.',
    target: 'creator',
    priceTZS: 15000,
    billingPeriod: 'month',
    perks: [
      'Asilimia 80% ya mapato ya matangazo (badala ya 70%)',
      'Uchanganuzi wa kina wa muda halisi (Advanced Analytics)',
      'Ulinzi thabiti wa kiotomatiki wa COSOTA Content Shield',
      'Uwezo wa kuanzisha uanachama wa kituo (Channel Memberships)',
      'Msaada wa kipaumbele wa masaa 24 kwa njia ya simu na WhatsApp',
      'Beji ya uthibitisho wa uhakika (Verified Creator Partner)'
    ],
    popular: true,
    badgeColor: '#8B5CF6',
    badgeLabel: 'Chaguo la Waumbaji',
    isActive: true,
    subscribersCount: 0
  },
  {
    id: 'plan-creator-enterprise',
    name: 'Kampuni ya Maudhui (Media Enterprise)',
    description: 'Kwa ajili ya vituo vya runinga, studio za filamu, lebo za muziki na mashirika ya habari.',
    target: 'creator',
    priceTZS: 75000,
    billingPeriod: 'month',
    perks: [
      'Ufikiaji wa akaunti nyingi za watumiaji (Multi-user roles & managers)',
      'API maalum ya kupakia video moja kwa moja kutoka studio',
      'Msimamizi binafsi wa akaunti (Dedicated Partner Manager)',
      'Kutoa fedha mara moja bila kikomo cha siku',
      'Ulinzi wa kimataifa wa hakimiliki na mikataba ya kisheria'
    ],
    popular: false,
    badgeColor: '#06B6D4',
    badgeLabel: 'Enterprise',
    isActive: true,
    subscribersCount: 0
  }
];

// Production Platform Settings
export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  platformCommissionPercent: 30,
  creatorRevenuePercent: 70,
  minPayoutTZS: 10000,
  allowNewRegistrations: true,
  maintenanceMode: false,
  autoApprovePayoutsUnderTZS: 50000
};

// Production: No demo audit logs, playlists, streams, claims, requests, posts, or notifications
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

export const INITIAL_PLAYLISTS: Playlist[] = [];

export const INITIAL_LIVE_STREAMS: LiveStream[] = [];

export const INITIAL_COPYRIGHT_CLAIMS: CopyrightClaim[] = [];

export const INITIAL_VERIFICATION_REQUESTS: CreatorVerificationRequest[] = [];

export const INITIAL_MONETIZATION_APPLICATIONS: CreatorMonetizationApplication[] = [];

export const INITIAL_PROMO_CODES: PromoCode[] = [];

export const INITIAL_USER_APPEALS: UserAppeal[] = [];

export const INITIAL_SECURITY_LOGS: SecurityLogEvent[] = [];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [];

export const INITIAL_CREATOR_MEMBERSHIP_TIERS: CreatorMembershipTier[] = [];

export const INITIAL_VIDEO_SUBTITLES: VideoSubtitleTrack[] = [];

export const INITIAL_CREATOR_PROMOTIONS: CreatorPromotion[] = [];

export const INITIAL_NOTIFICATIONS: TazamaNotification[] = [];
