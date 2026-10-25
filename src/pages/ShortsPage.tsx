import React, { useState, useRef, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Gift, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown,
  CheckCircle2,
  Film,
  Maximize,
  Minimize
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews, translations } from '../lib/i18n';
import { GiftModal } from '../components/gifts/GiftModal';
import { VideoItem } from '../types';

interface ShortsPageProps {
  onSelectChannel: (channelId: string) => void;
  onOpenWallet: () => void;
}

export const ShortsPage: React.FC<ShortsPageProps> = ({ onSelectChannel, onOpenWallet }) => {
  const { shorts, likedVideoIds, toggleLike, userSubscriptions, toggleSubscribe } = useVideo();
  const { language } = useAuth();
  const t = translations[language];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const currentShort = shorts[currentIndex] || shorts[0];

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    // Swipe up for next
    if (deltaY > 50) {
      handleNext();
    } 
    // Swipe down for previous
    else if (deltaY < -50) {
      handlePrev();
    }
    touchStartY.current = null;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      try {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        } else if ((videoRef.current as any)?.webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
      } catch (err) {}
      setIsFullscreen(true);
    } else {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (err) {}
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleNativeFullscreen = () => {
      const isNative = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNative && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handleNativeFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleNativeFullscreen);
  }, [isFullscreen]);

  const isLiked = likedVideoIds.includes(currentShort?.id);
  const isSubscribed = userSubscriptions.includes(currentShort?.channelId);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`flex justify-center items-center select-none w-full transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen bg-black'
          : 'h-[calc(100dvh-5.5rem)] sm:h-[calc(100vh-120px)] sm:max-h-[840px] sm:pb-6'
      }`}
    >
      
      {/* Central Phone Canvas for Shorts: Full width & height on mobile */}
      <div 
        ref={containerRef}
        className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden transition-all ${
          isFullscreen 
            ? 'w-screen h-screen rounded-none' 
            : 'sm:max-w-[420px] rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-[#262E3E]'
        }`}
      >
        
        {/* Video Element */}
        <video
          ref={videoRef}
          src={currentShort.videoUrl}
          poster={currentShort.thumbnailUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play State Flash Indicator */}
        {!isPlaying && (
          <div 
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF3040] flex items-center justify-center text-white shadow-xl shadow-[#FF3040]/50">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Top Controls: Tag, Mute & Fullscreen */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
            <Film className="w-3.5 h-3.5 text-[#FF3040]" />
            <span>Shorts ({currentIndex + 1}/{shorts.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
              title={isMuted ? 'Washa sauti' : 'Zima sauti'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
              title={isFullscreen ? 'Toka Skrini Nzima' : 'Skrini Nzima (Fulu)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-[#FF3040]" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Overlay: Creator info & Video title */}
        <div className="absolute bottom-4 left-4 right-16 z-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={currentShort.channelAvatar}
              alt={currentShort.channelName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
            />
            <span className="text-xs font-bold truncate">{currentShort.channelName}</span>
            <button
              onClick={() => toggleSubscribe(currentShort.channelId)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                isSubscribed 
                  ? 'bg-white/20 text-white' 
                  : 'bg-[#FF3040] text-white shadow-md'
              }`}
            >
              {isSubscribed ? t.subscribed : t.subscribe}
            </button>
          </div>

          <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug drop-shadow-md">
            {currentShort.title}
          </h3>
        </div>

        {/* Right Action Icons Column */}
        <div className="absolute right-3 bottom-14 flex flex-col items-center gap-4 z-10 text-white">
          
          {/* Like */}
          <button
            onClick={() => toggleLike(currentShort.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform ${
              isLiked ? 'text-[#FF3040]' : 'text-white'
            }`}>
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-[#FF3040]' : ''}`} />
            </div>
            <span className="text-[10px] font-bold drop-shadow">
              {formatViews(currentShort.likesCount, language)}
            </span>
          </button>

          {/* Comments */}
          <button className="flex flex-col items-center gap-1 group">
            <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold drop-shadow">
              {currentShort.commentsCount}
            </span>
          </button>

          {/* Virtual Gift Button */}
          <button
            onClick={() => setShowGiftModal(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2.5 rounded-full bg-[#16C784]/80 backdrop-blur-md border border-[#16C784] text-black group-hover:scale-110 transition-transform shadow-lg shadow-[#16C784]/30">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#16C784] drop-shadow">
              Zawadi
            </span>
          </button>

          {/* Share */}
          <button 
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold drop-shadow">
              Shiriki
            </span>
          </button>
        </div>

        {/* Up / Down Navigation Arrows for Desktop */}
        <div className="absolute right-3 top-16 flex flex-col gap-2 z-10 hidden sm:flex">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-30 transition-all"
            title="Short Iliyopita"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === shorts.length - 1}
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-30 transition-all"
            title="Short Inayofuata"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Gift Modal */}
      <GiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        videoId={currentShort.id}
        channelId={currentShort.channelId}
        channelName={currentShort.channelName}
        onOpenWallet={onOpenWallet}
      />

    </div>
  );
};
