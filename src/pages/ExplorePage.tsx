import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Flame,
  Music,
  Film,
  GraduationCap,
  Newspaper,
  Laugh,
  RotateCcw,
  Users,
  ArrowUpDown,
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoItem } from '../types';
import { VideoCard } from '../components/video/VideoCard';

interface ExplorePageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onNavigateHome: () => void;
  onNavigate?: (page: string) => void;
  initialCategory?: string;
  tabRequestKey?: number;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectVideo,
  onSelectChannel,
  onNavigateHome,
  onNavigate,
  initialCategory = 'trend',
  tabRequestKey = 0,
}) => {
  const { videos, shorts, notInterestedIds, hiddenChannelIds } = useVideo();
  const { language } = useAuth();
  const isEn = language === 'en';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'views' | 'date'>('views');
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveCategory(initialCategory);
    if (initialCategory === 'trend') {
      setSortBy('views');
    }
  }, [initialCategory, tabRequestKey]);

  useEffect(() => {
    if (!showMoreMenu) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showMoreMenu]);

  const categories = [
    { id: 'trend', label: isEn ? 'Trending' : 'Zinazovuma', icon: Flame },
    { id: 'entertainment', label: isEn ? 'Entertainment' : 'Burudani', icon: Film },
    { id: 'music', label: isEn ? 'Music' : 'Muziki', icon: Music },
    { id: 'comedy', label: isEn ? 'Comedy' : 'Vichekesho', icon: Laugh },
    { id: 'learning', label: isEn ? 'Education' : 'Elimu', icon: GraduationCap },
    { id: 'news', label: isEn ? 'News' : 'Habari', icon: Newspaper },
  ];

  const resetFilters = () => {
    setActiveCategory('trend');
    setSearchQuery('');
    setDateFilter('all');
    setSortBy('views');
    setShowMoreMenu(false);
  };

  const filtered = useMemo(() => {
    const combined: VideoItem[] = [
      ...(videos || []),
      ...(shorts || []).map((s) => ({ ...s, isShort: true })),
    ];

    const nowMs = Date.now();
    const dateLimitMs =
      dateFilter === 'today'
        ? 24 * 3600 * 1000
        : dateFilter === 'week'
          ? 7 * 24 * 3600 * 1000
          : dateFilter === 'month'
            ? 30 * 24 * 3600 * 1000
            : null;

    let result = combined.filter((v) => {
      if (!v || !v.id) return false;
      if (notInterestedIds.includes(v.id) || hiddenChannelIds.includes(v.channelId)) {
        return false;
      }

      if (activeCategory === 'music' && v.category !== 'Muziki') return false;
      if (
        activeCategory === 'entertainment' &&
        v.category !== 'Burudani' &&
        v.category !== 'Filamu' &&
        v.category !== 'Michezo' &&
        v.category !== 'Teknolojia'
      ) {
        return false;
      }
      if (activeCategory === 'comedy' && v.category !== 'Vichekesho') return false;
      if (activeCategory === 'learning' && v.category !== 'Elimu') return false;
      if (activeCategory === 'news' && v.category !== 'Habari') return false;

      if (dateLimitMs !== null) {
        const createdMs = new Date(v.createdAt || 0).getTime();
        if (isNaN(createdMs) || nowMs - createdMs > dateLimitMs) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = v.title?.toLowerCase().includes(q);
        const matchChannel = v.channelName?.toLowerCase().includes(q);
        const matchTag = (v.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchChannel && !matchTag) return false;
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'views') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      return (
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    });

    return result;
  }, [
    videos,
    shorts,
    notInterestedIds,
    hiddenChannelIds,
    activeCategory,
    dateFilter,
    searchQuery,
    sortBy,
  ]);

  const hasActiveFilters =
    activeCategory !== 'trend' ||
    searchQuery.trim().length > 0 ||
    dateFilter !== 'all' ||
    sortBy !== 'views';

  return (
    <div className="space-y-5 pb-10 select-none max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-1 pb-2 border-b border-slate-200 dark:border-[#242B3B]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200/70 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors shrink-0 cursor-pointer"
            title={isEn ? 'Back Home' : 'Rudi Mwanzo'}
            aria-label={isEn ? 'Back Home' : 'Rudi Mwanzo'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {activeCategory === 'trend'
                ? isEn
                  ? 'Explore & Trending'
                  : 'Gundua & Zinazovuma'
                : isEn
                  ? 'Explore Tazama'
                  : 'Gundua Maudhui'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] truncate">
              {filtered.length} {isEn ? 'videos found' : 'video zilizopatikana'}
            </p>
          </div>
        </div>

        {/* Functional Quick Options Menu */}
        <div ref={moreMenuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200/70 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors cursor-pointer"
            title={isEn ? 'More options' : 'Chaguo zaidi'}
            aria-label={isEn ? 'More options' : 'Chaguo zaidi'}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-2xl shadow-xl p-1.5 z-40 text-xs animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setSortBy((prev) => (prev === 'views' ? 'date' : 'views'));
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#232A39] text-slate-800 dark:text-white font-semibold flex items-center gap-2 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FF3040]" />
                <span>
                  {sortBy === 'views'
                    ? isEn
                      ? 'Sort by Latest'
                      : 'Panga kwa Mpya zaidi'
                    : isEn
                      ? 'Sort by Most Viewed'
                      : 'Panga kwa Zinazotazamwa'}
                </span>
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#232A39] text-slate-800 dark:text-white font-semibold flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />
                <span>{isEn ? 'Reset All Filters' : 'Ondoa Vichujio Vyote'}</span>
              </button>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onNavigate('channels');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#232A39] text-slate-800 dark:text-white font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{isEn ? 'Browse All Channels' : 'Vinjari Vituo Vyote'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Search & Quick Sort Bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 relative flex items-center min-w-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-[#A7B0C0] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEn
                ? 'Search videos, creators or tags...'
                : 'Tafuta video, kituo au lebo...'
            }
            className="w-full bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0]/60 shadow-sm dark:shadow-none focus:outline-none focus:border-[#FF3040] transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setSortBy(sortBy === 'views' ? 'date' : 'views')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-[#FF3040] text-slate-700 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-white shadow-sm dark:shadow-none transition-colors shrink-0 whitespace-nowrap text-xs font-bold cursor-pointer"
          title={isEn ? 'Toggle sort order' : 'Badili mpangilio'}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#FF3040]" />
          <span className="hidden sm:inline">
            {sortBy === 'views'
              ? isEn
                ? 'Most Viewed'
                : 'Maarufu'
              : isEn
                ? 'Latest'
                : 'Mpya'}
          </span>
        </button>
      </div>

      {/* 3. Category Tabs with Clean Red Underline */}
      <div className="flex items-center justify-start sm:justify-between border-b border-slate-200 dark:border-[#242B3B] overflow-x-auto no-scrollbar gap-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 pb-2.5 shrink-0 whitespace-nowrap relative transition-colors cursor-pointer"
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#FF3040]' : 'text-slate-500 dark:text-[#94A3B8]'
                }`}
              />
              <span
                className={`text-xs sm:text-sm ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white font-semibold'
                }`}
              >
                {cat.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3040] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Filter Selectors Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-[#94A3B8]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span>{isEn ? 'Uploaded:' : 'Muda:'}</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
                {isEn ? 'Any time' : 'Wakati wote'}
              </option>
              <option value="today" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
                {isEn ? 'Today' : 'Leo (Saa 24)'}
              </option>
              <option value="week" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
                {isEn ? 'This week' : 'Wiki hii (Siku 7)'}
              </option>
              <option value="month" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
                {isEn ? 'This month' : 'Mwezi huu'}
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <span>{isEn ? 'Sort:' : 'Panga:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'views' | 'date')}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="views" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
                {isEn ? 'Most views' : 'Matazamio mengi'}
              </option>
              <option value="date" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
                {isEn ? 'Latest uploads' : 'Mpya zaidi'}
              </option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#FF3040] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isEn ? 'Reset filters' : 'Ondoa vichujio'}</span>
          </button>
        )}
      </div>

      {/* 5. Responsive Modern Video Grid */}
      {filtered.length === 0 ? (
        <div className="py-14 px-5 text-center text-slate-600 dark:text-[#94A3B8] bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-2xl max-w-xl mx-auto space-y-3 shadow-sm dark:shadow-none">
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {isEn
              ? 'No matching videos found in Explore'
              : 'Hakuna video zilizopatikana kwa vichujio hivi'}
          </p>
          <p className="text-xs leading-relaxed">
            {hasActiveFilters
              ? isEn
                ? 'Try clearing your search, time window, or category filter to view all available content.'
                : 'Jaribu kuondoa vichujio vya muda au neno la utafutaji ili uone video zote.'
              : isEn
                ? 'Videos published by Tanzanian creators will appear here automatically.'
                : 'Video zitakazochapishwa na waumbaji wa Tazama zitaonekana hapa.'}
          </p>
          {hasActiveFilters && (
            <div className="pt-1">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                {isEn ? 'Reset Filters' : 'Onyesha Video Zote'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelectVideo={onSelectVideo}
              onSelectChannel={onSelectChannel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
