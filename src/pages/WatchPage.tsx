import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  Flag, 
  Gift, 
  Award, 
  CheckCircle2, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { VideoItem } from '../types';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoCard } from '../components/video/VideoCard';
import { GiftModal } from '../components/gifts/GiftModal';
import { MembershipModal } from '../components/membership/MembershipModal';
import { ReportModal } from '../components/modals/ReportModal';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatRelativeTime, formatTZS, translations } from '../lib/i18n';

interface WatchPageProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onOpenWallet: () => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  onSelectVideo,
  onSelectChannel,
  onOpenWallet
}) => {
  const { 
    videos, 
    userSubscriptions, 
    toggleSubscribe, 
    likedVideoIds, 
    toggleLike, 
    comments, 
    addComment 
  } = useVideo();
  
  const { profile, language } = useAuth();
  const t = translations[language];

  const [commentText, setCommentText] = useState<string>('');
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [showMembershipModal, setShowMembershipModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const isSubscribed = userSubscriptions.includes(video.channelId);
  const isLiked = likedVideoIds.includes(video.id);
  const videoComments = comments[video.id] || [];
  const relatedVideos = videos.filter(v => v.id !== video.id).slice(0, 8);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(video.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-20">
      
      {/* Left / Main Column: Player, Video info, Comments */}
      <div className="flex-1 min-w-0">
        
        {/* Adaptive Player */}
        <VideoPlayer video={video} autoPlay={true} />

        {/* Video Title */}
        <h1 className="mt-4 text-base sm:text-xl font-bold text-white leading-tight">
          {video.title}
        </h1>

        {/* Channel & Actions Row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262E3E]">
          
          {/* Creator Channel */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectChannel(video.channelId)}
              className="focus:outline-none"
            >
              <img
                src={video.channelAvatar}
                alt={video.channelName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#262E3E]"
              />
            </button>

            <div>
              <button 
                onClick={() => onSelectChannel(video.channelId)}
                className="text-sm font-bold text-white hover:text-[#FF3040] flex items-center gap-1.5 focus:outline-none text-left"
              >
                <span>{video.channelName}</span>
                {video.isChannelVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16C784]" />
                )}
              </button>
              <p className="text-xs text-[#A7B0C0] font-mono">
                1.4M {t.subscribers}
              </p>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={() => toggleSubscribe(video.channelId)}
              className={`ml-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isSubscribed
                  ? 'bg-[#232A39] text-[#A7B0C0] hover:text-white'
                  : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-md shadow-[#FF3040]/30'
              }`}
            >
              {isSubscribed ? t.subscribed : t.subscribe}
            </button>

            {/* Join VIP Membership Button */}
            <button
              onClick={() => setShowMembershipModal(true)}
              className="hidden sm:flex items-center gap-1 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-500/30 hover:from-amber-500/30 hover:to-amber-500/40 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t.join}</span>
            </button>
          </div>

          {/* Video Reaction & Gifting Actions */}
          <div className="flex items-center gap-2 overflow-x-auto">
            
            {/* Like & Dislike Pills */}
            <div className="flex items-center bg-[#191E29] border border-[#262E3E] rounded-full overflow-hidden">
              <button
                onClick={() => toggleLike(video.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold hover:bg-[#232A39] transition-colors ${
                  isLiked ? 'text-[#FF3040]' : 'text-[#A7B0C0]'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#FF3040]' : ''}`} />
                <span>{formatViews(video.likesCount, language)}</span>
              </button>
              <div className="w-[1px] h-4 bg-[#262E3E]" />
              <button
                className="px-3 py-2 text-xs text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
                title="Sipendi"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Virtual Gift Button */}
            <button
              onClick={() => setShowGiftModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#16C784]/20 to-[#10B981]/20 hover:from-[#16C784]/30 hover:to-[#10B981]/30 text-[#16C784] border border-[#16C784]/40 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-md shadow-[#16C784]/10"
            >
              <Gift className="w-4 h-4" />
              <span>{t.sendGift}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-white px-3 py-2 rounded-full text-xs font-semibold transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-[#16C784]" /> : <Share2 className="w-4 h-4 text-[#A7B0C0]" />}
              <span>{isCopied ? 'Imenakiliwa!' : t.share}</span>
            </button>

            {/* Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-full bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-[#A7B0C0] hover:text-red-400 transition-colors"
              title={t.report}
            >
              <Flag className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Video Description Box */}
        <div className="mt-4 p-4 rounded-2xl bg-[#191E29] border border-[#262E3E] text-xs">
          <div className="flex items-center gap-3 text-xs font-semibold text-white mb-2">
            <span>{formatViews(video.viewsCount, language)} {t.viewsPlural}</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt, language)}</span>
            <span className="text-[#16C784] font-medium ml-auto">#{video.category}</span>
          </div>

          <p className={`text-[#A7B0C0] leading-relaxed whitespace-pre-line ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
            {video.description}
          </p>

          {video.tags && video.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {video.tags.map((tag, i) => (
                <span key={i} className="text-[#FF3040] hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="mt-2 flex items-center gap-1 font-bold text-white hover:text-[#FF3040] transition-colors"
          >
            <span>{isDescExpanded ? 'Ficha maelezo' : 'Soma zaidi'}</span>
            {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-bold text-white">{t.commentsTitle}</h3>
            <span className="text-xs font-mono text-[#A7B0C0]">({videoComments.length})</span>
          </div>

          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <img
              src={profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={profile?.displayName || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-[#262E3E]"
            />
            <div className="flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t.writeComment}
                className="w-full bg-[#191E29] border border-[#262E3E] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#FF3040]"
              />
              {commentText.trim() && (
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCommentText('')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A7B0C0] hover:text-white"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#FF3040] text-white text-xs font-bold shadow-md hover:bg-[#E02635]"
                  >
                    {t.postComment}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {videoComments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <img
                  src={c.userAvatar}
                  alt={c.userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.userName}</span>
                    <span className="text-[11px] text-[#A7B0C0]">{formatRelativeTime(c.createdAt, language)}</span>
                  </div>
                  <p className="mt-1 text-[#A7B0C0] leading-relaxed">{c.text}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[#A7B0C0]">
                    <button className="flex items-center gap-1 hover:text-white">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{c.likesCount > 0 ? c.likesCount : ''}</span>
                    </button>
                    <button className="hover:text-white font-semibold">Jibu (Reply)</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Right Column: Related Videos */}
      <div className="w-full lg:w-80 shrink-0 space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">{t.relatedVideos}</h3>
        <div className="space-y-3">
          {relatedVideos.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectVideo(item)}
              className="flex gap-2.5 group cursor-pointer"
            >
              <div className="relative w-36 aspect-video-player rounded-xl overflow-hidden bg-[#191E29] shrink-0 border border-[#262E3E]">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white line-clamp-2 leading-tight group-hover:text-[#FF3040]">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#A7B0C0] mt-1 truncate">{item.channelName}</p>
                <p className="text-[10px] text-[#A7B0C0]">
                  {formatViews(item.viewsCount, language)} • {formatRelativeTime(item.createdAt, language)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <GiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        videoId={video.id}
        channelId={video.channelId}
        channelName={video.channelName}
        onOpenWallet={onOpenWallet}
      />

      <MembershipModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        channelId={video.channelId}
        channelName={video.channelName}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="video"
        targetId={video.id}
        targetTitle={video.title}
      />

    </div>
  );
};
