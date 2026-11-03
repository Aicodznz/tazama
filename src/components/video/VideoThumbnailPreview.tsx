import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Bookmark, 
  ThumbsUp, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Subtitles,
  Zap
} from 'lucide-react';
import { VideoItem } from '../../types';
import { formatDuration } from '../../lib/i18n';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { previewManager } from '../../lib/previewManager';
import { getVideoScenes, getActiveSceneForTime } from '../../lib/videoScenes';
import { createThumbnailSvgDataUri, createAvatarSvgDataUri } from '../../lib/mediaPlaceholders';
import { parseVideoSource } from '../../lib/videoUtils';

interface VideoThumbnailPreviewProps {
  video: VideoItem;
  className?: string;
  aspectRatioClass?: string;
  showCreatorOverlay?: boolean;
  onSelectVideo?: (video: VideoItem) => void;
  onQuickSave?: (videoId: string) => void;
  onQuickLike?: (videoId: string) => void;
}

export const VideoThumbnailPreview: React.FC<VideoThumbnailPreviewProps> = ({
  video,
  className = '',
  aspectRatioClass = 'aspect-video',
  showCreatorOverlay = false,
  onSelectVideo,
  onQuickSave,
  onQuickLike
}) => {
  const { isDataSaver, likedVideoIds, toggleLike, playlists, addToPlaylist } = useVideo();
  const { profile } = useAuth();

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [previewTime, setPreviewTime] = useState<number>(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [thumbError, setThumbError] = useState<boolean>(false);
  const [quickSaved, setQuickSaved] = useState<boolean>(false);

  const hoverTimerRef = useRef<any>(null);
  const touchTimerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scenes = React.useMemo(() => getVideoScenes(video), [video]);
  const activeScene = React.useMemo(() => getActiveSceneForTime(scenes, previewTime), [scenes, previewTime]);

  const parsedSource = React.useMemo(() => parseVideoSource(video.videoUrl), [video.videoUrl]);
  const canPlayDirectVideo = !isDataSaver && (parsedSource.sourceType === 'direct' || video.videoUrl.endsWith('.mp4'));

  const isLiked = Boolean(video?.id && likedVideoIds.includes(video.id));
  const isLive = video.viewsCount > 500000;

  // Listen to single active preview manager
  useEffect(() => {
    const unsubscribe = previewManager.subscribe((activeId) => {
      if (activeId !== video.id && isPreviewActive) {
        stopPreview();
      }
    });
    return unsubscribe;
  }, [video.id, isPreviewActive]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const startPreview = useCallback(() => {
    // Respect user reduced-motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Set as the only active preview across the entire application
    previewManager.setActiveId(video.id);
    setIsPreviewActive(true);

    if (videoRef.current && canPlayDirectVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsVideoLoaded(true);
      }).catch(() => {
        // Fallback gracefully
      });
    }
  }, [video.id, canPlayDirectVideo]);

  const stopPreview = useCallback(() => {
    setIsPreviewActive(false);
    setIsVideoLoaded(false);
    setPreviewTime(0);

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch {}
    }

    if (previewManager.getActiveId() === video.id) {
      previewManager.setActiveId(null);
    }
  }, [video.id]);

  // Desktop Hover with 500ms debounce
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    hoverTimerRef.current = setTimeout(() => {
      startPreview();
    }, 500); // 500ms requirement before starting preview
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    stopPreview();
  };

  // Mobile Touch-and-Hold (400ms)
  const handleTouchStart = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      startPreview();
    }, 400);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    // Give mobile user 3 seconds to watch before stopping touch preview
    setTimeout(() => {
      stopPreview();
    }, 3000);
  };

  // Video Time Update & Loop (5-10s clip)
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setPreviewTime(cur);
      // Loop between 0 and 8 seconds
      if (cur >= 8) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
    }
  };

  const handleQuickLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickLike) onQuickLike(video.id);
    else toggleLike(video.id);
  };

  const handleQuickSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickSave) {
      onQuickSave(video.id);
    } else {
      const watchLater = playlists.find(p => p.id === 'pl-watch-later') || playlists[0];
      if (watchLater) {
        addToPlaylist(watchLater.id, video.id);
        setQuickSaved(true);
        setTimeout(() => setQuickSaved(false), 2000);
      }
    }
  };

  const thumbnailSrc = thumbError 
    ? createThumbnailSvgDataUri(video.title, video.category)
    : (video.thumbnailUrl || createThumbnailSvgDataUri(video.title, video.category));

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onSelectVideo?.(video)}
      className={`relative w-full overflow-hidden select-none cursor-pointer transition-all duration-300 ${aspectRatioClass} ${className} ${
        isPreviewActive ? 'ring-2 ring-[#FF3040] shadow-2xl scale-[1.01]' : ''
      }`}
    >
      {/* 1. Main Static Thumbnail Image */}
      <img
        src={thumbnailSrc}
        alt=""
        onError={() => setThumbError(true)}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isPreviewActive && isVideoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* 2. Cinematic Auto Preview Video Element (Active on 500ms hover) */}
      {isPreviewActive && canPlayDirectVideo && (
        <video
          ref={videoRef}
          src={parsedSource.streamUrl || video.videoUrl}
          muted={isMuted}
          playsInline
          loop
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* 3. Data Saver Mode Indicator (Zero video bandwidth downloaded) */}
      {isPreviewActive && isDataSaver && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black text-amber-300">Bana Bando Imewashwa</span>
          <span className="text-[10px] text-[#A7B0C0] mt-0.5">Video preview imezimwa kuokoa MBs</span>
        </div>
      )}

      {/* 4. Top Overlay: Live badge, Category, Audio Toggle */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <div className="px-2 py-0.5 rounded-full bg-[#FF3040] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md shadow-[#FF3040]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Live</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10">
              {video.category}
            </div>
          )}

          {video.isMembersOnly && (
            <div className="px-2 py-0.5 rounded-full bg-[#16C784] text-[10px] font-extrabold text-black shadow-md">
              VIP
            </div>
          )}
        </div>

        {/* Quick Audio Toggle button when preview is active */}
        {isPreviewActive && canPlayDirectVideo && (
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 pointer-events-auto cursor-pointer shadow-lg"
            title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        )}
      </div>

      {/* 5. AI Scene Discovery Chapter Badge (When previewing) */}
      {isPreviewActive && activeScene && (
        <div className="absolute top-8 left-2 right-2 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-amber-500/30 text-white pointer-events-none animate-in fade-in slide-in-from-top-1 duration-200">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-[10px] font-bold text-amber-300 truncate">
            {activeScene.title}
          </span>
        </div>
      )}

      {/* 6. Live Caption Preview Overlay (Kiswahili sample subtitles) */}
      {isPreviewActive && (
        <div className="absolute bottom-7 left-2 right-2 z-20 pointer-events-none text-center">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-yellow-300 font-bold text-[10px] shadow-lg border border-yellow-400/20">
            <Subtitles className="w-2.5 h-2.5" />
            <span>[Kiswahili]: Maudhui bora ya Tazama</span>
          </div>
        </div>
      )}

      {/* 7. Smart Timeline Preview Progress Line */}
      {isPreviewActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 pointer-events-none z-20 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#FF3040] to-amber-400 transition-all duration-200"
            style={{ width: `${Math.min(100, (previewTime / 8) * 100)}%` }}
          />
        </div>
      )}

      {/* 8. Duration Badge (Visible when NOT previewing) */}
      {!isPreviewActive && !isLive && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-white border border-white/10 z-10 shadow">
          {formatDuration(video.durationSeconds)}
        </div>
      )}

      {/* 9. Quick Action Buttons on Hover (Watch Later & Like) */}
      {isHovered && !isLive && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 z-30 animate-in fade-in duration-150">
          <button
            onClick={handleQuickSave}
            className={`p-1.5 rounded-full border backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${
              quickSaved 
                ? 'bg-[#16C784] text-black border-[#16C784]' 
                : 'bg-black/80 hover:bg-[#191E29] text-white border-white/20'
            }`}
            title="Tazama Baadaye (Watch Later)"
          >
            {quickSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleQuickLike}
            className={`p-1.5 rounded-full border backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${
              isLiked 
                ? 'bg-[#FF3040] text-white border-[#FF3040]' 
                : 'bg-black/80 hover:bg-[#191E29] text-white border-white/20'
            }`}
            title="Penda (Like)"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>
      )}

      {/* 10. Creator Overlay if requested */}
      {showCreatorOverlay && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 z-10 pointer-events-none">
          <img
            src={video.channelAvatar || createAvatarSvgDataUri(video.channelName)}
            alt=""
            className="w-4 h-4 rounded-full object-cover"
          />
          <span className="text-[10px] text-white font-medium truncate max-w-[100px]">
            {video.channelName}
          </span>
          {video.isChannelVerified && (
            <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
          )}
        </div>
      )}
    </div>
  );
};
