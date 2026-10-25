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
  Play,
  CheckCircle2
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoItem } from '../types';
import { formatViews, formatRelativeTime } from '../lib/i18n';

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
  const { videos } = useVideo();
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
  let filtered = [...videos];

  if (activeCategory === 'music') {
    filtered = filtered.filter(v => v.category === 'Muziki');
  } else if (activeCategory === 'gaming') {
    filtered = filtered.filter(v => v.category === 'Teknolojia' || v.category === 'Burudani');
  } else if (activeCategory === 'learning') {
    filtered = filtered.filter(v => v.category === 'Elimu');
  } else if (activeCategory === 'news') {
    filtered = filtered.filter(v => v.category === 'Habari');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(v => 
      v.title.toLowerCase().includes(q) || 
      v.channelName.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'views') {
    filtered.sort((a, b) => b.viewsCount - a.viewsCount);
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="space-y-4 pb-20 select-none max-w-2xl mx-auto">
      
      {/* 1. Header (Matching Screenshot 5 & 6) */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <button
          onClick={onNavigateHome}
          className="p-1.5 rounded-full hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors"
          title="Rudi Mwanzo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
          Explore
        </h1>

        <button 
          className="p-1.5 rounded-full hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors"
          title="Chaguo zaidi"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search Bar with Filter Icon (Matching Screenshot 5 & 6) */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-5 h-5 text-[#A7B0C0] absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#181C26] border border-[#262E3E] rounded-2xl py-2.5 pl-11 pr-4 text-xs sm:text-sm text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#FF3040] transition-colors"
          />
        </div>

        <button 
          onClick={() => setSortBy(sortBy === 'views' ? 'date' : 'views')}
          className="p-2.5 rounded-2xl bg-[#181C26] border border-[#262E3E] hover:border-[#FF3040] text-[#A7B0C0] hover:text-white transition-colors shrink-0"
          title="Chuja matokeo"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Category Icons Tab Bar with Red Indicator (Matching Screenshot 5 & 6) */}
      <div className="flex items-center justify-between border-b border-[#262E3E]/60 pb-1 overflow-x-auto no-scrollbar gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 pb-2 min-w-[56px] relative transition-colors"
            >
              <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${
                isActive ? 'text-white font-bold' : 'text-[#A7B0C0] hover:text-white'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF3040]' : 'text-[#A7B0C0]'}`} />
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

      {/* 4. Filter Dropdown Chips (Matching Screenshot 5 & 6: "Date : News v", "Sort by : Most views v") */}
      <div className="flex items-center justify-between text-xs text-[#A7B0C0] pt-1 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Date :</span>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#191E29] text-white">News</option>
            <option value="today" className="bg-[#191E29] text-white">Today</option>
            <option value="week" className="bg-[#191E29] text-white">This week</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <span>Sort by :</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="views" className="bg-[#191E29] text-white">Most views</option>
            <option value="date" className="bg-[#191E29] text-white">Latest</option>
          </select>
        </div>
      </div>

      {/* 5. Video Feed Cards (Matching Screenshot 5 & 6) */}
      <div className="space-y-4 pt-2">
        {filtered.map((video) => (
          <div
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className="flex gap-3 group cursor-pointer p-2 rounded-2xl hover:bg-[#191E29]/50 transition-colors"
          >
            {/* Thumbnail with Corner Play Badge */}
            <div className="relative w-40 sm:w-48 aspect-video rounded-2xl overflow-hidden bg-[#181C26] border border-[#262E3E] shrink-0">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Corner Play Badge (Matching Screenshot 5 & 6) */}
              <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-lg shadow-[#FF3040]/40">
                <Play className="w-3 h-3 fill-white ml-0.5" />
              </div>
            </div>

            {/* Video Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-[#FF3040] transition-colors">
                  {video.title}
                </h3>
                <p className="text-[11px] text-[#A7B0C0] mt-1 truncate">
                  {video.channelName}
                </p>
                <p className="text-[10px] text-[#A7B0C0] mt-0.5">
                  {formatViews(video.viewsCount, language)} • {formatRelativeTime(video.createdAt, language)}
                </p>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1 text-[#A7B0C0] hover:text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
