import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Bookmark, 
  ThumbsUp, 
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
  const [previewVideoError, setPreviewVideoError] = useState<boolean>(false);
  const [quickSaved, setQuickSaved] = useState<boolean>(false);

  // YouTube-Style Timeline Scrubbing on Hover state
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number>(0);
  const [loopBaseTime, setLoopBaseTime] = useState<number>(0);

  const hoverTimerRef = useRef<any>(null);
  const touchTimerRef = useRef<any>(null);
  const scrubDebounceRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total safe video duration
  const totalDuration = (video.durationSeconds && video.durationSeconds > 0)
    ? video.durationSeconds
    : 20;

  // Active timestamp for scene discovery
  const currentTimeForScene = isScrubbing ? hoverTime : previewTime;
  const scenes = React.useMemo(() => getVideoScenes(video), [video]);
  const activeScene = React.useMemo(() => getActiveSceneForTime(scenes, currentTimeForScene), [scenes, currentTimeForScene]);

  const parsedSource = React.useMemo(() => parseVideoSource(video.videoUrl), [video.videoUrl]);
  const canPlayDirectVideo = !isDataSaver && 
    Boolean(video?.videoUrl) && 
    parsedSource.sourceType === 'direct' && 
    !previewVideoError &&
    (
      video.videoUrl.includes('.mp4') || 
      video.videoUrl.includes('.webm') || 
      video.videoUrl.includes('cloudinary') || 
      video.videoUrl.includes('googleapis.com') ||
      video.videoUrl.includes('cloudflarestream.com') ||
      video.videoUrl.includes('r2.cloudflarestorage.com')
    );

  const isLiked = Boolean(video?.id && likedVideoIds.includes(video.id));
  const isLive = (video.viewsCount || 0) > 500000;

  // Listen to single active preview manager across entire app
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
      if (scrubDebounceRef.current) clearTimeout(scrubDebounceRef.current);
    };
  }, []);

  const startPreview = useCallback((initialSeekTime: number = 0) => {
    // Respect user reduced-motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Set as the only active preview across the entire application
    previewManager.setActiveId(video.id);
    setIsPreviewActive(true);
    setLoopBaseTime(initialSeekTime);

    if (videoRef.current && canPlayDirectVideo && !previewVideoError) {
      videoRef.current.currentTime = initialSeekTime;
      videoRef.current.play().then(() => {
        setIsVideoLoaded(true);
      }).catch((err) => {
        console.warn('Preview play error, fallback to thumbnail:', err);
        setIsVideoLoaded(false);
        setPreviewVideoError(true);
      });
    }
  }, [video.id, canPlayDirectVideo, previewVideoError]);

  const stopPreview = useCallback(() => {
    setIsPreviewActive(false);
    setIsVideoLoaded(false);
    setIsScrubbing(false);
    setHoverRatio(null);
    setPreviewTime(0);
    setLoopBaseTime(0);

    if (scrubDebounceRef.current) clearTimeout(scrubDebounceRef.current);

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
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    // Calculate initial hover position
    let initialTime = 0;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const ratio = rect.width > 0 ? x / rect.width : 0;
      initialTime = ratio * totalDuration;
    }

    hoverTimerRef.current = setTimeout(() => {
      startPreview(initialTime);
    }, 500); // 500ms requirement before starting preview
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (scrubDebounceRef.current) clearTimeout(scrubDebounceRef.current);
    stopPreview();
  };

  // YouTube-Style Mouse Movement across thumbnail for interactive scene scrub
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = rect.width > 0 ? x / rect.width : 0;
    const targetTime = Math.max(0, Math.min(totalDuration, ratio * totalDuration));

    setHoverRatio(ratio);
    setHoverTime(targetTime);
    setIsScrubbing(true);

    if (isPreviewActive && videoRef.current && canPlayDirectVideo && !previewVideoError) {
      // Seek video preview immediately to the pointed scene
      videoRef.current.currentTime = targetTime;
    }

    // Debounce: when mouse stops moving over that scene, resume continuous 5-8s loop from there
    if (scrubDebounceRef.current) clearTimeout(scrubDebounceRef.current);
    scrubDebounceRef.current = setTimeout(() => {
      setIsScrubbing(false);
      setLoopBaseTime(targetTime);
      if (isPreviewActive && videoRef.current && canPlayDirectVideo && !previewVideoError) {
        videoRef.current.play().catch(() => {});
      }
    }, 600);
  };

  // Mobile Touch-and-Hold (400ms) and touch scrubbing
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    let initialTime = 0;
    if (containerRef.current && e.touches.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.touches[0].clientX - rect.left));
      const ratio = rect.width > 0 ? x / rect.width : 0;
      initialTime = ratio * totalDuration;
    }

    touchTimerRef.current = setTimeout(() => {
      startPreview(initialTime);
    }, 400);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.touches[0].clientX - rect.left));
    const ratio = rect.width > 0 ? x / rect.width : 0;
    const targetTime = Math.max(0, Math.min(totalDuration, ratio * totalDuration));

    setHoverRatio(ratio);
    setHoverTime(targetTime);
    setIsScrubbing(true);

    if (isPreviewActive && videoRef.current && canPlayDirectVideo && !previewVideoError) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setIsScrubbing(false);
    // Give mobile user 3 seconds to watch before stopping touch preview
    setTimeout(() => {
      stopPreview();
    }, 3000);
  };

  // Video Time Update & 5–8 Second Loop
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setPreviewTime(cur);

      // Loop within 5–8 seconds window when not scrubbing
      if (!isScrubbing) {
        const loopDuration = 7; // 7 seconds loop (between 5 and 8 seconds requirement)
        const loopEnd = Math.min(totalDuration, loopBaseTime + loopDuration);
        if (cur >= loopEnd || cur >= (videoRef.current.duration || totalDuration)) {
          videoRef.current.currentTime = loopBaseTime;
        }
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

  // Compute current display scrub percentage [0..100]
  const currentScrubPercent = isScrubbing && hoverRatio !== null 
    ? Math.max(0, Math.min(100, hoverRatio * 100))
    : Math.max(0, Math.min(100, (previewTime / totalDuration) * 100));

  const currentTimeFormatted = formatDuration(isScrubbing ? hoverTime : previewTime);
  const totalDurationFormatted = formatDuration(totalDuration);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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

      {/* 2. Cinematic Auto Preview Video Element (Plays muted 5-8s loop) */}
      {isPreviewActive && canPlayDirectVideo && !previewVideoError && (
        <video
          ref={videoRef}
          src={parsedSource.streamUrl || video.videoUrl}
          muted={isMuted}
          playsInline
          loop
          preload="auto"
          onError={() => {
            setPreviewVideoError(true);
            setIsVideoLoaded(false);
          }}
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
              {video.category || 'Tazama'}
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

      {/* 7. YouTube-Style Hover Scrubber Tooltip Bubble (Clean exact timestamp) */}
      {isPreviewActive && (isScrubbing || isHovered) && (
        <div 
          className="absolute bottom-6 z-30 pointer-events-none -translate-x-1/2 transition-all duration-75 flex flex-col items-center"
          style={{ left: `${Math.max(18, Math.min(82, currentScrubPercent))}%` }}
        >
          <div className="px-2 py-0.5 rounded-md bg-black/95 backdrop-blur-md border border-white/20 text-white shadow-2xl flex items-center gap-1 whitespace-nowrap ring-1 ring-black/50 font-mono">
            <span className="text-[11px] font-black text-[#FF3040]">
              {currentTimeFormatted}
            </span>
            <span className="text-[9px] text-[#A7B0C0]">
              / {totalDurationFormatted}
            </span>
          </div>
          {/* Tooltip downward arrowhead */}
          <div className="w-2 h-1 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black/95" />
        </div>
      )}

      {/* 8. YouTube-Style Interactive Timeline Scrubber with Red Dot (Matching image_ee936425.png) */}
      {isPreviewActive ? (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/25 backdrop-blur-sm z-30 pointer-events-none">
          {/* Red Progress Track */}
          <div 
            className="h-full bg-[#FF3040] shadow-sm shadow-[#FF3040]/50 relative"
            style={{ width: `${currentScrubPercent}%` }}
          >
            {/* YouTube Red Scrubber Circle Handle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-[#FF3040] border-2 border-white shadow-lg ring-1 ring-black/40" />
          </div>
        </div>
      ) : (
        /* Duration Badge (Visible when NOT previewing) */
        !isLive && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-white border border-white/10 z-10 shadow">
            {formatDuration(video.durationSeconds)}
          </div>
        )
      )}

      {/* 9. Quick Action Buttons on Hover (Watch Later & Like) */}
      {isHovered && !isLive && (
        <div className="absolute bottom-3 left-2 flex items-center gap-1 z-30 animate-in fade-in duration-150">
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
        <div className="absolute bottom-3 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 z-10 pointer-events-none">
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
