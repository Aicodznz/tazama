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
  ChevronDown, 
  ChevronUp,
  Check,
  Bell,
  Settings,
  Download,
  Play
} from 'lucide-react';
import { VideoItem } from '../types';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { GiftModal } from '../components/gifts/GiftModal';
import { MembershipModal } from '../components/membership/MembershipModal';
import { ReportModal } from '../components/modals/ReportModal';
import { VideoDownloadModal } from '../components/modals/VideoDownloadModal';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatRelativeTime, translations } from '../lib/i18n';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';

interface WatchPageProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onOpenWallet: () => void;
  onMinimize?: () => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  onSelectVideo,
  onSelectChannel,
  onOpenWallet,
  onMinimize
}) => {
  const { 
    videos, 
    userSubscriptions, 
    toggleSubscribe, 
    likedVideoIds, 
    toggleLike, 
    comments, 
    addComment,
    downloadVideo,
    removeDownload,
    isDownloaded,
    setMiniPlayerVideo,
    isDataSaver,
    playlists,
    addToPlaylist
  } = useVideo();
  
  const { profile, language } = useAuth();
  const t = translations[language];

  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [showMembershipModal, setShowMembershipModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [hasNotificationBell, setHasNotificationBell] = useState<boolean>(true);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const isDownloadedAlready = isDownloaded(video.id);

  const handleToggleDownload = () => {
    setShowDownloadModal(true);
  };

  const handleMinimize = () => {
    setMiniPlayerVideo(video);
    if (onMinimize) onMinimize();
  };

  const isSubscribed = userSubscriptions.includes(video.channelId);
  const isLiked = likedVideoIds.includes(video.id);
  const videoComments = comments[video.id] || [];
  const relatedVideos = videos.filter(v => v.id !== video.id);

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
    <div className="flex flex-col lg:flex-row gap-6 pb-24 select-none max-w-5xl mx-auto">
      
      {/* Left / Main Column: Player, Video info, Comments */}
      <div className="flex-1 min-w-0">
        
        {/* Mobile Top Navigation Bar: Clean, sleek header with down chevron, title, and actions */}
        <div className="flex items-center justify-between py-2 px-3 sm:hidden bg-[#10131B] border-b border-[#262E3E]/60 sticky top-0 z-30">
          <button
            onClick={handleMinimize}
            className="p-1 -ml-1 rounded-full hover:bg-[#191E29] text-white active:scale-95 transition-all flex items-center gap-1"
            title="Punguza video kwenye Mini-Player"
          >
            <ChevronDown className="w-5 h-5 text-[#FF3040]" />
            <span className="text-[11px] font-bold text-[#A7B0C0]">Rudi</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] text-center">
            <span className="text-xs font-bold text-white truncate">
              {video.channelName}
            </span>
            {video.isChannelVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowReportModal(true)}
              className="p-1.5 rounded-full hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors"
              title="Mipangilio"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Adaptive Player - Edge to edge on mobile */}
        <VideoPlayer video={video} autoPlay={true} />

        {/* Data Saver Mode Notice */}
        {isDataSaver && (
          <div className="mt-2 mx-3 sm:mx-0 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              ⚡ Hali ya Kubana Bando (Data Saver) Imewashwa: Ubora wa 360p
            </span>
            <span className="text-[10px] font-bold text-amber-400">MBs Zinaokolewa</span>
          </div>
        )}

        {/* Video details, actions & comments: comfortable padding on mobile */}
        <div className="px-3 sm:px-0">
          {/* Video Title Row with Chevron dropdown (Matching Screenshot 2) */}
          <div 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="mt-3.5 flex items-start justify-between gap-3 cursor-pointer group"
          >
          <h1 className="text-sm sm:text-lg font-bold text-white leading-snug group-hover:text-[#FF3040] transition-colors">
            {video.title}
          </h1>
          <button className="p-1 text-[#A7B0C0] group-hover:text-white shrink-0 mt-0.5">
            {isDescExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Channel Info Row (Matching Screenshot 2: Avatar, Name + blue verified badge, Subscriber count) */}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div 
            onClick={() => onSelectChannel(video.channelId)}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            <img
              src={video.channelAvatar}
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).src = createAvatarSvgDataUri(video.channelName);
              }}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#262E3E] shrink-0 bg-[#141824]"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-white truncate hover:text-[#FF3040]">
                  {video.channelName}
                </span>
                {video.isChannelVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-[#A7B0C0] font-mono">
                1.4M subscribers
              </p>
            </div>
          </div>

          {/* Join VIP Button (Desktop / Tablet) */}
          <button
            onClick={() => setShowMembershipModal(true)}
            className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t.join}</span>
          </button>
        </div>

        {/* Modern Action Pill Buttons (Responsive & smooth horizontal scroll) */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          
          {/* Like & Dislike Pill */}
          <div className="flex items-center rounded-full bg-[#191E29] border border-[#262E3E] shrink-0 overflow-hidden">
            <button
              onClick={() => toggleLike(video.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold hover:bg-[#232A39] transition-colors ${
                isLiked ? 'text-[#FF3040]' : 'text-white'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#FF3040]' : ''}`} />
              <span>{formatViews(video.likesCount, language)}</span>
            </button>
            <div className="w-[1px] h-4 bg-[#262E3E]" />
            <button
              className="px-2.5 py-1.5 text-xs font-bold hover:bg-[#232A39] text-[#A7B0C0] hover:text-white transition-colors"
              title="Sipendi (Dislike)"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>

          {/* Share Pill */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-xs font-bold text-white transition-colors shrink-0 active:scale-95"
          >
            {isCopied ? <Check className="w-4 h-4 text-[#16C784]" /> : <Share2 className="w-4 h-4" />}
            <span>{isCopied ? 'Imenakiliwa' : 'Shiriki'}</span>
          </button>

          {/* Offline Download Pill */}
          <button
            onClick={handleToggleDownload}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              isDownloadedAlready 
                ? 'bg-[#16C784]/20 border-[#16C784]/50 text-[#16C784]' 
                : 'bg-[#191E29] hover:bg-[#232A39] border-[#262E3E] text-white hover:border-[#16C784]'
            }`}
            title="Pakua Video Kwenye Simu"
          >
            {isDownloadedAlready ? (
              <CheckCircle2 className="w-4 h-4 text-[#16C784]" />
            ) : (
              <Download className="w-4 h-4 text-[#16C784]" />
            )}
            <span>{isDownloadedAlready ? 'Imepakuliwa' : 'Pakua'}</span>
          </button>

          {/* Gift Pill */}
          <button
            onClick={() => setShowGiftModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16C784]/15 hover:bg-[#16C784]/25 border border-[#16C784]/40 text-xs font-bold text-[#16C784] transition-colors shrink-0 active:scale-95"
          >
            <Gift className="w-4 h-4" />
            <span>Zawadi</span>
          </button>

          {/* Save to Playlist Pill */}
          <button
            onClick={() => setShowAddToPlaylistModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-xs font-bold text-white transition-colors shrink-0 active:scale-95"
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>Orodha</span>
          </button>

        </div>

        {/* Subscribe & Bell Row (Matching Screenshot 2: Bell icon + Big Red Subscribe button) */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setHasNotificationBell(!hasNotificationBell)}
            className={`p-2.5 rounded-full border transition-all ${
              hasNotificationBell 
                ? 'border-[#262E3E] bg-[#181C26] text-amber-400' 
                : 'border-[#262E3E] bg-transparent text-[#A7B0C0] hover:text-white'
            }`}
            title="Pokea taarifa zote za video mpya"
          >
            <Bell className={`w-5 h-5 ${hasNotificationBell ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => toggleSubscribe(video.channelId)}
            className={`flex-1 sm:flex-initial sm:min-w-[200px] py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all shadow-lg active:scale-95 ${
              isSubscribed
                ? 'bg-[#232A39] border border-[#262E3E] text-[#A7B0C0] hover:text-white'
                : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-[#FF3040]/40'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Expanded Video Description Box */}
        {isDescExpanded && (
          <div className="mt-4 p-4 rounded-2xl bg-[#181C26] border border-[#262E3E] text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-xs font-semibold text-white mb-2">
              <span>{formatViews(video.viewsCount, language)} {t.viewsPlural}</span>
              <span>•</span>
              <span>{formatRelativeTime(video.createdAt, language)}</span>
              <span className="text-[#16C784] font-medium ml-auto">#{video.category}</span>
            </div>

            <p className="text-[#A7B0C0] leading-relaxed whitespace-pre-line">
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
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-6 pt-4 border-t border-[#262E3E]/60">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white">{t.commentsTitle}</h3>
            <span className="text-[11px] font-mono text-[#A7B0C0]">({videoComments.length})</span>
          </div>

          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2.5 mb-5">
            <img
              src={profile?.photoURL || createAvatarSvgDataUri(profile?.displayName || 'User')}
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).src = createAvatarSvgDataUri(profile?.displayName || 'User');
              }}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#262E3E] bg-[#141824]"
            />
            <div className="flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t.writeComment}
                className="w-full bg-[#181C26] border border-[#262E3E] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#FF3040]"
              />
              {commentText.trim() && (
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCommentText('')}
                    className="px-3 py-1 rounded-lg text-xs text-[#A7B0C0]"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-[#FF3040] text-white text-xs font-bold"
                  >
                    {t.postComment}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Comments preview list */}
          <div className="space-y-3">
            {videoComments.slice(0, 3).map((c) => (
              <div key={c.id} className="flex gap-2.5 text-xs">
                <img
                  src={c.userAvatar}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri(c.userName);
                  }}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#262E3E] bg-[#141824]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-[11px]">{c.userName}</span>
                    <span className="text-[10px] text-[#A7B0C0]">{formatRelativeTime(c.createdAt, language)}</span>
                  </div>
                  <p className="text-[#A7B0C0] text-[11px] mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
        </div>

      </div>

      {/* Right Column / Below: "Maybe you like that" (Matching Screenshot 2) */}
      <div className="w-full lg:w-80 shrink-0 space-y-3 pt-2 px-3 sm:px-0">
        <h3 className="text-xs sm:text-sm font-bold text-white mb-2 tracking-wide">
          Maybe you like that
        </h3>

        <div className="space-y-3">
          {relatedVideos.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectVideo(item)}
              className="flex gap-3 group cursor-pointer p-1.5 rounded-2xl hover:bg-[#181C26] transition-colors"
            >
              {/* Thumbnail with Corner Play Badge */}
              <div className="relative w-36 aspect-video rounded-2xl overflow-hidden bg-[#181C26] shrink-0 border border-[#262E3E]">
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createThumbnailSvgDataUri(item.title, item.category);
                  }}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform bg-[#141824]"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-md">
                  <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-[#FF3040] transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#A7B0C0]">
                    <img 
                      src={item.channelAvatar} 
                      alt="" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createAvatarSvgDataUri(item.channelName);
                      }}
                      className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-[#262E3E] bg-[#141824]" 
                    />
                    <span className="truncate">{item.channelName}</span>
                  </div>
                  <p className="text-[10px] text-[#A7B0C0] mt-0.5">
                    {formatViews(item.viewsCount, language)}
                  </p>
                </div>
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

      {/* Add To Playlist Modal */}
      {showAddToPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#191E29] border border-[#262E3E] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <h3 className="text-sm font-bold text-white">Hifadhi kwenye Orodha (Playlist)</h3>
              <button 
                onClick={() => setShowAddToPlaylistModal(false)}
                className="text-[#A7B0C0] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((pl) => {
                const isInList = pl.videoIds.includes(video.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      addToPlaylist(pl.id, video.id);
                      setShowAddToPlaylistModal(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#10131B] hover:bg-[#232A39] border border-[#262E3E] text-left transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{pl.title}</h4>
                      <p className="text-[10px] text-[#A7B0C0]">{pl.videoIds.length} video</p>
                    </div>
                    {isInList ? (
                      <span className="text-[10px] bg-[#16C784]/20 text-[#16C784] font-bold px-2 py-0.5 rounded-full">
                        Ipo Tayari
                      </span>
                    ) : (
                      <span className="text-[11px] text-purple-400 font-bold">+ Weka</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Download Success Toast */}
      {downloadSuccessToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#16C784] text-black font-extrabold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Video imepakuliwa kwenye simu yako! Tazama nje ya mtandao kwenye Maktaba.</span>
        </div>
      )}

      {/* Interactive Video Download Modal */}
      <VideoDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        video={video}
        onGoToLibrary={() => {
          if (onMinimize) onMinimize();
        }}
      />

    </div>
  );
};
