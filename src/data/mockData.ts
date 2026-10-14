import { 
  VideoItem, 
  Channel, 
  VirtualGift, 
  MembershipTier, 
  AdCampaign, 
  UserProfile, 
  PremiumPlan, 
  PlatformSettings, 
  AuditLogEntry 
} from '../types';

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'ch-wasafi',
    ownerId: 'user-diamond',
    handle: '@wasafitv',
    name: 'Wasafi Media',
    bio: 'Jukwaa rasmi la burudani, muziki wa Bongo Flava, mahojiano na matamasha makubwa ya Afrika Mashariki.',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 2450000,
    videoCount: 842,
    isVerified: true,
    isMonetized: true,
    totalViews: 145000000,
    monthlyEarningsTZS: 18500000,
    joinedDate: '2023-01-15'
  },
  {
    id: 'ch-millardayo',
    ownerId: 'user-millard',
    handle: '@millardayo',
    name: 'Millard Ayo',
    bio: 'Kituo chako cha kwanza kwa habari za uhakika, matukio ya kitaifa, biashara, na siasa Tanzania na kimataifa.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 3820000,
    videoCount: 4210,
    isVerified: true,
    isMonetized: true,
    totalViews: 320000000,
    monthlyEarningsTZS: 32000000,
    joinedDate: '2022-05-10'
  },
  {
    id: 'ch-jotitv',
    ownerId: 'user-joti',
    handle: '@jotitv',
    name: 'Joti TV',
    bio: 'Vichekesho vitamu na vibonzo vya Bongo kila wiki. Cheka uongeze siku za kuishi!',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 1680000,
    videoCount: 312,
    isVerified: true,
    isMonetized: true,
    totalViews: 92000000,
    monthlyEarningsTZS: 12400000,
    joinedDate: '2023-03-22'
  },
  {
    id: 'ch-swahilitech',
    ownerId: 'user-techie',
    handle: '@swahilitechies',
    name: 'Swahili Techies',
    bio: 'Mafunzo ya Programu za Kompyuta, Utengenezaji wa Wavuti, na Akili Bandia (AI) kwa lugha adhimu ya Kiswahili.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 420000,
    videoCount: 185,
    isVerified: true,
    isMonetized: true,
    totalViews: 14500000,
    monthlyEarningsTZS: 6800000,
    joinedDate: '2023-09-01'
  },
  {
    id: 'ch-azamtv',
    ownerId: 'user-azam',
    handle: '@azamsports',
    name: 'Azam Sports HD',
    bio: 'Mubashara michezo, Ligi Kuu ya NBC Tanzania Bara, Kombe la Shirikisho, na michezo yote ya Afrika.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 2950000,
    videoCount: 2150,
    isVerified: true,
    isMonetized: true,
    totalViews: 210000000,
    monthlyEarningsTZS: 28000000,
    joinedDate: '2022-11-12'
  },
  {
    id: 'ch-serengetisafari',
    ownerId: 'user-safari',
    handle: '@serengetiwild',
    name: 'Serengeti Wild HD',
    bio: 'Hifadhi za Taifa Tanzania: Serengeti, Ngorongoro, Kilimanjaro, na Selous katika ubora wa 4K.',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 910000,
    videoCount: 140,
    isVerified: true,
    isMonetized: true,
    totalViews: 38000000,
    monthlyEarningsTZS: 9200000,
    joinedDate: '2023-06-18'
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-wasafi-fest',
    channelId: 'ch-wasafi',
    channelName: 'Wasafi Media',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-diamond',
    isChannelVerified: true,
    title: 'WASAFIBURN LIVE MWANZA: Diamond Platnumz Akiamsha Umati CCM Kirumba (Full Performance)',
    description: 'Tazama onyesho kamili la mfalme wa Bongo Flava Diamond Platnumz alipowasha moto kwenye uwanja wa CCM Kirumba Mwanza mbele ya maelfu ya mashabiki. Nyimbo zote kali zikiwemo Komasava, Yope, Jeje, na Marry You!\n\n#Tazama #Wasafi #BongoFlava #Mwanza',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    streamPlaybackId: 'cf-stream-mwanza-live-hd',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 1420,
    category: 'Muziki',
    tags: ['Wasafi', 'Diamond Platnumz', 'Mwanza', 'Live Show', 'Bongo Flava'],
    visibility: 'public',
    isShort: false,
    viewsCount: 684200,
    likesCount: 52100,
    dislikesCount: 120,
    commentsCount: 3410,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'vid-sgr-dar',
    channelId: 'ch-millardayo',
    channelName: 'Millard Ayo',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-millard',
    isChannelVerified: true,
    title: 'TRENI YA UMEME SGR: Safari ya Kwanza Dar es Salaam hadi Dodoma Katika Saa 3 na Nusu!',
    description: 'Tuliingia ndani ya treni ya kisasa ya umeme ya SGR kutoka kituo cha Dar es Salaam (Tanzanite) kuelekea mji mkuu Dodoma. Tazama huduma za VIP, intaneti ya kasi, vyakula, na maoni ya abiria wote.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    streamPlaybackId: 'cf-stream-sgr-doc-01',
    thumbnailUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 845,
    category: 'Habari',
    tags: ['SGR Tanzania', 'Dodoma', 'Dar es Salaam', 'Treni ya Umeme', 'Maendeleo'],
    visibility: 'public',
    isShort: false,
    viewsCount: 495000,
    likesCount: 38400,
    dislikesCount: 95,
    commentsCount: 1980,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString()
  },
  {
    id: 'vid-kariakoo-derby',
    channelId: 'ch-azamtv',
    channelName: 'Azam Sports HD',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-azam',
    isChannelVerified: true,
    title: 'SIMBA SC VS YANGA SC (2-2): Mabao Yote na Matukio ya Kusisimua | NBC Premier League Highlights',
    description: 'Dabi ya Kariakoo iliyoleta msisimko wa aina yake katika Uwanja wa Benjamin Mkapa Dar es Salaam. Tazama magoli ya kiufundi, ufundi wa makocha, na ushangiliaji wa mashabiki wa Msimbazi na Wananchi.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    streamPlaybackId: 'cf-stream-derby-highlights',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 610,
    category: 'Michezo',
    tags: ['Simba SC', 'Yanga SC', 'Kariakoo Derby', 'NBC Premier League', 'Azam Sports'],
    visibility: 'public',
    isShort: false,
    viewsCount: 890000,
    likesCount: 71200,
    dislikesCount: 310,
    commentsCount: 6240,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'vid-swahili-ai',
    channelId: 'ch-swahilitech',
    channelName: 'Swahili Techies',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-techie',
    isChannelVerified: true,
    title: 'JINSI YA KUTENGENEZA APP YA AI KWA KISWAHILI MWANZO MWISHO (Full Crash Course 2026)',
    description: 'Katika video hii tutajifunza jinsi ya kuunganisha akili bandia (Artificial Intelligence) kwenye website na programu za simu kwa kutumia lugha yetu pendwa ya Kiswahili. Tutatengeneza mfano wa mfumo wa kutoa ushauri wa kilimo Tanzania.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    streamPlaybackId: 'cf-stream-swahili-ai-course',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 1820,
    category: 'Teknolojia',
    tags: ['AI Kiswahili', 'Kujifunza Coding', 'Teknolojia Tanzania', 'Web Development'],
    visibility: 'public',
    isShort: false,
    viewsCount: 124500,
    likesCount: 14200,
    dislikesCount: 18,
    commentsCount: 890,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'vid-serengeti-migration',
    channelId: 'ch-serengetisafari',
    channelName: 'Serengeti Wild HD',
    channelAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-safari',
    isChannelVerified: true,
    title: 'UKARIBU WA AJABU: Uhamiaji Mkuu wa Nyumbu Mto Mara Serengeti Katika 4K Ultra HD',
    description: 'Tazama tukio la ajabu zaidi duniani ambapo zaidi ya nyumbu milioni 1.5 na pundamilia wanavuka Mto Mara huku mamba wakisubiri. Rekodi ya kipekee na ya kusisimua ya asili ya Tanzania.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    streamPlaybackId: 'cf-stream-serengeti-4k',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 980,
    category: 'Burudani',
    tags: ['Serengeti', 'Utalii Tanzania', 'Wanyama', 'Mara River', 'Wild Safari'],
    visibility: 'public',
    isShort: false,
    viewsCount: 340000,
    likesCount: 29500,
    dislikesCount: 42,
    commentsCount: 1420,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    id: 'vid-joti-comedy',
    channelId: 'ch-jotitv',
    channelName: 'Joti TV',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-joti',
    isChannelVerified: true,
    title: 'MZEE WA MICHANGO: Joti Alivyokwepa Harusi ya Binamu Yake Mbezi Beach!',
    description: 'Mzee wa michango anapata kadi 10 za harusi kwa wiki moja! Tazama mbinu zake za ajabu za kuhepa kikao cha maandalizi cha harusi.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    streamPlaybackId: 'cf-stream-joti-skit-01',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 520,
    category: 'Vichekesho',
    tags: ['Joti', 'Vichekesho', 'Bongo Comedy', 'Dar es Salaam', 'Harusi'],
    visibility: 'public',
    isShort: false,
    viewsCount: 712000,
    likesCount: 63000,
    dislikesCount: 88,
    commentsCount: 4120,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  }
];

