import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Clock,
  ThumbsUp,
  Tv,
  Download,
  ListMusic,
  Plus,
  Trash2,
  Play,
  FolderPlus,
  WifiOff,
  Wallet,
  Crown,
  Smartphone,
  ChevronRight,
  LogIn,
  UserPlus,
  X,
  ArrowUpRight,
  Check,
  Pencil,
  Search,
  UserMinus,
  ThumbsDown,
  CheckCircle2,
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { VideoDownloadModal } from '../components/modals/VideoDownloadModal';
import { VideoItem, Playlist } from '../types';
import { translations, formatViews, formatTZS, formatRelativeTime, formatDuration } from '../lib/i18n';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';

type LibraryTabId =
  | 'all'
  | 'offline'
  | 'playlists'
  | 'history'
  | 'liked'
  | 'subscriptions'
  | 'queue';

interface LibraryPageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onOpenWallet?: () => void;
  onOpenPremium?: () => void;
  onNavigate?: (page: string) => void;
  initialTab?: LibraryTabId;
  tabRequestKey?: number;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onSelectVideo,
  onSelectChannel,
  onOpenWallet,
  onOpenPremium,
  onNavigate,
  initialTab = 'all',
  tabRequestKey = 0,
}) => {
  const {
    watchHistory,
    removeFromWatchHistory,
    clearWatchHistory,
    videos,
    shorts,
    likedVideoIds,
    toggleLike,
    channels,
    userSubscriptions,
    toggleSubscribe,
    offlineDownloads,
    removeDownload,
    isDownloaded,
    playlists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    renamePlaylist,
    deletePlaylist,
    playbackQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    isDataSaver,
    toggleDataSaver,
  } = useVideo();

  const { profile, language } = useAuth();
  const t = translations[language];
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<LibraryTabId>(initialTab);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [selectedInitialVideoIds, setSelectedInitialVideoIds] = useState<string[]>([]);
  const [createPickerSearch, setCreatePickerSearch] = useState<string>('');

  const [inspectPlaylistId, setInspectPlaylistId] = useState<string | null>(null);
  const [isEditingPlaylist, setIsEditingPlaylist] = useState<boolean>(false);
  const [editPlaylistTitle, setEditPlaylistTitle] = useState<string>('');
  const [editPlaylistDesc, setEditPlaylistDesc] = useState<string>('');
  const [showAddToPlaylistPicker, setShowAddToPlaylistPicker] = useState<boolean>(false);
  const [inspectorSearch, setInspectorSearch] = useState<string>('');

  const [showQuickDownloadPicker, setShowQuickDownloadPicker] = useState<boolean>(false);
  const [downloadPickerSearch, setDownloadPickerSearch] = useState<string>('');
  const [downloadModalVideo, setDownloadModalVideo] = useState<VideoItem | null>(null);

  const [historyClearedNotice, setHistoryClearedNotice] = useState<boolean>(false);
  const tabsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, tabRequestKey]);

  const scrollToTabsSection = () => {
    if (tabsSectionRef.current) {
      tabsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleSelectMetricOrTab = (tabId: LibraryTabId) => {
    setActiveTab(tabId);
    setTimeout(scrollToTabsSection, 40);
  };

  const allVideoPool = useMemo(() => {
    const map = new Map<string, VideoItem>();
    (videos || []).forEach((v) => {
      if (v && v.id) map.set(v.id, v);
    });
    (shorts || []).forEach((s) => {
      if (s && s.id && !map.has(s.id)) map.set(s.id, s);
    });
    return map;
  }, [videos, shorts]);

  const allVideoList = useMemo(() => Array.from(allVideoPool.values()), [allVideoPool]);

  const likedVideos = useMemo(
    () => allVideoList.filter((v) => Boolean(v && v.id && likedVideoIds.includes(v.id))),
    [allVideoList, likedVideoIds]
  );

  const subbedChannels = useMemo(
    () =>
      (channels || []).filter((c) => Boolean(c && c.id && userSubscriptions.includes(c.id))),
    [channels, userSubscriptions]
  );

  const subbedVideos = useMemo(
    () =>
      allVideoList.filter((v) =>
        Boolean(v && v.channelId && userSubscriptions.includes(v.channelId))
      ),
    [allVideoList, userSubscriptions]
  );

  const totalOfflineBytes = offlineDownloads.reduce(
    (acc, curr) => acc + (curr.fileSizeBytes || 0),
    0
  );
  const totalOfflineMB = (totalOfflineBytes / (1024 * 1024)).toFixed(1);

  const watchLaterCount = useMemo(() => {
    const wl = playlists.find((p) => p.id === 'pl-watch-later');
    return wl ? wl.videoIds.length : 0;
  }, [playlists]);

  const inspectedPlaylist = useMemo(
    () => playlists.find((p) => p.id === inspectPlaylistId) || null,
    [playlists, inspectPlaylistId]
  );

  const inspectedPlaylistVideos = useMemo(() => {
    if (!inspectedPlaylist) return [];
    return inspectedPlaylist.videoIds
      .map((id) => allVideoPool.get(id))
      .filter((v): v is VideoItem => Boolean(v));
  }, [inspectedPlaylist, allVideoPool]);

  useEffect(() => {
    if (inspectedPlaylist) {
      setEditPlaylistTitle(inspectedPlaylist.title);
      setEditPlaylistDesc(inspectedPlaylist.description || '');
      setIsEditingPlaylist(false);
      setShowAddToPlaylistPicker(false);
      setInspectorSearch('');
    }
  }, [inspectPlaylistId]);

  const isLoggedIn = Boolean(profile && profile.uid);
  const isVIP = Boolean(
    isLoggedIn && profile?.premiumPlanId && profile.premiumPlanId !== 'plan-viewer-free'
  );

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    const newId = createPlaylist(
      newPlaylistTitle.trim(),
      newPlaylistDesc.trim(),
      selectedInitialVideoIds
    );
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
    setSelectedInitialVideoIds([]);
    setCreatePickerSearch('');
    setShowCreatePlaylistModal(false);
    setActiveTab('playlists');
    if (selectedInitialVideoIds.length === 0) {
      setInspectPlaylistId(newId);
    }
  };

  const handleToggleInitialVideo = (videoId: string) => {
    setSelectedInitialVideoIds((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );
  };

  const handleSavePlaylistEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedPlaylist || !editPlaylistTitle.trim()) return;
    renamePlaylist(inspectedPlaylist.id, editPlaylistTitle.trim(), editPlaylistDesc.trim());
    setIsEditingPlaylist(false);
  };

  const handlePlayPlaylistAll = (plVideos: VideoItem[]) => {
    if (plVideos.length === 0) return;
    const [first, ...rest] = plVideos;
    rest.forEach((v) => addToQueue(v));
    setInspectPlaylistId(null);
    onSelectVideo(first);
  };

  const handleClearHistory = () => {
    clearWatchHistory();
    setHistoryClearedNotice(true);
    setTimeout(() => setHistoryClearedNotice(false), 2600);
  };

  const getPlaylistCoverUrl = (pl: Playlist): string => {
    if (pl.coverUrl) return pl.coverUrl;
    const firstId = pl.videoIds[0];
    const firstVid = firstId ? allVideoPool.get(firstId) : undefined;
    if (firstVid?.thumbnailUrl) return firstVid.thumbnailUrl;
    return createThumbnailSvgDataUri(pl.title, 'Playlist');
  };

  const filteredCreateVideos = useMemo(() => {
    const q = createPickerSearch.trim().toLowerCase();
    if (!q) return allVideoList.slice(0, 12);
    return allVideoList
      .filter(
        (v) =>
          v.title.toLowerCase().includes(q) || v.channelName.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [allVideoList, createPickerSearch]);

  const filteredInspectorVideos = useMemo(() => {
    if (!inspectedPlaylist) return [];
    const q = inspectorSearch.trim().toLowerCase();
    const candidates = allVideoList.filter((v) => !inspectedPlaylist.videoIds.includes(v.id));
    if (!q) return candidates.slice(0, 15);
    return candidates
      .filter(
        (v) =>
          v.title.toLowerCase().includes(q) || v.channelName.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [allVideoList, inspectedPlaylist, inspectorSearch]);

  const filteredQuickDownloadVideos = useMemo(() => {
    const q = downloadPickerSearch.trim().toLowerCase();
    if (!q) return allVideoList.slice(0, 16);
    return allVideoList
      .filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channelName.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [allVideoList, downloadPickerSearch]);

  // Summary metric tiles — single-elevation Bento strip
  const overviewMetrics: Array<{
    id: LibraryTabId;
    label: string;
    count: number;
    subtext: string;
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
  }> = [
    {
      id: 'offline',
      label: isEn ? 'Offline' : 'Nje ya Mtandao',
      count: offlineDownloads.length,
      subtext: `${totalOfflineMB} MB`,
      icon: WifiOff,
      accentClass: 'text-emerald-600 dark:text-[#16C784]',
    },
    {
      id: 'playlists',
      label: isEn ? 'Playlists' : 'Orodha Zangu',
      count: playlists.length,
      subtext:
        watchLaterCount > 0
          ? `${watchLaterCount} ${isEn ? 'Watch later' : 'Tazama Baadaye'}`
          : isEn
            ? 'Curated lists'
            : 'Mkusanyiko wako',
      icon: ListMusic,
      accentClass: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'history',
      label: isEn ? 'History' : 'Historia',
      count: watchHistory.length,
      subtext: isEn ? 'Recently watched' : 'Ulizotazama',
      icon: Clock,
      accentClass: 'text-[#FF3040]',
    },
    {
      id: 'liked',
      label: isEn ? 'Liked' : 'Zilizopendwa',
      count: likedVideos.length,
      subtext: isEn ? 'Saved favorites' : 'Zenye Like',
      icon: ThumbsUp,
      accentClass: 'text-sky-600 dark:text-sky-400',
    },
  ];

  // Filter tabs (clean underline navigation)
  const navTabs: Array<{ id: LibraryTabId; label: string; count?: number }> = [
    { id: 'all', label: isEn ? 'Overview' : 'Muhtasari' },
    { id: 'offline', label: isEn ? 'Offline' : 'Nje ya Mtandao', count: offlineDownloads.length },
    { id: 'playlists', label: isEn ? 'Playlists' : 'Orodha Zangu', count: playlists.length },
    { id: 'history', label: t.history, count: watchHistory.length },
    { id: 'liked', label: isEn ? 'Liked' : 'Zilizopendwa', count: likedVideos.length },
    {
      id: 'subscriptions',
      label: isEn ? 'Following' : 'Usajili',
      count: subbedChannels.length || subbedVideos.length,
    },
  ];
  if (playbackQueue.length > 0) {
    navTabs.splice(1, 0, {
      id: 'queue',
      label: isEn ? 'Queue' : 'Foleni',
      count: playbackQueue.length,
    });
  }

  // Sections that have zero items get a sleek compact directory strip on Overview ('all')
  const emptyOverviewDirectory = [
    offlineDownloads.length === 0 && {
      id: 'offline' as const,
      title: isEn ? 'Offline Downloads' : 'Video za Nje ya Mtandao',
      desc: isEn
        ? 'Download videos to watch anywhere without mobile data.'
        : 'Pakua video utazame popote hata bila intaneti.',
      ctaLabel: isEn ? 'Download' : 'Pakua / Gundua',
      icon: Download,
      onCta: () => setShowQuickDownloadPicker(true),
    },
    playlists.length === 0 && {
      id: 'playlists' as const,
      title: isEn ? 'Personal Playlists' : 'Orodha za Video & Muziki',
      desc: isEn
        ? 'Organize tutorials, songs, and shows into custom playlists.'
        : 'Unda orodha zako maalum za muziki, filamu na vipindi.',
      ctaLabel: isEn ? 'New playlist' : 'Unda orodha',
      icon: ListMusic,
      onCta: () => setShowCreatePlaylistModal(true),
    },
    watchHistory.length === 0 && {
      id: 'history' as const,
      title: isEn ? 'Watch History' : 'Historia ya Kutazama',
      desc: isEn
        ? 'Pick up right where you left off across recent videos.'
        : 'Video ulizotazama zitaorodheshwa hapa kwa urejeo rahisi.',
      ctaLabel: isEn ? 'Watch now' : 'Tazama',
      icon: Clock,
      onCta: () => onNavigate?.('home'),
    },
    likedVideos.length === 0 && {
      id: 'liked' as const,
      title: isEn ? 'Liked Videos' : 'Video Nilizopenda',
      desc: isEn
        ? 'Tap Like on any video to keep it handy in one collection.'
        : 'Bofya Like kwenye video yoyote uipendayo ihifadhiwe hapa.',
      ctaLabel: isEn ? 'Explore' : 'Vinjari',
      icon: ThumbsUp,
      onCta: () => onNavigate?.('explore'),
    },
    subbedChannels.length === 0 && subbedVideos.length === 0 && {
      id: 'subscriptions' as const,
      title: isEn ? 'Followed Creators' : 'Maudhui ya Vituo Vyako',
      desc: isEn
        ? 'Subscribe to Tanzanian creators to see new drops first.'
        : 'Fuatilia waumbaji uwapendao upate video zao mpya hapa.',
      ctaLabel: isEn ? 'Channels' : 'Chaneli',
      icon: Tv,
      onCta: () => onNavigate?.('channels'),
    },
  ].filter(Boolean) as Array<{
    id: LibraryTabId;
    title: string;
    desc: string;
    ctaLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    onCta: () => void;
  }>;

  const renderFocusedEmptyState = (
    IconComp: React.ComponentType<{ className?: string }>,
    title: string,
    description: string,
    ctaText?: string,
    onCta?: () => void,
    secondaryCtaText?: string,
    onSecondaryCta?: () => void
  ) => (
    <div className="py-12 px-5 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] text-center max-w-xl mx-auto space-y-3.5">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1E2534] text-slate-600 dark:text-[#A7B0C0] flex items-center justify-center mx-auto">
        <IconComp className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {(ctaText || secondaryCtaText) && (
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
          {ctaText && onCta && (
            <button
              type="button"
              onClick={onCta}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
          {secondaryCtaText && onSecondaryCta && (
            <button
              type="button"
              onClick={onSecondaryCta}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2534] dark:hover:bg-[#273042] text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{secondaryCtaText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderMobileVideoRow = (
    vid: VideoItem,
    actionButton?: React.ReactNode
  ) => (
    <div
      key={vid.id}
      onClick={() => onSelectVideo(vid)}
      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-slate-300 dark:hover:border-[#343E54] active:scale-[0.99] transition-all cursor-pointer"
    >
      <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 ring-1 ring-black/10 dark:ring-white/10">
        <img
          src={vid.thumbnailUrl || createThumbnailSvgDataUri(vid.title, vid.category)}
          alt={vid.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = createThumbnailSvgDataUri(
              vid.title,
              vid.category
            );
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono font-bold">
          {formatDuration(vid.durationSeconds)}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
          {vid.title}
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectChannel(vid.channelId);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white max-w-full truncate"
        >
          <span className="truncate">{vid.channelName}</span>
          {vid.isChannelVerified && (
            <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
          )}
        </button>
        <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] truncate tabular-nums">
          {formatViews(vid.viewsCount, language)} · {formatRelativeTime(vid.createdAt, language)}
        </p>
      </div>

      {actionButton && (
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {actionButton}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 select-none">
      {/* 1. MODERN HEADER BAND */}
      <section className="rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Identity & Actions */}
          {isLoggedIn ? (
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(
                        profile.displayName || 'User'
                      );
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-[#2A3244]"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FF3040] flex items-center justify-center text-white font-extrabold text-xl">
                    {(profile?.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#94A3B8] font-medium">
                  {isVIP ? (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Tazama VIP</span>
                    </span>
                  ) : (
                    <span>
                      {profile?.role === 'creator'
                        ? isEn
                          ? 'Creator Account'
                          : 'Akaunti ya Muundaji'
                        : profile?.role === 'admin'
                          ? isEn
                            ? 'Administrator'
                            : 'Msimamizi Mkuu'
                          : isEn
                            ? 'Viewer Library'
                            : 'Maktaba ya Mtazamaji'}
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {subbedChannels.length}{' '}
                    {isEn ? 'subscriptions' : 'vituo'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  {profile?.displayName || 'Mwanachama wa Tazama'}
                </h1>

                {profile?.email && (
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono truncate">
                    {profile.email}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-w-xl">
              <p className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
                {isEn ? 'Tazama Library · Guest session' : 'Maktaba ya Tazama · Hali ya Mgeni'}
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
                {isEn ? 'Your Personal Video Hub' : 'Maktaba Yako ya Video'}
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                {isEn
                  ? 'Save watch-later picks, organize custom playlists, and sync history across every device.'
                  : 'Hifadhi video za kutazama baadaye, panga orodha zako na ufuatilie historia katika vifaa vyote.'}
              </p>

              {onNavigate && (
                <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isEn ? 'Sign In' : 'Kuingia'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2534] dark:hover:bg-[#262F42] border border-slate-200 dark:border-[#2E374B] text-slate-800 dark:text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                    <span>{isEn ? 'Create Account' : 'Jisajili Bure'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Right Controls Column */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-[#222836]">
            {isLoggedIn && (
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B]">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#16C784] shrink-0" />
                  <div className="leading-tight">
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                      {isEn ? 'Wallet' : 'Salio'}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold font-mono tabular-nums text-emerald-700 dark:text-[#16C784]">
                      {formatTZS(profile?.balanceTZS || 0)}
                    </span>
                  </div>
                  {onOpenWallet && (
                    <button
                      type="button"
                      onClick={onOpenWallet}
                      className="ml-1 px-2.5 py-1.5 rounded-lg bg-[#16C784] hover:bg-[#13A76E] text-black text-[11px] font-extrabold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      + {isEn ? 'Top Up' : 'Weka Pesa'}
                    </button>
                  )}
                </div>

                {onOpenPremium && !isVIP && (
                  <button
                    type="button"
                    onClick={onOpenPremium}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Go Ad-Free VIP' : 'Pata VIP'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Clean Modern Data Saver Toggle Row */}
            <button
              type="button"
              role="switch"
              aria-checked={isDataSaver}
              onClick={toggleDataSaver}
              className={`flex items-center justify-between gap-4 min-h-[44px] px-3.5 py-2 rounded-xl border transition-colors cursor-pointer ${
                isDataSaver
                  ? 'bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border-emerald-300 dark:border-[#16C784]/40'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#10131B] dark:hover:bg-[#191E2B] border-slate-200 dark:border-[#242B3B]'
              }`}
              title={isEn ? 'Toggle 360p bandwidth saving playback' : 'Washa au zima ubora wa kubana MBs'}
            >
              <div className="flex items-center gap-2.5 text-left">
                <Smartphone
                  className={`w-4 h-4 shrink-0 ${
                    isDataSaver
                      ? 'text-emerald-600 dark:text-[#16C784]'
                      : 'text-slate-500 dark:text-[#94A3B8]'
                  }`}
                />
                <div className="leading-tight">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {isEn ? 'Data Saver' : 'Kubana Bando'}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-[#94A3B8] tabular-nums whitespace-nowrap">
                    {isDataSaver
                      ? isEn
                        ? 'Active · 360p'
                        : 'Imewashwa · 360p'
                      : isEn
                        ? 'Off · HD quality'
                        : 'Imezimwa · HD'}
                  </span>
                </div>
              </div>

              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  isDataSaver
                    ? 'bg-emerald-500 dark:bg-[#16C784]'
                    : 'bg-slate-300 dark:bg-[#2F374A]'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    isDataSaver ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. QUICK BENTO OVERVIEW METRICS */}
      <section aria-label={isEn ? 'Library metrics' : 'Muhtasari wa maktaba'}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {overviewMetrics.map((metric) => {
            const Icon = metric.icon;
            const isSelected = activeTab === metric.id;
            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => handleSelectMetricOrTab(isSelected ? 'all' : metric.id)}
                className={`group text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-white dark:bg-[#19202E] border-[#FF3040] ring-1 ring-[#FF3040]/30'
                    : 'bg-white hover:bg-slate-50/70 dark:bg-[#151A24] dark:hover:bg-[#191F2C] border-slate-200 dark:border-[#242B3B] hover:border-slate-300 dark:hover:border-[#343E54]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8] truncate">
                    {metric.label}
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 ${metric.accentClass}`} />
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                    {metric.count}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate font-medium group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                    {metric.subtext}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. SUBSCRIBED CREATORS BAR */}
      {subbedChannels.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {isEn ? 'Subscribed Channels' : 'Vituo Unavyofuatilia'}
            </h2>
            <button
              type="button"
              onClick={() => handleSelectMetricOrTab('subscriptions')}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white font-mono tabular-nums cursor-pointer"
            >
              {subbedChannels.length} {isEn ? 'channels' : 'vituo'} &rarr;
            </button>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
            {subbedChannels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 group min-w-[68px] text-center cursor-pointer"
              >
                <img
                  src={ch.avatarUrl || createAvatarSvgDataUri(ch.name)}
                  alt={ch.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri(ch.name);
                  }}
                  className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#2A3244] group-hover:ring-2 group-hover:ring-[#FF3040] transition-all bg-slate-100 dark:bg-[#191E29]"
                />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] truncate max-w-[76px] group-hover:text-slate-900 dark:group-hover:text-white">
                  {ch.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. MODERN UNDERLINE TAB BAR + "+ ORODHA MPYA" ACTION */}
      <div
        ref={tabsSectionRef}
        className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-[#242B3B]"
      >
        <nav
          aria-label={isEn ? 'Library sections' : 'Sehemu za maktaba'}
          className="flex-1 min-w-0 flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar -mb-px"
        >
          {navTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 min-h-[44px] py-2.5 text-xs sm:text-[13px] whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#FF3040] text-slate-900 dark:text-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white font-semibold'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isSelected ? 'text-[#FF3040]' : 'text-slate-400 dark:text-[#64748B]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setShowCreatePlaylistModal(true)}
          className="inline-flex items-center gap-1 sm:gap-1.5 min-h-[34px] sm:min-h-[36px] px-2.5 sm:px-3.5 py-1.5 mb-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isEn ? 'New list' : 'Orodha Mpya'}</span>
        </button>
      </div>

      {/* 5. POPULATED SECTIONS OR FOCUSED TAB CONTENT */}
      <div className="space-y-8">
        {/* QUEUE SECTION */}
        {playbackQueue.length > 0 && (activeTab === 'all' || activeTab === 'queue') && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2.5 min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {isEn ? 'Up Next Queue' : 'Foleni ya Kucheza'}
                </h2>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums shrink-0">
                  {playbackQueue.length} video
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const first = playbackQueue[0];
                    if (first) {
                      removeFromQueue(first.id);
                      onSelectVideo(first);
                    }
                  }}
                  className="text-xs font-bold text-[#FF3040] hover:underline whitespace-nowrap cursor-pointer"
                >
                  {isEn ? 'Play next' : 'Cheza Sasa'}
                </button>
                <button
                  type="button"
                  onClick={clearQueue}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-[#94A3B8] dark:hover:text-red-400 whitespace-nowrap cursor-pointer"
                >
                  {isEn ? 'Clear' : 'Futa zote'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {playbackQueue.map((vid, idx) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    removeFromQueue(vid.id);
                    onSelectVideo(vid);
                  }}
                  className="group flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-slate-300 dark:hover:border-[#343E54] cursor-pointer transition-colors"
                >
                  <span className="text-xs font-mono tabular-nums text-slate-400 w-4 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-[#10131B] shrink-0">
                    <img
                      src={vid.thumbnailUrl || createThumbnailSvgDataUri(vid.title, vid.category)}
                      alt={vid.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = createThumbnailSvgDataUri(
                          vid.title,
                          vid.category
                        );
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#FF3040] transition-colors">
                      {vid.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                      {vid.channelName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(vid.id);
                    }}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 cursor-pointer"
                    title={isEn ? 'Remove from queue' : 'Ondoa kwenye foleni'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* OFFLINE DOWNLOADS */}
        {(activeTab === 'offline' || (activeTab === 'all' && offlineDownloads.length > 0)) && (
          <section className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Offline Downloads' : 'Video Zilizopakuliwa'}
                </h2>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums">
                  {offlineDownloads.length} video · {totalOfflineMB} MB
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickDownloadPicker(true)}
                  className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-[#16C784]/15 dark:hover:bg-[#16C784]/25 text-emerald-700 dark:text-[#16C784] text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Download video' : '+ Pakua Video'}</span>
                </button>
                {activeTab === 'all' && offlineDownloads.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('offline')}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                  >
                    <span>{t.viewAll}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {offlineDownloads.length === 0
              ? renderFocusedEmptyState(
                  WifiOff,
                  isEn ? 'No offline videos yet' : 'Bado haujapakua video yoyote',
                  isEn
                    ? 'Pick any video right here or use the three-dot menu to watch offline without mobile data.'
                    : 'Chagua video ya kupakua sasa hivi hapa au bofya nukta tatu (•••) kwenye video yoyote uitazame bila intaneti.',
                  isEn ? 'Choose video to download' : 'Pakua Video Sasa',
                  () => setShowQuickDownloadPicker(true),
                  isEn ? 'Browse home' : 'Gundua Nyumbani',
                  () => onNavigate?.('home')
                )
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  {(activeTab === 'all' ? offlineDownloads.slice(0, 6) : offlineDownloads).map(
                    (dl) => (
                      <div
                        key={dl.videoId}
                        className="group rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-slate-300 dark:hover:border-[#343E54] overflow-hidden transition-colors flex flex-row sm:flex-col items-center sm:items-stretch p-2 sm:p-0 gap-3 sm:gap-0"
                      >
                        <div
                          onClick={() => onSelectVideo(dl.video)}
                          className="relative w-32 sm:w-full aspect-video rounded-xl sm:rounded-none bg-slate-950 cursor-pointer overflow-hidden shrink-0"
                        >
                          <img
                            src={
                              dl.video.thumbnailUrl ||
                              createThumbnailSvgDataUri(dl.video.title, dl.video.category)
                            }
                            alt={dl.video.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                createThumbnailSvgDataUri(dl.video.title, dl.video.category);
                            }}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                          />
                          <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                          <span className="hidden sm:inline-block absolute bottom-2.5 left-2.5 text-[11px] font-semibold text-white/95">
                            {dl.quality || '720p'} · {isEn ? 'Ready offline' : 'Nje ya Mtandao'}
                          </span>
                          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow">
                            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 ml-0.5" />
                          </div>
                        </div>

                        <div className="sm:p-3.5 flex-1 min-w-0 flex sm:flex-col items-center sm:items-stretch justify-between gap-2 sm:gap-3">
                          <div className="min-w-0 flex-1">
                            <h3
                              onClick={() => onSelectVideo(dl.video)}
                              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#FF3040] cursor-pointer transition-colors"
                            >
                              {dl.video.title}
                            </h3>
                            <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1 font-mono tabular-nums truncate">
                              <span className="font-sans font-medium text-slate-600 dark:text-[#CBD5E1]">
                                {dl.video.channelName}
                              </span>{' '}
                              · {(dl.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:pt-2.5 sm:border-t sm:border-slate-100 sm:dark:border-[#222836] shrink-0">
                            <button
                              type="button"
                              onClick={() => onSelectVideo(dl.video)}
                              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-[#16C784] hover:underline cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{isEn ? 'Watch offline' : 'Tazama Sasa'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDownload(dl.videoId)}
                              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                              title={isEn ? 'Delete download' : 'Futa faili'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
          </section>
        )}

        {/* PLAYLISTS */}
        {(activeTab === 'playlists' || (activeTab === 'all' && playlists.length > 0)) && (
          <section className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Your Playlists' : 'Orodha Zangu'}
                </h2>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums">
                  {playlists.length} {isEn ? 'lists' : 'orodha'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF3040] hover:underline whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Create playlist' : 'Unda Orodha'}</span>
                </button>
                {activeTab === 'all' && playlists.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('playlists')}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                  >
                    <span>{t.viewAll}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {playlists.length === 0
              ? renderFocusedEmptyState(
                  ListMusic,
                  isEn ? 'No playlists created yet' : 'Haujatengeneza orodha yoyote bado',
                  isEn
                    ? 'Create playlists to group music mixes, movies, or tutorials in one clean spot.'
                    : 'Tengeneza orodha zako maalum kupanga video, nyimbo au vipindi unavyovipenda.',
                  isEn ? 'Create Playlist' : '+ Unda Orodha Mpya',
                  () => setShowCreatePlaylistModal(true)
                )
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  {(activeTab === 'all' ? playlists.slice(0, 6) : playlists).map((pl) => {
                    const count = pl.videoIds.length;
                    const coverSrc = getPlaylistCoverUrl(pl);
                    const firstVid = pl.videoIds
                      .map((id) => allVideoPool.get(id))
                      .find(Boolean);

                    return (
                      <div key={pl.id} className="group flex flex-col">
                        <div className="hidden sm:block h-1.5 mx-4 rounded-t-md bg-slate-200/90 dark:bg-[#273042] border-x border-t border-slate-200 dark:border-[#2E384D]" />
                        <div className="rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-slate-300 dark:hover:border-[#343E54] overflow-hidden transition-colors flex-1 flex flex-row sm:flex-col items-center sm:items-stretch p-2 sm:p-0 gap-3 sm:gap-0">
                          <div
                            onClick={() => setInspectPlaylistId(pl.id)}
                            className="relative w-32 sm:w-full aspect-video rounded-xl sm:rounded-none bg-slate-950 cursor-pointer overflow-hidden shrink-0"
                          >
                            <img
                              src={coverSrc}
                              alt={pl.title}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  createThumbnailSvgDataUri(pl.title, 'Playlist');
                              }}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent flex items-end justify-between p-2 sm:p-3">
                              <span className="text-[10px] sm:text-[11px] font-bold text-white font-mono tabular-nums inline-flex items-center gap-1">
                                <ListMusic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300" />
                                <span>{count}</span>
                              </span>
                              <span className="hidden sm:inline text-[11px] font-semibold text-white/90">
                                {isEn ? 'Open list' : 'Fungua'}
                              </span>
                            </div>
                          </div>

                          <div className="sm:p-3.5 flex-1 min-w-0 flex sm:flex-col items-center sm:items-stretch justify-between gap-2 sm:gap-3">
                            <div
                              onClick={() => setInspectPlaylistId(pl.id)}
                              className="cursor-pointer min-w-0 flex-1"
                            >
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FF3040] transition-colors">
                                {pl.title}
                              </h3>
                              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                                {pl.description ||
                                  (isEn ? 'Personal playlist' : 'Orodha binafsi ya video')}
                              </p>
                            </div>

                            <div className="flex items-center justify-between sm:pt-2.5 sm:border-t sm:border-slate-100 sm:dark:border-[#222836] shrink-0">
                              <div className="hidden sm:flex items-center gap-3">
                                {firstVid && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const plVids = pl.videoIds
                                        .map((id) => allVideoPool.get(id))
                                        .filter((v): v is VideoItem => Boolean(v));
                                      handlePlayPlaylistAll(plVids);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3040] hover:underline cursor-pointer"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>{isEn ? 'Play all' : 'Cheza'}</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setInspectPlaylistId(pl.id)}
                                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                                >
                                  {count === 0
                                    ? isEn
                                      ? '+ Add videos'
                                      : '+ Ongeza video'
                                    : isEn
                                      ? 'Manage list'
                                      : 'Simamia'}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => deletePlaylist(pl.id)}
                                className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                title={isEn ? 'Delete playlist' : 'Futa orodha'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </section>
        )}

        {/* WATCH HISTORY */}
        {(activeTab === 'history' || (activeTab === 'all' && watchHistory.length > 0)) && (
          <section className="space-y-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.history}
                </h2>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums">
                  {watchHistory.length} video
                </span>
              </div>

              <div className="flex items-center gap-4">
                {watchHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    {isEn ? 'Clear history' : 'Safisha Historia'}
                  </button>
                )}
                {activeTab === 'all' && watchHistory.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                  >
                    <span>{t.viewAll}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {historyClearedNotice && (
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-[#16C784]">
                {isEn
                  ? 'Watch history has been cleared.'
                  : 'Historia yako ya kutazama imefutwa kikamilifu.'}
              </div>
            )}

            {watchHistory.length === 0
              ? renderFocusedEmptyState(
                  Clock,
                  isEn ? 'Your watch history is empty' : 'Hauna historia ya kutazama bado',
                  isEn
                    ? 'Videos you watch on Tazama will appear here so you can easily revisit them.'
                    : 'Video utakazotazama kwenye Tazama zitaonekana hapa ili uweze kuzirejea kwa urahisi.',
                  isEn ? 'Discover Videos' : 'Tazama Video',
                  () => onNavigate?.('home')
                )
              : (
                <>
                  {/* Compact Mobile List */}
                  <div className="flex flex-col gap-2.5 sm:hidden">
                    {(activeTab === 'all' ? watchHistory.slice(0, 6) : watchHistory).map((vid) =>
                      renderMobileVideoRow(
                        vid,
                        <button
                          type="button"
                          onClick={() => removeFromWatchHistory(vid.id)}
                          className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          title={isEn ? 'Remove from history' : 'Ondoa kwenye historia'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>

                  {/* Desktop / Tablet Grid */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === 'all' ? watchHistory.slice(0, 6) : watchHistory).map((vid) => (
                      <div key={vid.id} className="relative group">
                        <VideoCard
                          video={vid}
                          onSelectVideo={onSelectVideo}
                          onSelectChannel={onSelectChannel}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchHistory(vid.id);
                          }}
                          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-[#FF3040] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                          title={isEn ? 'Remove from history' : 'Ondoa kwenye historia'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </section>
        )}

        {/* LIKED VIDEOS */}
        {(activeTab === 'liked' || (activeTab === 'all' && likedVideos.length > 0)) && (
          <section className="space-y-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.likedVideos}
                </h2>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums">
                  {likedVideos.length} video
                </span>
              </div>

              {activeTab === 'all' && likedVideos.length > 6 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('liked')}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                >
                  <span>{t.viewAll}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {likedVideos.length === 0
              ? renderFocusedEmptyState(
                  ThumbsUp,
                  isEn ? 'No liked videos yet' : 'Hauna video uliyoweka Like bado',
                  isEn
                    ? 'Give a thumbs up to videos you love and find them collected neatly here.'
                    : 'Bofya Like kwenye video unazozifurahia ili zihifadhiwe katika mkusanyiko huu.',
                  isEn ? 'Explore Trending' : 'Vinjari Video',
                  () => onNavigate?.('explore')
                )
              : (
                <>
                  {/* Compact Mobile List */}
                  <div className="flex flex-col gap-2.5 sm:hidden">
                    {(activeTab === 'all' ? likedVideos.slice(0, 6) : likedVideos).map((vid) =>
                      renderMobileVideoRow(
                        vid,
                        <button
                          type="button"
                          onClick={() => toggleLike(vid.id)}
                          className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-[#1E2534] dark:hover:bg-red-500/15 text-slate-600 hover:text-red-600 dark:text-[#CBD5E1] dark:hover:text-red-400 text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title={isEn ? 'Remove Like' : 'Ondoa Like'}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>

                  {/* Desktop / Tablet Grid */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === 'all' ? likedVideos.slice(0, 6) : likedVideos).map((vid) => (
                      <div key={vid.id} className="relative group">
                        <VideoCard
                          video={vid}
                          onSelectVideo={onSelectVideo}
                          onSelectChannel={onSelectChannel}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(vid.id);
                          }}
                          className="absolute top-2.5 right-2.5 z-20 px-2.5 h-8 rounded-full bg-black/75 hover:bg-[#FF3040] text-white text-[11px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                          title={isEn ? 'Remove Like' : 'Ondoa Like'}
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>{isEn ? 'Unlike' : 'Ondoa'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </section>
        )}

        {/* SUBSCRIBED CHANNELS & VIDEOS */}
        {(activeTab === 'subscriptions' ||
          (activeTab === 'all' && (subbedVideos.length > 0 || subbedChannels.length > 0))) && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Subscriptions & Channels' : 'Maudhui ya Vituo Unavyofuatilia'}
                </h2>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums">
                  {subbedChannels.length} {isEn ? 'channels' : 'vituo'} · {subbedVideos.length} video
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate?.('channels')}
                  className="text-xs font-bold text-[#FF3040] hover:underline whitespace-nowrap cursor-pointer"
                >
                  {isEn ? 'Browse channels' : 'Chaneli zote'}
                </button>
                {activeTab === 'all' && subbedVideos.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('subscriptions')}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                  >
                    <span>{t.viewAll}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {subbedChannels.length > 0 && activeTab === 'subscriptions' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subbedChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B]"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectChannel(ch.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
                    >
                      <img
                        src={ch.avatarUrl || createAvatarSvgDataUri(ch.name)}
                        alt={ch.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = createAvatarSvgDataUri(ch.name);
                        }}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#2A3244] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FF3040] transition-colors">
                          {ch.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate tabular-nums">
                          {formatViews(ch.subscriberCount || 0, language)}{' '}
                          {isEn ? 'subscribers' : 'wafuatiliaji'}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSubscribe(ch.id)}
                      className="min-h-[34px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 dark:bg-[#1E2534] dark:hover:bg-red-500/15 dark:text-[#CBD5E1] dark:hover:text-red-400 text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Unfollow' : 'Ondoka'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {subbedVideos.length === 0 && subbedChannels.length === 0
              ? renderFocusedEmptyState(
                  Tv,
                  isEn ? 'No channel updates yet' : 'Haujafuata chaneli bado',
                  isEn
                    ? 'Subscribe to Tanzanian creators to see every new release right here.'
                    : 'Jiunge na vituo unavyovipenda ili uone video mpya za waumbaji wako hapa.',
                  isEn ? 'Browse Channels' : 'Fungua Chaneli',
                  () => onNavigate?.('channels')
                )
              : subbedVideos.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  {isEn
                    ? 'Followed channels have not published new videos yet.'
                    : 'Vituo unavyofuatilia bado havijaweka video mpya.'}
                </p>
              ) : (
                <>
                  {/* Compact Mobile List */}
                  <div className="flex flex-col gap-2.5 sm:hidden">
                    {(activeTab === 'all' ? subbedVideos.slice(0, 6) : subbedVideos).map((vid) =>
                      renderMobileVideoRow(vid)
                    )}
                  </div>

                  {/* Desktop / Tablet Grid */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === 'all' ? subbedVideos.slice(0, 6) : subbedVideos).map((vid) => (
                      <VideoCard
                        key={vid.id}
                        video={vid}
                        onSelectVideo={onSelectVideo}
                        onSelectChannel={onSelectChannel}
                      />
                    ))}
                  </div>
                </>
              )}
          </section>
        )}

        {/* COMPACT ACTION DIRECTORY FOR EMPTY SECTIONS ON OVERVIEW TAB */}
        {activeTab === 'all' && emptyOverviewDirectory.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {emptyOverviewDirectory.length === 5
                  ? isEn
                    ? 'Build Your Library'
                    : 'Anza Kujenga Maktaba Yako'
                  : isEn
                    ? 'More Library Collections'
                    : 'Sehemu Zingine za Maktaba'}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                {isEn ? 'Quick actions' : 'Hatua za haraka'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emptyOverviewDirectory.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectMetricOrTab(item.id)}
                    className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-slate-300 dark:hover:border-[#343E54] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1E2534] text-slate-700 dark:text-[#CBD5E1] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onCta();
                      }}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2534] dark:hover:bg-[#273044] text-slate-800 dark:text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      {item.ctaLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* PLAYLIST DETAIL INSPECTOR MODAL (View, Play All, Rename, + Add Videos, Remove) */}
      {inspectedPlaylist && (
        <div
          onClick={() => setInspectPlaylistId(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#242B3B] space-y-3">
              {isEditingPlaylist ? (
                <form onSubmit={handleSavePlaylistEdit} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    value={editPlaylistTitle}
                    onChange={(e) => setEditPlaylistTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B] rounded-xl py-2 px-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF3040]"
                  />
                  <input
                    type="text"
                    value={editPlaylistDesc}
                    onChange={(e) => setEditPlaylistDesc(e.target.value)}
                    placeholder={isEn ? 'Description...' : 'Maelezo mafupi...'}
                    className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B] rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-white/90 focus:outline-none focus:border-[#FF3040]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-[#FF3040] text-white text-xs font-bold cursor-pointer"
                    >
                      {isEn ? 'Save' : 'Hifadhi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPlaylist(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1E2534] text-slate-600 dark:text-[#94A3B8] text-xs font-semibold cursor-pointer"
                    >
                      {isEn ? 'Cancel' : 'Ghairi'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                        {inspectedPlaylist.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsEditingPlaylist(true)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                        title={isEn ? 'Rename playlist' : 'Hariri jina la orodha'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums mt-0.5 truncate">
                      {inspectedPlaylistVideos.length} video
                      {inspectedPlaylist.description ? ` · ${inspectedPlaylist.description}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectPlaylistId(null)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Quick Playlist Actions Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {inspectedPlaylistVideos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePlayPlaylistAll(inspectedPlaylistVideos)}
                    className="inline-flex items-center gap-1.5 min-h-[34px] px-3.5 py-1.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isEn ? 'Play All' : 'Cheza Zote'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAddToPlaylistPicker(!showAddToPlaylistPicker)}
                  className={`inline-flex items-center gap-1.5 min-h-[34px] px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    showAddToPlaylistPicker
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2534] dark:hover:bg-[#273044] text-slate-800 dark:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Add Videos' : 'Ongeza Video'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {showAddToPlaylistPicker && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B] space-y-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inspectorSearch}
                      onChange={(e) => setInspectorSearch(e.target.value)}
                      placeholder={isEn ? 'Search videos to add...' : 'Tafuta video ya kuongeza...'}
                      className="w-full bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF3040]"
                    />
                  </div>
                  {filteredInspectorVideos.length === 0 ? (
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] text-center py-3">
                      {isEn ? 'No matching videos available to add.' : 'Hakuna video nyingine zinazolingana.'}
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {filteredInspectorVideos.map((vid) => (
                        <div
                          key={vid.id}
                          onClick={() => addToPlaylist(inspectedPlaylist.id, vid.id)}
                          className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-[#191F2C] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={vid.thumbnailUrl || createThumbnailSvgDataUri(vid.title, vid.category)}
                              alt={vid.title}
                              referrerPolicy="no-referrer"
                              className="w-14 aspect-video rounded-md object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {vid.title}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] truncate">
                                {vid.channelName}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-[#FF3040]/10 text-[#FF3040] text-[11px] font-bold shrink-0">
                            + {isEn ? 'Add' : 'Ongeza'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {inspectedPlaylistVideos.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <ListMusic className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                    {isEn
                      ? 'This playlist has no videos yet. Tap Add Videos above to pick favorites.'
                      : 'Orodha hii haina video bado. Bonyeza "Ongeza Video" hapo juu kuchagua video.'}
                  </p>
                </div>
              ) : (
                inspectedPlaylistVideos.map((vid, idx) => (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setInspectPlaylistId(null);
                      onSelectVideo(vid);
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1E2534] transition-colors cursor-pointer group"
                  >
                    <span className="text-xs font-mono tabular-nums text-slate-400 w-4 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={
                        vid.thumbnailUrl || createThumbnailSvgDataUri(vid.title, vid.category)
                      }
                      alt={vid.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = createThumbnailSvgDataUri(
                          vid.title,
                          vid.category
                        );
                      }}
                      className="w-24 aspect-video rounded-lg object-cover shrink-0 bg-slate-200 dark:bg-[#10131B]"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#FF3040] transition-colors">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                        {vid.channelName} · {formatViews(vid.viewsCount, language)} ·{' '}
                        {formatRelativeTime(vid.createdAt, language)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPlaylist(inspectedPlaylist.id, vid.id);
                      }}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0 cursor-pointer"
                      title={isEn ? 'Remove from playlist' : 'Ondoa kwenye orodha'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE PLAYLIST MODAL (Includes optional initial video picker!) */}
      {showCreatePlaylistModal && (
        <div
          onClick={() => setShowCreatePlaylistModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#242B3B] shrink-0">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#FF3040]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Create New Playlist' : 'Tengeneza Orodha Mpya'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePlaylistModal(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4 overflow-y-auto pr-0.5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/90 mb-1.5">
                  {isEn ? 'Playlist Name' : 'Jina la Orodha'}
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder={
                    isEn
                      ? 'e.g. Weekend Mix, Documentaries...'
                      : 'Mfano: Bongo Flava Kali 2026, Vichekesho...'
                  }
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#FF3040]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/90 mb-1.5">
                  {isEn ? 'Description (optional)' : 'Maelezo Mafupi (Hiari)'}
                </label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder={
                    isEn ? 'What is inside this collection...' : 'Orodha ya nyimbo na video ninazozipenda...'
                  }
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B] rounded-xl py-2 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#FF3040] resize-none"
                />
              </div>

              {/* Optional Initial Videos Picker */}
              {allVideoList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-white/90">
                      {isEn ? 'Add Videos Now (Optional)' : 'Chagua Video za Kuweka (Hiari)'}
                    </label>
                    {selectedInitialVideoIds.length > 0 && (
                      <span className="text-[11px] font-bold text-[#FF3040] font-mono">
                        {selectedInitialVideoIds.length} {isEn ? 'selected' : 'zimechaguliwa'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={createPickerSearch}
                      onChange={(e) => setCreatePickerSearch(e.target.value)}
                      placeholder={isEn ? 'Filter videos...' : 'Tafuta video...'}
                      className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B] rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF3040]"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 p-1.5 rounded-xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B]">
                    {filteredCreateVideos.map((vid) => {
                      const isPicked = selectedInitialVideoIds.includes(vid.id);
                      return (
                        <button
                          key={vid.id}
                          type="button"
                          onClick={() => handleToggleInitialVideo(vid.id)}
                          className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            isPicked
                              ? 'bg-[#FF3040]/10 dark:bg-[#FF3040]/20'
                              : 'hover:bg-white dark:hover:bg-[#191F2C]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              isPicked
                                ? 'bg-[#FF3040] border-[#FF3040] text-white'
                                : 'border-slate-300 dark:border-[#343E54]'
                            }`}
                          >
                            {isPicked && <Check className="w-3 h-3" />}
                          </div>
                          <img
                            src={vid.thumbnailUrl || createThumbnailSvgDataUri(vid.title, vid.category)}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-10 aspect-video rounded object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                              {vid.title}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] truncate">
                              {vid.channelName}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="min-h-[42px] py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#242B3B] text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Ghairi'}
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistTitle.trim()}
                  className="min-h-[42px] py-2.5 px-4 rounded-xl bg-[#FF3040] hover:bg-[#E02635] disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  {isEn ? 'Create Playlist' : 'Hifadhi Orodha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK OFFLINE DOWNLOAD VIDEO PICKER MODAL */}
      {showQuickDownloadPicker && (
        <div
          onClick={() => setShowQuickDownloadPicker(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#242B3B] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-[#16C784] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {isEn ? 'Download Videos for Offline' : 'Pakua Video Nje ya Mtandao'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    {isEn
                      ? 'Pick any video to save into your Offline Library'
                      : 'Chagua video yoyote uhifadhi kwenye Maktaba ya Nje ya Mtandao'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickDownloadPicker(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-[#222836]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={downloadPickerSearch}
                  onChange={(e) => setDownloadPickerSearch(e.target.value)}
                  placeholder={isEn ? 'Search videos...' : 'Tafuta video ya kupakua...'}
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B] rounded-xl py-2 pl-9 pr-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#16C784]"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredQuickDownloadVideos.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                    {isEn ? 'No matching videos found.' : 'Hakuna video zilizopatikana.'}
                  </p>
                </div>
              ) : (
                filteredQuickDownloadVideos.map((vid) => {
                  const downloaded = isDownloaded(vid.id);
                  return (
                    <div
                      key={vid.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#242B3B]"
                    >
                      <div
                        onClick={() => {
                          setShowQuickDownloadPicker(false);
                          onSelectVideo(vid);
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <img
                          src={vid.thumbnailUrl || createThumbnailSvgDataUri(vid.title, vid.category)}
                          alt={vid.title}
                          referrerPolicy="no-referrer"
                          className="w-20 aspect-video rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-[#191F2C]"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                            {vid.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                            {vid.channelName}
                          </p>
                        </div>
                      </div>

                      {downloaded ? (
                        <button
                          type="button"
                          onClick={() => removeDownload(vid.id)}
                          className="min-h-[34px] px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-[#16C784]/20 dark:text-[#16C784] text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Saved' : 'Imepakuliwa'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickDownloadPicker(false);
                            setDownloadModalVideo(vid);
                          }}
                          className="min-h-[34px] px-3 py-1.5 rounded-xl bg-[#16C784] hover:bg-[#13A76E] text-black text-[11px] font-extrabold shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Download' : 'Pakua'}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUALITY-CHOICE DOWNLOAD MODAL WHEN TRIGGERED FROM LIBRARY */}
      {downloadModalVideo && (
        <VideoDownloadModal
          isOpen={Boolean(downloadModalVideo)}
          onClose={() => setDownloadModalVideo(null)}
          video={downloadModalVideo}
          onGoToLibrary={() => {
            setDownloadModalVideo(null);
            setActiveTab('offline');
          }}
        />
      )}
    </div>
  );
};
