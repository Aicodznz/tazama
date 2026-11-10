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
  compact?: boolean;
  compactMobile?: boolean;
  autoPlayPreview?: boolean;
  onSelectVideo?: (video: VideoItem) => void;
  onQuickSave?: (videoId: string) => void;
  onQuickLike?: (videoId: string) => void;
}

export const VideoThumbnailPreview: React.FC<VideoThumbnailPreviewProps> = ({
  video,
  className = '',
  aspectRatioClass = 'aspect-video',
  showCreatorOverlay = false,
  compact = false,
  compactMobile = false,
  autoPlayPreview = false,
  onSelectVideo,
  onQuickSave,
  onQuickLike
}) => {
  const { isDataSaver, likedVideoIds, toggleLike, playlists, addToPlaylist } = useVideo();

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showPreviewCaptions, setShowPreviewCaptions] = useState<boolean>(false);
  const [previewTime, setPreviewTime] = useState<number>(0);
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

  // Auto-start muted inline preview when direct video is autoPlayPreview
  useEffect(() => {
    if (!autoPlayPreview || isDataSaver || !canPlayDirectVideo) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = setTimeout(() => {
      previewManager.setActiveId(video.id);
      setIsPreviewActive(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
        videoRef.current.play().then(() => setIsVideoLoaded(true)).catch(() => {});
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [autoPlayPreview, isDataSaver, canPlayDirectVideo, video.id]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const playVideoSafely = useCallback(() => {
    if (videoRef.current && canPlayDirectVideo) {
      videoRef.current.muted = isMuted;
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
              setIsMuted(true);
              videoRef.current.play().then(() => setIsVideoLoaded(true)).catch(() => {});
            }
          });
      }
    }
  }, [canPlayDirectVideo, isMuted]);

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
    } else if (videoRef.current && videoRef.current.paused && canPlayDirectVideo) {
      playVideoSafely();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (!autoPlayPreview) {
      stopPreview();
    }
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
    if (!autoPlayPreview) {
      setTimeout(() => {
        stopPreview();
      }, 3000);
    }
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

  const handleToggleCaptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreviewCaptions((prev) => !prev);
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

  // Strip redundant static border or root overflow classes so the animated gradient border & outer glow remain unclipped
  const cleanedClassName = className
    .replace(/\bborder(-[^\s]+)?(\/[^\s]+)?\b/g, '')
    .replace(/\boverflow-hidden\b/g, '')
    .trim();

  return (
    <div
      className={`relative isolate group/gradient-card select-none cursor-pointer ${aspectRatioClass} ${cleanedClassName}`}
      onClick={(e) => {
        if (onSelectVideo) {
          e.stopPropagation();
          onSelectVideo(video);
        }
      }}
    >
      {/* 1. Dynamic Directional Outer Glow (Isolate context prevents parent opaque backgrounds from hiding glow) */}
      <div
        className="absolute -inset-1 sm:-inset-1.5 rounded-[inherit] overflow-hidden -z-10 pointer-events-none opacity-45 dark:opacity-75 group-hover/gradient-card:opacity-80 dark:group-hover/gradient-card:opacity-100 transition-opacity duration-300"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: borderConfig.baseBorderGradient,
            filter: 'blur(7px)',
          }}
        />
        <div
          className={`absolute -inset-[150%] pointer-events-none ${
            borderConfig.animationType === 'pulse-live'
              ? 'animate-border-pulse-live'
              : 'animate-border-beam'
          }`}
          style={{
            background: borderConfig.beamConicGradient,
            filter: 'blur(9px) brightness(1.55)',
          }}
        />
      </div>

      {/* 2. Animated Gradient Border Frame Wrapper */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full h-full p-[2px] sm:p-[2.5px] rounded-[inherit] overflow-hidden transition-all duration-300 ${
          isPreviewActive ? 'shadow-2xl' : 'shadow-md dark:shadow-lg'
        }`}
        style={{
          backgroundColor: borderConfig.baseBorderColor,
          backgroundImage: borderConfig.baseBorderGradient,
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
        <div className="relative z-10 w-full h-full rounded-[inherit] bg-[#0E121A] overflow-hidden ring-1 ring-black/25 dark:ring-black/50">
          {/* Main Static Thumbnail Image */}
          <img
            src={thumbnailSrc}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setThumbError(true)}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPreviewActive && isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Cinematic Auto Preview Video Element (Plays muted loop cleanly when playable) */}
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

          {/* Inline Preview Captions Pill (when user toggles CC during live video preview) */}
          {isPreviewActive && isVideoLoaded && showPreviewCaptions && !isDataSaver && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-black/80 text-white text-[10px] font-semibold max-w-[85%] truncate pointer-events-none z-20">
              {video.title}
            </div>
          )}

          {/* Live Inline Preview Red Scrubber Bar & Red Dot (only while video actually plays) */}
          {isPreviewActive && isVideoLoaded && canPlayDirectVideo && !isDataSaver && !isLive && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/25 z-30 pointer-events-none">
              <div
                className="relative h-full bg-[#FF3040] transition-[width] duration-150"
                style={{
                  width: `${Math.min(100, Math.max(4, (previewTime / 7) * 100))}%`,
                }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#FF3040] ring-1 ring-white shadow-md" />
              </div>
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

          {/* Top Overlay: Category / Live / Compact VIP Badge & Top-Right Stacked Mute + CC Controls */}
          <div className={`absolute flex items-start justify-between pointer-events-none z-20 ${compact || compactMobile ? 'top-1.5 left-1.5 right-1.5 sm:top-2 sm:left-2 sm:right-2' : 'top-2 left-2 right-2'}`}>
            <div className="flex items-center gap-1.5">
              {isLive ? (
                <div className="px-2 py-0.5 rounded-full bg-[#FF3040] text-white text-[9.5px] sm:text-[10px] font-extrabold flex items-center gap-1 shadow-md shadow-[#FF3040]/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Live</span>
                </div>
              ) : (
                <>
                  {borderConfig.variant === 'premium' && (compact || compactMobile) && (
                    <div className={`${compact ? 'inline-flex' : 'inline-flex sm:hidden'} items-center gap-0.5 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black text-[9px] font-black tracking-wide shadow`}>
                      <span>VIP</span>
                    </div>
                  )}
                  {!compact && (
                    <div className={`${compactMobile ? 'hidden sm:block' : 'block'} px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10 uppercase tracking-wide`}>
                      {video.category || 'Tazama'}
                    </div>
                  )}
                </>
              )}
            </div>

            {isPreviewActive && isVideoLoaded && canPlayDirectVideo && !isDataSaver && !compact && (
              <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-lg"
                  title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleToggleCaptions}
                  className={`px-1.5 py-0.5 rounded-md border text-[10px] font-black backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${
                    showPreviewCaptions
                      ? 'bg-[#FF3040] border-[#FF3040] text-white'
                      : 'bg-black/75 hover:bg-black border-white/20 text-white'
                  }`}
                  title="Manukuu (CC)"
                >
                  CC
                </button>
              </div>
            )}
          </div>

          {/* Bottom-left Quick Action Buttons (Watch Later / Bookmark & Like) on hover */}
          {isHovered && !isLive && !compact && (
            <div 
              className={`${compactMobile ? 'hidden sm:flex' : 'flex'} absolute bottom-2 left-2 items-center gap-1.5 z-30 animate-in fade-in duration-150`}
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

          {/* Bottom-right: PREMIUM Badge on desktop or Duration Badge */}
          {borderConfig.variant === 'premium' ? (
            <>
              {!compact && (
                <div className={`${compactMobile ? 'hidden sm:flex' : 'flex'} absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black text-[10px] font-black tracking-wide shadow-lg border border-amber-200/50 items-center gap-1 z-20`}>
                  <span>👑</span>
                  <span>PREMIUM</span>
                </div>
              )}
              {(compact || compactMobile) && (
                <div className={`${compact ? 'block' : 'block sm:hidden'} absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[9.5px] font-mono font-bold text-white border border-white/10 z-20 shadow`}>
                  {formatDuration(video.durationSeconds)}
                </div>
              )}
            </>
          ) : !isLive ? (
            <div className={`absolute rounded-md bg-black/85 backdrop-blur-sm font-mono font-bold text-white border border-white/10 z-20 shadow ${compact || compactMobile ? 'bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 py-0.5 text-[9.5px] sm:text-[10px]' : 'bottom-2 right-2 px-1.5 py-0.5 text-[10px]'}`}>
              {formatDuration(video.durationSeconds)}
            </div>
          ) : null}

          {/* Creator Overlay if requested */}
          {showCreatorOverlay && (
            <div className="absolute bottom-3 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 z-10 pointer-events-none">
              <img
                src={video.channelAvatar || createAvatarSvgDataUri(video.channelName)}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = createAvatarSvgDataUri(video.channelName);
                }}
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


