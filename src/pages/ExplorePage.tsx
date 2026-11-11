import React, { useState } from 'react';
import { 
  ChevronLeft, 
  MoreVertical, 
  Search, 
  SlidersHorizontal, 
  Flame, 
  Music, 
  Gamepad2, 
  GraduationCap, 
  Newspaper,
  CheckCircle2
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoItem } from '../types';
import { formatViews, formatRelativeTime } from '../lib/i18n';
import { VideoThumbnailPreview } from '../components/video/VideoThumbnailPreview';
import { VideoActionsMenu } from '../components/video/VideoActionsMenu';

interface ExplorePageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onNavigateHome: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectVideo,
  onSelectChannel,
  onNavigateHome,
}) => {
  const { videos, notInterestedIds, hiddenChannelIds } = useVideo();
  const { language } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('trend');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'date'>('views');

  const categories = [
    { id: 'trend', label: 'Trend', icon: Flame },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'learning', label: 'Learning', icon: GraduationCap },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  // Filter & sort
  let filtered = (videos || []).filter((v) =>
    Boolean(v && v.id && !notInterestedIds.includes(v.id) && !hiddenChannelIds.includes(v.channelId))
  );

  if (activeCategory === 'music') {
    filtered = filtered.filter(v => v && v.category === 'Muziki');
  } else if (activeCategory === 'gaming') {
    filtered = filtered.filter(v => v && (v.category === 'Teknolojia' || v.category === 'Burudani'));
  } else if (activeCategory === 'learning') {
    filtered = filtered.filter(v => v && v.category === 'Elimu');
  } else if (activeCategory === 'news') {
    filtered = filtered.filter(v => v && v.category === 'Habari');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(v => 
      v && (
        v.title?.toLowerCase().includes(q) || 
        v.channelName?.toLowerCase().includes(q)
      )
    );
  }

  if (sortBy === 'views') {
    filtered.sort((a, b) => (b?.viewsCount || 0) - (a?.viewsCount || 0));
  } else {
    filtered.sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
  }

  return (
    <div className="space-y-4 pb-8 select-none max-w-4xl mx-auto">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <button
          onClick={onNavigateHome}
          className="p-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors"
          title="Rudi Mwanzo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
          Explore
        </h1>

        <button 
          className="p-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors"
          title="Chaguo zaidi"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search Bar with Filter Icon */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 dark:text-[#A7B0C0] absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-white dark:bg-[#181C26] border border-slate-200 dark:border-[#262E3E] rounded-2xl py-2.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0]/60 shadow-sm dark:shadow-none focus:outline-none focus:border-[#FF3040] transition-colors"
          />
        </div>

        <button 
          onClick={() => setSortBy(sortBy === 'views' ? 'date' : 'views')}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#181C26] border border-slate-200 dark:border-[#262E3E] hover:border-[#FF3040] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white shadow-sm dark:shadow-none transition-colors shrink-0"
          title="Chuja matokeo"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Category Icons Tab Bar with Red Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#262E3E]/60 pb-1 overflow-x-auto no-scrollbar gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 pb-2 min-w-[60px] shrink-0 whitespace-nowrap relative transition-colors cursor-pointer"
            >
              <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${
                isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF3040]' : 'text-slate-500 dark:text-[#A7B0C0]'}`} />
                <span>{cat.label}</span>
              </div>

              {/* Red active indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#FF3040] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Filter Dropdown Chips */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#A7B0C0] pt-1 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Date :</span>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">News</option>
            <option value="today" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">Today</option>
            <option value="week" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">This week</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <span>Sort by :</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="views" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">Most views</option>
            <option value="date" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">Latest</option>
          </select>
        </div>
      </div>

      {/* 5. Video Feed Cards */}
      <div className="space-y-4 pt-2">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-600 dark:text-[#A7B0C0] bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-6 space-y-2 shadow-sm dark:shadow-none">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Hakuna video zilizopatikana kwenye Explore</p>
            <p className="text-xs">Bado hakuna video zilizochapishwa. Video zitakazopakiwa na watumiaji zitaonekana hapa.</p>
          </div>
        ) : (
          filtered.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="flex gap-3 group cursor-pointer p-2.5 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] hover:border-[#FF3040]/40 shadow-sm dark:shadow-none transition-colors"
            >
              {/* Responsive Thumbnail with Dynamic Animated Gradient Border */}
              <div className="w-36 sm:w-48 shrink-0">
                <VideoThumbnailPreview
                  video={video}
                  onSelectVideo={onSelectVideo}
                  aspectRatioClass="aspect-video"
                  compactMobile
                  className="rounded-xl"
                />
              </div>

              {/* Video Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-[#FF3040] transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] mt-1 truncate">
                    {video.channelName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-[#A7B0C0] mt-0.5">
                    {formatViews(video.viewsCount, language)} • {formatRelativeTime(video.createdAt, language)}
                  </p>
                </div>

                <div className="flex justify-end">
                  <VideoActionsMenu
                    video={video}
                    onSelectVideo={onSelectVideo}
                    onSelectChannel={onSelectChannel}
                    variant="vertical"
                  />
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