export const INITIAL_SHORTS: VideoItem[] = [
  {
    id: 'short-kilimanjaro-sunrise',
    channelId: 'ch-serengetisafari',
    channelName: 'Serengeti Wild HD',
    channelAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-safari',
    title: 'Jua Likichomoza Kilele cha Uhuru Kilimanjaro 🇹🇿 5,895m!',
    description: 'Hisia za kufika kilele cha juu zaidi barani Afrika asubuhi na mapema. Tanzania tunajivunia nchi yetu!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 38,
    category: 'Mtindo wa Maisha',
    tags: ['Kilimanjaro', 'UhuruPeak', 'Tanzania'],
    visibility: 'public',
    isShort: true,
    viewsCount: 342000,
    likesCount: 41000,
    commentsCount: 1840,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'short-singeli-energy',
    channelId: 'ch-wasafi',
    channelName: 'Wasafi Media',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-diamond',
    title: 'Mdundo wa Singeli Manzese Uwanjani! Hakuna Kulala 🔥',
    description: 'Nishati ya nguvu ya Singeli kutoka mitaa ya Dar es Salaam!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 45,
    category: 'Muziki',
    tags: ['Singeli', 'Bongo', 'DarEsSalaam'],
    visibility: 'public',
    isShort: true,
    viewsCount: 520000,
    likesCount: 68000,
    commentsCount: 2950,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    id: 'short-cheetah-sprint',
    channelId: 'ch-serengetisafari',
    channelName: 'Serengeti Wild HD',
    channelAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-safari',
    title: 'Duma Akikimbia Kasi ya 100km/h Serengeti!',
    description: 'Mnyama mwenye kasi zaidi duniani akinasa windo lake.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 29,
    category: 'Burudani',
    tags: ['Duma', 'Cheetah', 'SerengetiSafari'],
    visibility: 'public',
    isShort: true,
    viewsCount: 780000,
    likesCount: 89000,
    commentsCount: 3200,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 'short-joti-daladala',
    channelId: 'ch-jotitv',
    channelName: 'Joti TV',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    channelOwnerId: 'user-joti',
    title: 'Konda wa Daladala Posta Anapokataa Kutoa Chenji ya Buku 😂',
    description: 'Hali halisi ya daladala za Dar es Salaam saa za jioni.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 52,
    category: 'Vichekesho',
    tags: ['Daladala', 'BongoComedy', 'JotiTV'],
    visibility: 'public',
    isShort: true,
    viewsCount: 460000,
    likesCount: 51200,
    commentsCount: 2100,
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
  }
];

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

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'tier-shaba',
    channelId: 'ch-wasafi',
    name: 'Shaba (Bronze Tier)',
    priceTZS: 5000,
    badgeColor: '#CD7F32',
    perks: [
      'Beji maalum ya mfuasi waaminifu pembeni ya jina lako kwenye maoni',
      'Emoji rasmi za Wasafi unazoweza kutumia kwenye maoni',
      'Majibu ya kipaumbele kutoka kwa mtayarishaji'
    ]
  },
  {
    id: 'tier-fedha',
    channelId: 'ch-wasafi',
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
    channelId: 'ch-wasafi',
    name: 'Dhahabu (Gold Patron)',
    priceTZS: 40000,
    badgeColor: '#FFD700',
    perks: [
      'Faida zote za Shaba na Fedha',
      'Kipindi cha mubashara (Live Q&A) cha kipekee kila mwezi',
      'Kutajwa jina lako mwishoni mwa video kama mfadhili mkuu',
      'Punguzo la tiketi za matamasha ya Wasafi Festival'
    ]
  }
];

