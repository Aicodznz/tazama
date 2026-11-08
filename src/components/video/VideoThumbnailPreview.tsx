import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Bookmark, 
  ThumbsUp, 
  CheckCircle2, 
  Check, 
  Zap
} from 'lucide-react';
import { VideoItem } from '../../types';
import { formatDuration } from '../../lib/i18n';
import { useVideo } from '../../context/VideoContext';
import { previewManager } from '../../lib/previewManager';
import { createThumbnailSvgDataUri, createAvatarSvgDataUri } from '../../lib/mediaPlaceholders';
import { parseVideoSource } from '../../lib/videoUtils';
import { 
  extractDominantColors, 
  getVideoGradientConfig, 
  BorderGradientConfig 
} from '../../lib/colorExtractor';

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

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [, setPreviewTime] = useState<number>(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [thumbError, setThumbError] = useState<boolean>(false);
  const [previewVideoError, setPreviewVideoError] = useState<boolean>(false);
  const [quickSaved, setQuickSaved] = useState<boolean>(false);

  // Dynamic Thumbnail Color State
  const [extractedColors, setExtractedColors] = useState<[string, string, string] | null>(null);

  const hoverTimerRef = useRef<any>(null);
  const touchTimerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total safe video duration
  const totalDuration = (video.durationSeconds && video.durationSeconds > 0)
    ? video.durationSeconds
    : 20;

  // Asynchronously extract dominant colors from thumbnail
  useEffect(() => {
    let isMounted = true;
    const thumbUrl = video.thumbnailUrl;
    if (thumbUrl && !isDataSaver) {
      extractDominantColors(thumbUrl, video.category, video.id || video.title).then((colors) => {
        if (isMounted && colors) {
          setExtractedColors(colors);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [video.thumbnailUrl, video.category, video.id, video.title, isDataSaver]);

  // Compute dynamic gradient border configuration
  const borderConfig: BorderGradientConfig = React.useMemo(() => {
    return getVideoGradientConfig(video, extractedColors);
  }, [video, extractedColors]);

  const parsedSource = React.useMemo(() => parseVideoSource(video.videoUrl), [video.videoUrl]);
  const canPlayDirectVideo = !isDataSaver && 
    Boolean(video?.videoUrl) && 
    parsedSource.sourceType === 'direct' && 
    !previewVideoError;

  const isLiked = Boolean(video?.id && likedVideoIds.includes(video.id));
  const isLive = borderConfig.variant === 'live';

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
    };
  }, []);

  const playVideoSafely = useCallback(() => {
    if (videoRef.current && canPlayDirectVideo) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoLoaded(true);
          })
          .catch((err) => {
            console.debug('Preview autoplay deferred:', err?.message || err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().then(() => setIsVideoLoaded(true)).catch(() => {});
            }
          });
      }
    }
  }, [canPlayDirectVideo]);

  const startPreview = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    previewManager.setActiveId(video.id);
    setIsPreviewActive(true);

    if (videoRef.current && canPlayDirectVideo) {
      videoRef.current.currentTime = 0;
      playVideoSafely();
    }
  }, [video.id, canPlayDirectVideo, playVideoSafely]);

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

  // When mouse enters thumbnail
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    hoverTimerRef.current = setTimeout(() => {
      startPreview();
    }, 100);
  };

  // When mouse moves over the video
  const handleMouseMove = () => {
    if (!isHovered) setIsHovered(true);

    if (!isPreviewActive) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      startPreview();
    } else if (videoRef.current && videoRef.current.paused) {
      playVideoSafely();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    stopPreview();
  };

  // Mobile Touch-and-Hold
  const handleTouchStart = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      startPreview();
    }, 350);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setTimeout(() => {
      stopPreview();
    }, 3000);
  };

  // Video Time Update & 5–8 Second Continuous Loop
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setPreviewTime(cur);

      const loopDuration = 7;
      const maxDuration = (videoRef.current.duration && !isNaN(videoRef.current.duration))
        ? videoRef.current.duration
        : totalDuration;

      if (cur >= loopDuration || cur >= maxDuration) {
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

  // Clean custom class names by removing redundant static border tokens so the animated gradient shines
  const cleanedClassName = className.replace(/\bborder(-[^\s]+)?(\/[^\s]+)?\b/g, '').trim();

  return (
    <div
      className={`relative group/gradient-card select-none cursor-pointer ${aspectRatioClass} ${cleanedClassName}`}
      onClick={() => onSelectVideo?.(video)}
    >
      {/* 1. Dynamic Directional Outer Glow (Rotates in sync with the laser beam) */}
      <div
        className="absolute -inset-1.5 rounded-[inherit] overflow-hidden -z-10 pointer-events-none opacity-60 group-hover/gradient-card:opacity-90 transition-opacity duration-300"
      >
        <div
          className={`absolute -inset-[150%] pointer-events-none ${
            borderConfig.animationType === 'pulse-live'
              ? 'animate-border-pulse-live'
              : 'animate-border-beam'
          }`}
          style={{
            background: borderConfig.beamConicGradient,
            filter: 'blur(10px) brightness(1.7)',
          }}
        />
      </div>

      {/* 2. Animated Border Beam Frame Wrapper */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full h-full p-[1.5px] sm:p-[2px] rounded-[inherit] overflow-hidden transition-all duration-300 ${
          isPreviewActive ? 'shadow-2xl' : 'shadow-lg'
        }`}
        style={{
          backgroundColor: borderConfig.baseBorderColor,
        }}
      >
        {/* High-Intensity Traveling Conic Laser Beam Layer */}
        <div
          className={`absolute -inset-[150%] pointer-events-none ${
            borderConfig.animationType === 'pulse-live'
              ? 'animate-border-pulse-live'
              : 'animate-border-beam'
          }`}
          style={{
            background: borderConfig.beamConicGradient,
          }}
        />

        {/* 3. Inner Card Mask (Protects thumbnail, video, and text from overpowering) */}
        <div className="relative z-10 w-full h-full rounded-[inherit] bg-[#0E121A] overflow-hidden">
          {/* Main Static Thumbnail Image */}
          <img
            src={thumbnailSrc}
            alt=""
            onError={() => setThumbError(true)}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPreviewActive && isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Cinematic Auto Preview Video Element (Plays muted loop on hover) */}
          {isPreviewActive && canPlayDirectVideo && (
            <video
              ref={videoRef}
              src={parsedSource.streamUrl || video.videoUrl}
              muted={isMuted}
              playsInline
              autoPlay
              preload="auto"
              onLoadedMetadata={() => {
                playVideoSafely();
              }}
              onCanPlay={() => {
                playVideoSafely();
              }}
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

          {/* YouTube Live Hover Player Preview (Muted instant preview on card hover) */}
          {isPreviewActive && !isDataSaver && parsedSource.sourceType === 'youtube' && parsedSource.videoId && (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden scale-[1.05] transition-opacity duration-300">
              <iframe
                src={`https://www.youtube.com/embed/${parsedSource.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${parsedSource.videoId}&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                title={video.title}
                className="w-full h-full border-0 pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            </div>
          )}

          {/* Data Saver Mode Indicator */}
          {isPreviewActive && isDataSaver && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-amber-300">Bana Bando Imewashwa</span>
              <span className="text-[10px] text-[#A7B0C0] mt-0.5">Video preview imezimwa kuokoa MBs</span>
            </div>
          )}

          {/* Top Overlay: Category / Live Badge, 4K Badge, Audio Toggle */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-1.5">
              {isLive ? (
                <div className="px-2 py-0.5 rounded-full bg-[#FF3040] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md shadow-[#FF3040]/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Live</span>
                </div>
              ) : (
                <div className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10 uppercase tracking-wide">
                  {video.category || 'Tazama'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Audio Toggle button when preview is active */}
              {isPreviewActive && canPlayDirectVideo && (
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 pointer-events-auto cursor-pointer shadow-lg"
                  title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              )}
            </div>
          </div>

          {/* Bottom-left Quick Action Buttons (Watch Later / Bookmark & Like) on hover */}
          {isHovered && !isLive && (
            <div 
              className="absolute bottom-2 left-2 flex items-center gap-1.5 z-30 animate-in fade-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleQuickSave}
                title={quickSaved ? "Imehifadhiwa kwenye Orodha" : "Hifadhi (Tazama Baadaye)"}
                className={`p-1.5 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer shadow-lg pointer-events-auto ${
                  quickSaved
                    ? 'bg-[#16C784] text-black border-[#16C784]'
                    : 'bg-black/80 hover:bg-black text-white/90 hover:text-white border-white/25'
                }`}
              >
                {quickSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleQuickLike}
                title={isLiked ? "Ondoa Like" : "Penda Video (Like)"}
                className={`p-1.5 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer shadow-lg pointer-events-auto ${
                  isLiked
                    ? 'bg-[#FF3040] text-white border-[#FF3040]'
                    : 'bg-black/80 hover:bg-black text-white/90 hover:text-white border-white/25'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          {/* Bottom-right: PREMIUM Badge (reference image_97ec2eb4.png) or Duration Badge */}
          {borderConfig.variant === 'premium' ? (
            <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black text-[10px] font-black tracking-wide shadow-lg border border-amber-200/50 flex items-center gap-1 z-20">
              <span>👑</span>
              <span>PREMIUM</span>
            </div>
          ) : !isLive ? (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-white border border-white/10 z-20 shadow">
              {formatDuration(video.durationSeconds)}
            </div>
          ) : null}

          {/* Creator Overlay if requested */}
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
      </div>
    </div>
  );
};