export const SAMPLE_AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'ad-airtel-5g',
    title: 'Airtel 5G Tanzania — Kasi Isiyo na Kikomo',
    advertiserName: 'Airtel Tanzania',
    adType: 'pre-roll',
    targetCategory: 'Teknolojia',
    status: 'active',
    impressions: 145000,
    clicks: 8200,
    budgetTZS: 5000000,
    spendTZS: 3200000
  },
  {
    id: 'ad-crdb-simbanking',
    title: 'SimBanking App — Benki Mkononi Mwako Popote',
    advertiserName: 'CRDB Bank PLC',
    adType: 'banner',
    targetCategory: 'Habari',
    status: 'active',
    impressions: 210000,
    clicks: 12500,
    budgetTZS: 8000000,
    spendTZS: 6100000
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user-admin-root',
    email: 'amytzee@gmail.com',
    displayName: 'Amytzee (Super Admin)',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    country: 'Tanzania',
    preferredLanguage: 'sw',
    channelId: 'ch-wasafi',
    balanceTZS: 450000,
    isBlocked: false,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    uid: 'user-diamond',
    email: 'diamond@wasafi.co.tz',
    displayName: 'Naseeb Abdul (Diamond Platnumz)',
    photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'creator',
    country: 'Tanzania',
    preferredLanguage: 'sw',
    channelId: 'ch-wasafi',
    balanceTZS: 18500000,
    creatorPlanId: 'plan-creator-pro',
    isBlocked: false,
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    uid: 'user-millard',
    email: 'millard@ayo.tv',
    displayName: 'Millard Ayo',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'creator',
    country: 'Tanzania',
    preferredLanguage: 'sw',
    channelId: 'ch-millardayo',
    balanceTZS: 32000000,
    creatorPlanId: 'plan-creator-enterprise',
    isBlocked: false,
    createdAt: '2024-02-01T09:15:00.000Z'
  },
  {
    uid: 'user-joti',
    email: 'joti@jotitv.com',
    displayName: 'Lucas Mhuvile (Joti)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'creator',
    country: 'Tanzania',
    preferredLanguage: 'sw',
    channelId: 'ch-jotitv',
    balanceTZS: 12400000,
    creatorPlanId: 'plan-creator-pro',
    isBlocked: false,
    createdAt: '2024-03-10T11:45:00.000Z'
  },
  {
    uid: 'user-amina-viewer',
    email: 'amina.salum@gmail.com',
    displayName: 'Amina Salum',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'viewer',
    country: 'Tanzania',
    preferredLanguage: 'sw',
    balanceTZS: 35000,
    premiumPlanId: 'plan-viewer-monthly',
    isBlocked: false,
    createdAt: '2024-04-12T14:20:00.000Z'
  },
  {
    uid: 'user-baraka-mrema',
    email: 'baraka.mrema@gmail.com',
    displayName: 'Baraka Mrema',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'viewer',
    country: 'Tanzania',
    preferredLanguage: 'sw',
    balanceTZS: 15000,
    isBlocked: false,
    createdAt: '2024-04-20T16:10:00.000Z'
  },
  {
    uid: 'user-spammer-bad',
    email: 'scammer101@tempmail.org',
    displayName: 'Bot Account 492',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'viewer',
    country: 'Tanzania',
    preferredLanguage: 'en',
    balanceTZS: 0,
    isBlocked: true,
    blockReason: 'Kusambaza viungo vya ulaghai (Phishing & Spam)',
    createdAt: '2024-05-02T19:00:00.000Z'
  }
];

export const INITIAL_PREMIUM_PLANS: PremiumPlan[] = [
  // Viewer Plans
  {
    id: 'plan-viewer-free',
    name: 'Tazama Bure (Standard)',
    description: 'Ufikiaji wa kawaida wa video zote zilizochapishwa kwenye Tazama na matangazo.',
    target: 'viewer',
    priceTZS: 0,
    billingPeriod: 'month',
    perks: [
      'Kutazama video zote bure zenye matangazo',
      'Ubora wa picha hadi 1080p Full HD',
      'Kutoa maoni na kuweka like',
      'Kutuma zawadi za kidijitali kwa watayarishaji'
    ],
    badgeColor: '#A7B0C0',
    badgeLabel: 'Bure',
    isActive: true,
    popular: false,
    subscribersCount: 24500
  },
  {
    id: 'plan-viewer-monthly',
    name: 'Tazama VIP Mwezi (Ad-Free)',
    description: 'Tazama video zote bila usumbufu wa matangazo, ubora wa juu wa 4K na sauti ya Dolby.',
    target: 'viewer',
    priceTZS: 4900,
    billingPeriod: 'month',
    perks: [
      'Bila matangazo kabisa (100% Ad-Free Video Streaming)',
      'Ubora wa juu wa 4K Ultra HD & HDR',
      'Kupakua video kutazama nje ya mtandao (Offline Downloads)',
      'Kusikiliza sauti nyuma ya skrini (Background Audio Playback)',
      'Beji maalum ya VIP kwenye maoni na live chats'
    ],
    badgeColor: '#FF3040',
    badgeLabel: 'VIP Mwezi',
    isActive: true,
    popular: true,
    subscribersCount: 3120
  },
  {
    id: 'plan-viewer-yearly',
    name: 'Tazama VIP Mwaka (Okoa 25%)',
    description: 'Kifurushi cha mwaka mzima chenye punguzo kubwa na ufikiaji wa matukio yote mubashara.',
    target: 'viewer',
    priceTZS: 44000,
    billingPeriod: 'year',
    perks: [
      'Faida zote za Tazama VIP Mwezi kwa mwaka mzima',
      'Okoa zaidi ya 25% ya ada ya kila mwezi',
      'Tiketi za punguzo kwenye matamasha na matukio ya Wasafi/Tazama',
      'Ufikiaji wa mapema wa filamu mpya za Kitanzania (Early Access)'
    ],
    badgeColor: '#F59E0B',
    badgeLabel: 'VIP Mwaka',
    isActive: true,
    popular: false,
    subscribersCount: 840
  },

  // Creator Plans
  {
    id: 'plan-creator-free',
    name: 'Creator Starter (Kawaida)',
    description: 'Kifurushi cha kuanzia kwa watengenezaji video wapya wanaojenga hadhira yao.',
    target: 'creator',
    priceTZS: 0,
    billingPeriod: 'month',
    perks: [
      'Mgawanyo wa mapato wa kawaida (70% Creator / 30% Tazama)',
      'Hadi GB 20 za hifadhi ya video Cloudflare/Cloudinary',
      'Takwimu za msingi za kituo (Basic Analytics)',
      'Uwezo wa kupokea zawadi za kidijitali kutoka kwa watazamaji',
      'Malipo ya kila mwezi kupitia M-Pesa / Tigo Pesa'
    ],
    badgeColor: '#A7B0C0',
    badgeLabel: 'Starter',
    isActive: true,
    popular: false,
    subscribersCount: 1420
  },
  {
    id: 'plan-creator-pro',
    name: 'Creator Pro (Wataalamu)',
    description: 'Ongeza mapato yako hadi 85% ya gawio, hifadhi kubwa ya 250GB na beji rasmi ya Pro.',
    target: 'creator',
    priceTZS: 25000,
    billingPeriod: 'month',
    perks: [
      'Mgawanyo bora wa mapato: 85% kwa Mtayarishaji (Kamisheni ndogo ya 15%)',
      'Hadi GB 250 za hifadhi ya video ya kasi ya juu',
      'Beji rasmi ya dhahabu (Creator Pro Verified)',
      'Takwimu za kina za hadhira ya Afrika Mashariki na mapato ya saa',
      'Msaada wa kipaumbele wa kiufundi (Priority Support chini ya saa 2)',
      'Kutoa fedha mara moja kwa wiki bila kikomo cha chini cha juu'
    ],
    badgeColor: '#16C784',
    badgeLabel: 'Creator Pro',
    isActive: true,
    popular: true,
    subscribersCount: 290
  },
  {
    id: 'plan-creator-enterprise',
    name: 'Studio Enterprise / Media House',
    description: 'Kwa vituo vikubwa vya televisheni, lebo za muziki, na studio za uzalishaji wa filamu.',
    target: 'creator',
    priceTZS: 75000,
    billingPeriod: 'month',
    perks: [
      'Mgawanyo mkubwa zaidi: 90% kwa Studio / 10% kwa Tazama',
      'Hifadhi isiyo na kikomo ya video za 4K (Unlimited Storage)',
      'Usimamizi wa moja kwa moja wa haki za COSOTA & Content ID',
      'Meneja wa akaunti wa kipekee (Dedicated Account Manager)',
      'Kuweka matangazo yako binafsi (Custom Brand Sponsorships)',
      'API ya kuunganisha na mifumo ya utangazaji ya TV'
    ],
    badgeColor: '#8B5CF6',
    badgeLabel: 'Enterprise',
    isActive: true,
    popular: false,
    subscribersCount: 42
  }
];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  platformCommissionPercent: 30,
  creatorRevenuePercent: 70,
  minPayoutTZS: 10000,
  allowNewRegistrations: true,
  maintenanceMode: false,
  autoApprovePayoutsUnderTZS: 50000
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    action: 'USER_ROLE_PROMOTED',
    adminEmail: 'amytzee@gmail.com',
    target: 'user-diamond',
    details: 'Mtumiaji Naseeb Abdul amepewa uwezo wa Creator Pro & Verification Badge.',
    status: 'SUCCESS',
    timestamp: '2024-05-10T14:30:00.000Z'
  },
  {
    id: 'log-002',
    action: 'USER_BLOCKED',
    adminEmail: 'amytzee@gmail.com',
    target: 'user-spammer-bad',
    details: 'Mtumiaji amezuiwa (Blocked) kwa kusambaza link zenye spam kwenye maoni.',
    status: 'WARNING',
    timestamp: '2024-05-11T09:12:00.000Z'
  },
  {
    id: 'log-003',
    action: 'PAYOUT_APPROVED',
    adminEmail: 'amytzee@gmail.com',
    target: 'pay-001 (Wasafi Media)',
    details: 'Malipo ya TZS 5,000,000 kwenda M-Pesa 0754 123 456 yameidhinishwa na kutumwa.',
    status: 'SUCCESS',
    timestamp: '2024-05-12T11:00:00.000Z'
  },
  {
    id: 'log-004',
    action: 'PREMIUM_PLAN_UPDATED',
    adminEmail: 'amytzee@gmail.com',
    target: 'plan-viewer-monthly',
    details: 'Bei ya Tazama VIP Mwezi imewekwa TZS 4,900 kwa mwezi.',
    status: 'SUCCESS',
    timestamp: '2024-05-12T16:45:00.000Z'
  }
];

