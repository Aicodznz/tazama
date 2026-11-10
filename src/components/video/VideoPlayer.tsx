import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  Subtitles, 
  RotateCcw,
  RotateCw,
  Tv,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Check,
  Radio,
  Sliders
} from 'lucide-react';
import { VideoItem, AdCampaign } from '../../types';
import { formatDuration } from '../../lib/i18n';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../../lib/mediaPlaceholders';
import { parseVideoSource } from '../../lib/videoUtils';
import { getVideoScenes, getActiveSceneForTime } from '../../lib/videoScenes';

interface VideoPlayerProps {
  video: VideoItem;
  autoPlay?: boolean;
  onMinimize?: () => void;
  onNextVideo?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  autoPlay = true, 
  onMinimize,
  onNextVideo 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { syncServerViews, recordView, adCampaigns, recordAdImpression, recordAdClick } = useVideo();
  const { profile } = useAuth();

  // In-Stream Video Ad State
  const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);
  const [adTimeLeft, setAdTimeLeft] = useState<number>(10);
  const [adSkipCountdown, setAdSkipCountdown] = useState<number>(5);
  const [canSkipAd, setCanSkipAd] = useState<boolean>(false);
  const [hasShownAdForVideo, setHasShownAdForVideo] = useState<boolean>(false);

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(video.durationSeconds || 0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto (1080p)');
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [captionLang, setCaptionLang] = useState<'sw' | 'en'>('sw');
  const [isDataSaverActive, setIsDataSaverActive] = useState<boolean>(false);
  const [hasRecordedView, setHasRecordedView] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [ambientImgError, setAmbientImgError] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Modern Mobile YouTube Controls State (Matching screenshot with red arrows)
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [showChaptersDrawer, setShowChaptersDrawer] = useState<boolean>(false);
  const [showCastModal, setShowCastModal] = useState<boolean>(false);
  const [isScanningCast, setIsScanningCast] = useState<boolean>(true);
  const [connectedCastDevice, setConnectedCastDevice] = useState<string | null>(null);
  const [playerToast, setPlayerToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setPlayerToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setPlayerToast(null);
    }, 1800);
  };

  const handleSkipBackward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      const nextTime = Math.max(0, videoRef.current.currentTime - 10);
      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
      triggerToast('-10s');
    }
  };

  const handleSkipForward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      const maxTime = duration || video.durationSeconds || 100;
      const nextTime = Math.min(maxTime, videoRef.current.currentTime + 10);
      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
      triggerToast('+10s');
    }
  };

  // Smart Timeline Scrubber Hover Preview State
  const [scrubberHoverTime, setScrubberHoverTime] = useState<number | null>(null);
  const [scrubberHoverPercent, setScrubberHoverPercent] = useState<number | null>(null);
  const scenes = React.useMemo(() => getVideoScenes(video), [video]);
  const activeHoverScene = React.useMemo(() => 
    scrubberHoverTime !== null ? getActiveSceneForTime(scenes, scrubberHoverTime) : null,
    [scenes, scrubberHoverTime]
  );
  const activeScene = React.useMemo(() => {
    return getActiveSceneForTime(scenes, currentTime);
  }, [scenes, currentTime]);
  const activeSceneTitle = activeScene?.title || (scenes.length > 0 ? scenes[0].title : video.title);

  const [hoverVideoLoaded, setHoverVideoLoaded] = useState<boolean>(false);
  const [hoverVideoError, setHoverVideoError] = useState<boolean>(false);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);

  const parsedSource = React.useMemo(() => parseVideoSource(video.videoUrl), [video.videoUrl]);
  const isEmbedVideo = (
    parsedSource.sourceType === 'youtube' || 
    parsedSource.sourceType === 'vimeo' || 
    parsedSource.sourceType === 'embed'
  ) && !(isAdPlaying && activeAd);

  // Initialize Ad check when video changes (VIP users are ad-free)
  useEffect(() => {
    setVideoError(false);
    setAmbientImgError(false);
    setHasRecordedView(false);
    setHasShownAdForVideo(false);
    setHoverVideoLoaded(false);
    setHoverVideoError(false);
    setCurrentTime(0);
    setShowControls(true);

    const isVIP = profile?.premiumPlanId === 'plan-viewer-monthly' || profile?.premiumPlanId === 'plan-viewer-yearly';
    
    if (!isVIP) {
      // Find eligible active video ad (skippable, non-skippable, bumper, preroll)
      const eligibleAds = adCampaigns.filter(a => 
        a.status === 'active' && 
        ['skippable_instream', 'non_skippable_instream', 'bumper', 'preroll'].includes(a.adFormat) &&
        a.mediaType === 'video'
      );

      if (eligibleAds.length > 0) {
        // Pick one ad randomly or sequentially
        const chosenAd = eligibleAds[Math.floor(Math.random() * eligibleAds.length)];
        setActiveAd(chosenAd);
        setIsAdPlaying(true);
        const initialDuration = chosenAd.adFormat === 'bumper' ? 6 : chosenAd.adFormat === 'non_skippable_instream' ? 15 : 12;
        setAdTimeLeft(initialDuration);
        setAdSkipCountdown(5);
        setCanSkipAd(chosenAd.adFormat === 'bumper' ? false : false);
        recordAdImpression(chosenAd.id);
      } else {
        setActiveAd(null);
        setIsAdPlaying(false);
      }
    } else {
      setActiveAd(null);
      setIsAdPlaying(false);
    }
  }, [video.id, profile?.premiumPlanId, adCampaigns]);

  // Ad Timer Countdown Effect
  useEffect(() => {
    let timer: any = null;
    if (isAdPlaying && activeAd) {
      timer = setInterval(() => {
        setAdTimeLeft(prev => {
          if (prev <= 1) {
            handleCompleteAd();
            return 0;
          }
          return prev - 1;
        });

        setAdSkipCountdown(prev => {
          if (prev <= 1) {
            if (activeAd.adFormat !== 'non_skippable_instream' && activeAd.adFormat !== 'bumper') {
              setCanSkipAd(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAdPlaying, activeAd]);

  const handleSkipAd = () => {
    handleCompleteAd();
  };

  const handleCompleteAd = () => {
    setIsAdPlaying(false);
    setActiveAd(null);
    setHasShownAdForVideo(true);
    if (parsedSource.sourceType === 'direct' && videoRef.current) {
      videoRef.current.src = parsedSource.streamUrl || video.videoUrl;
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleAdCtaClick = () => {
    if (activeAd) {
      recordAdClick(activeAd.id);
      window.open(activeAd.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Playback session state (YouTube-standard real playback event & server heartbeat verification)
  const playbackSessionIdRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  const hasAwardedViewRef = useRef<boolean>(false);
  const isStartingSessionRef = useRef<boolean>(false);

  // Helper for persistent device identity (Multi-device / guest recognition)
  const getDeviceId = () => {
    try {
      let id = localStorage.getItem('tazama_device_id');
      if (!id) {
        id = 'tz_dev_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('tazama_device_id', id);
      }
      return id;
    } catch {
      return 'tz_dev_anon';
    }
  };

  // Start playback session on server when playback starts
  const startPlaybackSession = async () => {
    if (playbackSessionIdRef.current || isStartingSessionRef.current || !video?.id) return;
    isStartingSessionRef.current = true;
    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(video.id)}/playback-session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerUid: profile?.uid || null,
          viewerChannelId: profile?.channelId || null,
          viewerName: profile?.displayName || null,
          deviceId: getDeviceId(),
          duration: video.durationSeconds || duration || 0,
          initialTime: videoRef.current?.currentTime || 0
        })
      });
      const data = await res.json();
      if (data && data.success && data.sessionId) {
        playbackSessionIdRef.current = data.sessionId;
      }
    } catch (err) {
      console.warn('Playback session start notice:', err);
    } finally {
      isStartingSessionRef.current = false;
    }
  };

  // Send periodic or event-driven heartbeat to server
  const sendHeartbeat = async (eventType?: string) => {
    const sId = playbackSessionIdRef.current;
    if (!sId || !video?.id) return;

    const currTime = videoRef.current ? videoRef.current.currentTime : currentTime;
    const isActuallyPlaying = videoRef.current 
      ? (!videoRef.current.paused && !videoRef.current.ended && !videoRef.current.seeking)
      : isPlaying;
    const currentRate = videoRef.current ? videoRef.current.playbackRate : playbackSpeed;

    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(video.id)}/playback-heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sId,
          currentTime: currTime,
          playbackRate: currentRate || 1,
          isPlaying: isActuallyPlaying,
          eventType
        })
      });
      const data = await res.json();
      if (data && data.success) {
        if (data.viewAwarded && !hasAwardedViewRef.current && typeof data.viewsCount === 'number') {
          hasAwardedViewRef.current = true;
          setHasRecordedView(true);
          syncServerViews(video.id, data.viewsCount, data.uniqueViewers, data.watchTimeSeconds);
        }
      }
    } catch {
      // Jitter will catch up on next tick
    }
  };

  const startHeartbeatLoop = () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        sendHeartbeat('tick');
      }
    }, 2000);
  };

  const stopHeartbeatLoop = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    if (!playbackSessionIdRef.current) {
      startPlaybackSession().then(() => {
        startHeartbeatLoop();
        sendHeartbeat('play');
      });
    } else {
      startHeartbeatLoop();
      sendHeartbeat('play');
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    stopHeartbeatLoop();
    sendHeartbeat('pause');
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    stopHeartbeatLoop();
    sendHeartbeat('ended');
    if (isAdPlaying) {
      handleCompleteAd();
    } else if (autoplayNext && onNextVideo) {
      triggerToast('Inacheza video inayofuata...');
      setTimeout(() => {
        onNextVideo();
      }, 1500);
    }
  };

  const handleVideoSeeking = () => {
    sendHeartbeat('seeking');
  };

  const handleVideoSeeked = () => {
    sendHeartbeat('seeked');
  };

  // Video change lifecycle
  useEffect(() => {
    stopHeartbeatLoop();
    playbackSessionIdRef.current = null;
    hasAwardedViewRef.current = false;
    isStartingSessionRef.current = false;
    setHasRecordedView(false);

    if (autoPlay && !isAdPlaying && !isEmbedVideo) {
      startPlaybackSession().then(() => {
        startHeartbeatLoop();
      });
    }

    return () => {
      stopHeartbeatLoop();
    };
  }, [video.id, isAdPlaying]);

  // Fallback for embed videos (YouTube/Vimeo embeds without direct HTML5 video element)
  useEffect(() => {
    if (isEmbedVideo && !hasRecordedView && video?.id) {
      const timer = setTimeout(() => {
        setHasRecordedView(true);
        recordView(video.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isEmbedVideo, hasRecordedView, video?.id, recordView]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Play interrupted or unsupported source:', err);
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.durationSeconds);
      if (autoPlay) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(false);
            }
          });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    const isCurrentlyNative = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (!isFullscreen && !isCurrentlyNative) {
      // Attempt native fullscreen if allowed by browser/host iframe
      try {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((videoRef.current as any)?.webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
      } catch (err) {
        // Fallback gracefully to viewport fullscreen
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      } catch (err) {}
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen state with browser native events
  useEffect(() => {
    const handleNativeFullscreenChange = () => {
      const isNative = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      if (!isNative && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleNativeFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleNativeFullscreenChange);

    const videoEl = videoRef.current;
    const handleVideoEndFullscreen = () => {
      setIsFullscreen(false);
    };
    if (videoEl) {
      videoEl.addEventListener('webkitendfullscreen', handleVideoEndFullscreen);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleNativeFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleNativeFullscreenChange);
      if (videoEl) {
        videoEl.removeEventListener('webkitendfullscreen', handleVideoEndFullscreen);
      }
    };
  }, [isFullscreen]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen]);

  // Auto-hide HUD controls smoothly during active playback
  useEffect(() => {
    if (isPlaying && showControls && !showSettingsMenu && !showChaptersDrawer && !showCastModal) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showControls, showSettingsMenu, showChaptersDrawer, showCastModal]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettingsMenu && !showChaptersDrawer && !showCastModal) {
        setShowControls(false);
      }
    }, 3500);
  };

  const handleVideoSurfaceClick = () => {
    if (!showControls && isPlaying) {
      handleMouseMove();
      return;
    }
    togglePlay();
    handleMouseMove();
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      onMouseLeave={() =>
        isPlaying && !showSettingsMenu && !showChaptersDrawer && !showCastModal && setShowControls(false)
      }
      className={`relative w-full bg-[#07090E] select-none transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none flex items-center justify-center overflow-hidden'
          : 'aspect-video-player rounded-none sm:rounded-2xl overflow-hidden sm:shadow-2xl group'
      }`}
    >
      {/* HTML5 video element with Cloudflare Stream / CDN or Embedded YouTube/Vimeo/Streamtape/LuciferDonghua player */}
      {isEmbedVideo ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          {parsedSource.sourceType === 'youtube' ? (
            <iframe
              src={`${parsedSource.embedUrl}?autoplay=${autoPlay ? 1 : 0}&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : parsedSource.sourceType === 'vimeo' ? (
            <iframe
              src={`${parsedSource.embedUrl}?autoplay=${autoPlay ? 1 : 0}`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <iframe
              src={parsedSource.embedUrl || parsedSource.streamUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"
            />
          )}
        </div>
      ) : (
        <>
          {/* Soft Cinema Ambient Backdrop so narrow/square clips blend smoothly instead of sitting in a stark black void */}
          {!isFullscreen && !isAdPlaying && !videoError && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              {video.thumbnailUrl && !ambientImgError && (
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setAmbientImgError(true)}
                  className="w-full h-full object-cover blur-2xl scale-110 opacity-40 saturate-125"
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(18, 22, 34, 0.38) 0%, rgba(7, 9, 14, 0.88) 85%)',
                }}
              />
            </div>
          )}

          <video
            ref={videoRef}
            src={isAdPlaying && activeAd ? activeAd.mediaUrl : (parsedSource.sourceType === 'direct' ? (parsedSource.streamUrl || video.videoUrl) : '')}
            poster={isAdPlaying && activeAd ? undefined : video.thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onSeeking={handleVideoSeeking}
            onSeeked={handleVideoSeeked}
            onEnded={handleVideoEnded}
            onError={(e) => {
              console.warn('Video element source error:', e);
              setVideoError(true);
              setIsPlaying(false);
              stopHeartbeatLoop();
            }}
            onClick={handleVideoSurfaceClick}
            onDoubleClick={toggleFullscreen}
            className={`relative z-10 w-full h-full cursor-pointer object-contain ${
              isFullscreen ? 'max-h-screen' : ''
            }`}
            playsInline
          />
        </>
      )}

      {/* Video Source Error Fallback UI */}
      {videoError && !isEmbedVideo && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Hitilafu ya Chanzo cha Video</h4>
            <p className="text-xs text-[#A7B0C0] max-w-sm">
              Faili la video hii haliwezi kuchezwa moja kwa moja au bado linachakatwa na seva.
            </p>
          </div>
          <button
            onClick={() => {
              setVideoError(false);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="px-4 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF3040]/30"
          >
            Jaribu Tena (Retry)
          </button>
        </div>
      )}

      {/* IN-STREAM AD OVERLAY UI (Dedicated YouTube In-Stream Ad Mode) */}
      {isAdPlaying && activeAd && (
        <div className="absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 pointer-events-none select-none">
          
          {/* Top Bar: Ad Badge & Quick Ad Controls */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg">
                Tangazo &bull; 1 kati ya 1
              </span>
              <span className="text-xs text-white font-bold drop-shadow truncate max-w-[160px] sm:max-w-xs">
                {activeAd.advertiserName || activeAd.creatorName}
              </span>
            </div>

            {/* Top Right Controls (Mute & Fullscreen for ad) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
                title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 sm:p-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
                title="Skrini Nzima"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
              </button>
            </div>
          </div>

          {/* Bottom Bar: Sponsor Banner (Left) and Skip Button (Right) */}
          <div className="flex items-end justify-between gap-2 sm:gap-3 pointer-events-auto mb-2 sm:mb-3">
            
            {/* Sponsor Companion Card */}
            <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/35 shadow-2xl min-w-0 flex-1 max-w-[calc(100%-95px)] sm:max-w-md">
              <img
                src={createAvatarSvgDataUri(activeAd.advertiserName || activeAd.creatorName)}
                alt=""
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 ring-1 ring-amber-500/40"
              />
              <div className="min-w-0 flex-1 pr-1">
                <h4 className="text-[11px] sm:text-xs font-black text-white truncate">
                  {activeAd.headline}
                </h4>
                <p className="text-[10px] text-amber-300 font-mono truncate hidden sm:block">
                  {(activeAd.destinationUrl || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '')}
                </p>
              </div>

              <button
                onClick={handleAdCtaClick}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black text-[11px] sm:text-xs font-black shrink-0 flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>{activeAd.ctaText || 'Tembelea'}</span>
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* Skip Ad Button / Countdown */}
            <div className="shrink-0">
              {canSkipAd ? (
                <button
                  onClick={handleSkipAd}
                  className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-black/90 hover:bg-[#FF3040] text-white border border-white/30 text-xs sm:text-sm font-black shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer backdrop-blur-md whitespace-nowrap"
                >
                  <span>Ruka Tangazo</span>
                  <span className="text-amber-300 font-bold">&rarr;</span>
                </button>
              ) : (
                <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/85 border border-white/20 text-white font-mono text-[11px] sm:text-xs flex items-center gap-1.5 backdrop-blur-md shadow-xl whitespace-nowrap">
                  <span className="text-[#A7B0C0] text-[10px] sm:text-xs">Ruka:</span>
                  <strong className="text-amber-400 font-bold">{adSkipCountdown}s</strong>
                </div>
              )}
            </div>

          </div>

          {/* Dedicated Yellow Ad Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 pointer-events-none">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, ((15 - adTimeLeft) / 15) * 100))}%` }}
            />
          </div>

        </div>
      )}

      {/* Floating Exit Fullscreen Button in Fullscreen Mode */}
      {isFullscreen && !isAdPlaying && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 shadow-2xl flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all backdrop-blur-md"
          title="Toka Skrini Nzima (Funga)"
        >
          <Minimize className="w-4 h-4 text-[#FF3040]" />
          <span>Toka Fulu</span>
        </button>
      )}

      {/* Top Bar Video Controls (Minimalist YouTube Mobile overlay: ChevronDown, Autoplay toggle, Cast, CC, Settings) */}
      {!isAdPlaying && (
        <div 
          className={`absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between z-30 transition-opacity duration-300 pointer-events-auto bg-gradient-to-b from-black/85 via-black/40 to-transparent ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Top Left: Down Chevron (Minimize / Rudi) */}
          <button
            onClick={() => {
              if (onMinimize) onMinimize();
              else if (window.history.length > 1) window.history.back();
            }}
            className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 transition-all active:scale-90 cursor-pointer shadow-lg"
            title="Punguza Video / Rudi (Minimize)"
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Top Right Controls: Autoplay pill, Cast, CC, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 1. Autoplay Toggle Switch Pill: [ ▶ | ● ] */}
            <button
              onClick={() => {
                setAutoplayNext(prev => {
                  const next = !prev;
                  triggerToast(next ? 'Autoplay imewashwa' : 'Autoplay imezimwa');
                  return next;
                });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-lg active:scale-95 ${
                autoplayNext 
                  ? 'bg-black/70 border-white/30 text-white' 
                  : 'bg-black/40 border-white/10 text-white/50'
              }`}
              title={autoplayNext ? 'Autoplay: Imewashwa' : 'Autoplay: Imezimwa'}
            >
              <Play className={`w-3 h-3 fill-current ${autoplayNext ? 'text-white' : 'text-white/40'}`} />
              <div className={`w-5 h-2.5 rounded-full p-0.5 transition-colors ${autoplayNext ? 'bg-white' : 'bg-white/20'}`}>
                <div className={`w-1.5 h-1.5 rounded-full transition-transform ${autoplayNext ? 'bg-black translate-x-2.5' : 'bg-white translate-x-0'}`} />
              </div>
            </button>

            {/* 2. Cast / TV Button */}
            <button
              onClick={() => {
                setIsScanningCast(true);
                setShowCastModal(true);
              }}
              className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/20 transition-all active:scale-90 cursor-pointer shadow-lg"
              title="Tuma kwenye TV (Cast / AirPlay)"
            >
              <Tv className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* 3. CC (Subtitles) Button */}
            <button
              onClick={() => {
                setShowCaptions(prev => {
                  const next = !prev;
                  triggerToast(next ? 'Manukuu (CC): Kiswahili' : 'Manukuu yamezimwa');
                  return next;
                });
              }}
              className={`px-2 py-1 rounded-lg border text-xs font-black transition-all active:scale-90 cursor-pointer shadow-lg ${
                showCaptions 
                  ? 'bg-[#FF3040] border-[#FF3040] text-white shadow-[#FF3040]/40' 
                  : 'bg-black/60 hover:bg-black/90 border-white/20 text-white/80'
              }`}
              title="Manukuu (CC Subtitles)"
            >
              CC
            </button>

            {/* 4. Settings Gear Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettingsMenu(prev => !prev);
                  setShowSpeedMenu(false);
                }}
                className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md text-white border transition-all active:scale-90 cursor-pointer shadow-lg ${
                  showSettingsMenu 
                    ? 'bg-[#FF3040] border-[#FF3040]' 
                    : 'bg-black/60 hover:bg-black/90 border-white/20'
                }`}
                title="Mipangilio ya Video (Settings)"
              >
                <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Video Controls: 10s Rewind, Big Center Play/Pause, 10s Fast-Forward */}
      {!isAdPlaying && !isEmbedVideo && (
        <div 
          className={`absolute inset-0 flex items-center justify-center gap-7 sm:gap-14 pointer-events-none transition-opacity duration-300 z-20 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* 10s Rewind Circular Button */}
          <button
            onClick={handleSkipBackward}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex flex-col items-center justify-center shadow-2xl pointer-events-auto cursor-pointer transition-all active:scale-90 group"
            title="Rudi Nyuma Sekunde 10 (-10s)"
          >
            <RotateCcw className="w-5 h-5 sm:w-7 sm:h-7 group-hover:-rotate-45 transition-transform" />
            <span className="text-[9px] sm:text-[11px] font-black font-mono -mt-0.5">10</span>
          </button>

          {/* Big Center Play / Pause Button */}
          <button 
            onClick={togglePlay}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md border-2 border-white/30 text-white flex items-center justify-center shadow-2xl pointer-events-auto cursor-pointer transform transition-all active:scale-90 hover:scale-105"
            title={isPlaying ? 'Sitisha (Pause)' : 'Cheza (Play)'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white" />
            ) : (
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white ml-1" />
            )}
          </button>

          {/* 10s Fast-Forward Circular Button */}
          <button
            onClick={handleSkipForward}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex flex-col items-center justify-center shadow-2xl pointer-events-auto cursor-pointer transition-all active:scale-90 group"
            title="Nenda Mbele Sekunde 10 (+10s)"
          >
            <RotateCw className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-45 transition-transform" />
            <span className="text-[9px] sm:text-[11px] font-black font-mono -mt-0.5">10</span>
          </button>
        </div>
      )}

      {/* Captions Overlay (Synchronized Kiswahili / English captions) */}
      {showCaptions && !isAdPlaying && !isEmbedVideo && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md text-amber-300 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm text-center pointer-events-none max-w-[90%] shadow-2xl border border-amber-500/30 transition-all duration-300 z-20">
          <span className="text-[10px] text-white/70 block uppercase font-mono tracking-wider mb-0.5">
            CC &bull; {captionLang === 'sw' ? 'Kiswahili' : 'English'}
          </span>
          {currentTime < 4
            ? (captionLang === 'sw' ? 'Habari za leo! Karibu kwenye Tazama Tanzania.' : 'Hello! Welcome to Tazama Tanzania.')
            : currentTime < 9
            ? (captionLang === 'sw' ? 'Tazama video na filamu bora zaidi za waumbaji wetu.' : 'Watch the best video and film creations from our talent.')
            : currentTime < 15
            ? (captionLang === 'sw' ? 'Gonga Like, Fuatilia chaneli, na acha maoni yako hapa chini.' : 'Hit Like, Subscribe to the channel, and leave your thoughts.')
            : currentTime < 22
            ? (captionLang === 'sw' ? 'Tuma Zawadi (Gifts) kusaidia sanaa na kazi ya muumbaji.' : 'Send Gifts to directly support the artist and their work.')
            : (captionLang === 'sw' ? 'Asante sana kwa kutazama kupitia Tazama!' : 'Thank you for watching on Tazama!')
          }
        </div>
      )}

      {/* Subtle Bottom Progress Line when HUD Controls Auto-Hide */}
      {!isAdPlaying && !isEmbedVideo && !videoError && !showControls && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15 z-20 pointer-events-none">
          <div
            className="h-full bg-[#FF3040] transition-[width] duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>
      )}

      {/* Main Video Controls Container (Strictly Hidden during In-Stream Ad or External Embed) */}
      {!isAdPlaying && !isEmbedVideo && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 md:px-5 py-2.5 sm:py-3 transition-opacity duration-300 z-20 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
        {/* Scrubber Progress bar with Smart Timeline Hover Preview & Glowing Red Knob */}
        <div 
          className="relative mb-2 flex items-center group/scrubber cursor-pointer py-2 sm:py-1.5"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const percent = (offsetX / rect.width) * 100;
            const time = (offsetX / rect.width) * (duration || video.durationSeconds || 100);
            setScrubberHoverPercent(percent);
            setScrubberHoverTime(time);
            if (hoverVideoRef.current && !isEmbedVideo && !hoverVideoError) {
              try {
                hoverVideoRef.current.currentTime = time;
                hoverVideoRef.current.play().catch(() => {});
              } catch {}
            }
          }}
          onMouseLeave={() => {
            setScrubberHoverPercent(null);
            setScrubberHoverTime(null);
            if (hoverVideoRef.current) {
              try {
                hoverVideoRef.current.pause();
              } catch {}
            }
          }}
        >
          {/* Smart Timeline Floating Hover Preview Popup */}
          {scrubberHoverPercent !== null && scrubberHoverTime !== null && (
            <div 
              className="absolute bottom-6 pointer-events-none z-50 transform -translate-x-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-100"
              style={{ left: `${Math.max(14, Math.min(86, scrubberHoverPercent))}%` }}
            >
              <div className="w-44 sm:w-52 aspect-video rounded-xl overflow-hidden bg-black/95 border-2 border-white/25 shadow-2xl relative ring-1 ring-black/80">
                <img
                  src={video.thumbnailUrl || createThumbnailSvgDataUri(video.title, video.category)}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = createThumbnailSvgDataUri(video.title, video.category);
                  }}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    hoverVideoLoaded && !hoverVideoError && !isEmbedVideo ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {!isEmbedVideo && !hoverVideoError && (
                  <video
                    ref={hoverVideoRef}
                    src={parsedSource.streamUrl || video.videoUrl}
                    muted
                    playsInline
                    loop
                    preload="auto"
                    onLoadedData={() => setHoverVideoLoaded(true)}
                    onError={() => setHoverVideoError(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                      hoverVideoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/90 backdrop-blur-md font-mono text-[10px] font-bold text-white shadow-lg border border-white/20 flex items-center gap-1">
                  <span className="text-[#FF3040]">{formatDuration(scrubberHoverTime)}</span>
                  <span className="text-white/60">/</span>
                  <span>{formatDuration(duration || video.durationSeconds || 0)}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF3040] to-amber-400"
                    style={{ width: `${scrubberHoverPercent}%` }}
                  />
                </div>
              </div>
              <div className="w-2.5 h-2.5 bg-black/95 border-r border-b border-white/25 transform rotate-45 -mt-1.5 shadow" />
            </div>
          )}

          {/* Visual Scrubber Track */}
          <div className="relative w-full h-1 group-hover/scrubber:h-1.5 transition-all bg-white/20 rounded-full">
            {/* Red played line */}
            <div 
              className="absolute top-0 left-0 bottom-0 bg-[#FF3040] rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Red circular dot knob (thumb) highlighted by red arrow in screenshot */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#FF3040] shadow-md shadow-[#FF3040]/80 ring-2 ring-white pointer-events-none transform -translate-x-1/2 transition-transform duration-75 group-hover/scrubber:scale-125"
              style={{ left: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Bottom Control Bar: Time, Chapter Chip, Fullscreen */}
        <div className="flex items-center justify-between text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 max-w-full">
          {/* 1. Time Stamp */}
          <div className="text-[11px] sm:text-xs font-mono tabular-nums font-bold text-[#A7B0C0] shrink-0 whitespace-nowrap">
            <span className="text-white">{formatDuration(currentTime)}</span>
            <span className="mx-1 text-white/50">/</span>
            <span>{formatDuration(duration || video.durationSeconds || 0)}</span>
          </div>

          {/* 2. Active Chapter / Scene Pill Chip (Find a model that fits your RAM >) */}
          <button 
            onClick={() => setShowChaptersDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium tracking-tight transition-all truncate max-w-[170px] sm:max-w-xs border border-white/10 active:scale-95 cursor-pointer shadow-md"
            title="Angalia Vipande vya Video (Chapters)"
          >
            <span className="truncate">{activeSceneTitle}</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
          </button>

          {/* 3. Fullscreen & Volume */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button 
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-all active:scale-95 cursor-pointer"
              title={isFullscreen ? 'Toka Skrini Nzima' : 'Weka Skrini Nzima'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-[#FF3040]" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Speed & Settings Flyout (kept accessible when user clicks Settings gear) */}
        {showSettingsMenu && (
          <div className="absolute bottom-14 right-2 bg-[#191E29] border border-[#262E3E] rounded-2xl shadow-2xl p-3.5 w-60 z-50 text-left animate-in fade-in zoom-in-95 duration-150 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#262E3E]">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-[#FF3040]" />
                Mipangilio ya Video
              </span>
              <button
                onClick={() => setShowSettingsMenu(false)}
                className="text-[#A7B0C0] hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quality Selection */}
            <div>
              <label className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block mb-1">
                Ubora wa Picha (Quality)
              </label>
              <div className="grid grid-cols-2 gap-1">
                {['Auto (1080p)', '1080p HD', '720p', '480p', '360p'].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setSelectedQuality(q);
                      if (q === '360p') setIsDataSaverActive(true);
                      setShowSettingsMenu(false);
                      triggerToast(`Ubora: ${q}`);
                    }}
                    className={`text-left px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedQuality === q 
                        ? 'bg-[#FF3040] text-white font-bold' 
                        : 'bg-[#10131B] text-[#A7B0C0] hover:text-white hover:bg-[#232A39]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Selection */}
            <div className="pt-2 border-t border-[#262E3E]/70">
              <label className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider block mb-1">
                Kasi ya Video (Speed)
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      changeSpeed(s);
                      setShowSettingsMenu(false);
                      triggerToast(`Kasi: ${s}x`);
                    }}
                    className={`px-1.5 py-1 rounded-lg text-center text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                      playbackSpeed === s ? 'bg-[#FF3040] text-white' : 'bg-[#10131B] text-[#A7B0C0] hover:text-white'
                    }`}
                  >
                    {s === 1 ? '1x (Kawaida)' : `${s}x`}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Saver Toggle */}
            <div className="pt-2 border-t border-[#262E3E]/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Bana Bando (Data Saver)</span>
                <span className="text-[10px] text-[#A7B0C0]">360p kuokoa MBs</span>
              </div>
              <button
                onClick={() => {
                  const next = !isDataSaverActive;
                  setIsDataSaverActive(next);
                  if (next) setSelectedQuality('360p');
                  else setSelectedQuality('Auto (1080p)');
                  triggerToast(next ? 'Bana Bando: Imewashwa' : 'Bana Bando: Imezimwa');
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isDataSaverActive ? 'bg-[#16C784]' : 'bg-[#262E3E]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isDataSaverActive ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        )}

      </div>
      )}

      {/* Chapters / Scenes Drawer Modal */}
      {showChaptersDrawer && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in">
          <div className="bg-[#141824] border-t border-white/15 rounded-t-3xl max-h-[75%] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Vipande vya Video (Chapters & Scenes)
                </h4>
                <p className="text-[11px] text-[#A7B0C0]">
                  Bofya kipande chochote kuruka moja kwa moja
                </p>
              </div>
              <button
                onClick={() => setShowChaptersDrawer(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-2 space-y-1.5 flex-1 pr-1">
              {scenes.map((sc, idx) => {
                const isActive = activeScene?.timeSeconds === sc.timeSeconds;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = sc.timeSeconds;
                        setCurrentTime(sc.timeSeconds);
                      }
                      setShowChaptersDrawer(false);
                      triggerToast(`Kipande: ${sc.title}`);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#FF3040]/20 border border-[#FF3040]/50 text-white' 
                        : 'bg-[#10131B] hover:bg-[#1C2232] border border-white/5 text-[#D1D7E0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-[#FF3040] text-white' : 'bg-white/10 text-[#A7B0C0]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="text-xs font-bold truncate text-white">{sc.title}</div>
                        {sc.description && (
                          <div className="text-[10px] text-[#A7B0C0] truncate">{sc.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-mono font-bold text-white shrink-0">
                      {formatDuration(sc.timeSeconds)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cast to TV Modal */}
      {showCastModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181E29] border border-white/15 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#FF3040]/20 text-[#FF3040] flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Tuma Kwenye Runinga</h4>
                  <p className="text-[10px] text-[#A7B0C0]">Cast / AirPlay / Smart TV</p>
                </div>
              </div>
              <button
                onClick={() => setShowCastModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scanning & Devices */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A7B0C0] px-1">
                <span>Vifaa vilivyopatikana:</span>
                <span className="flex items-center gap-1 text-[#16C784] font-medium text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#16C784] animate-pulse" />
                  Inatafuta...
                </span>
              </div>

              {[
                { id: 'dev-1', name: 'Samsung Crystal 4K UHD TV', room: 'Sebuleni', type: 'Smart TV' },
                { id: 'dev-2', name: 'LG webOS AI ThinQ 55"', room: 'Chumba cha Wageni', type: 'AirPlay 2' },
                { id: 'dev-3', name: 'Chromecast with Google TV', room: 'HDMI 1', type: 'Google Cast' }
              ].map(dev => (
                <button
                  key={dev.id}
                  onClick={() => {
                    setConnectedCastDevice(dev.name);
                    setShowCastModal(false);
                    triggerToast(`Imeunganishwa na ${dev.name}`);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    connectedCastDevice === dev.name
                      ? 'bg-[#16C784]/20 border-[#16C784] text-white'
                      : 'bg-[#121622] hover:bg-[#202737] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tv className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">{dev.name}</div>
                      <div className="text-[10px] text-[#A7B0C0]">{dev.room} &bull; {dev.type}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#FF3040]">
                    {connectedCastDevice === dev.name ? 'Imeunganishwa' : 'Unganisha'}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCastModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Funga
            </button>
          </div>
        </div>
      )}

      {/* Floating Center Toast Feedback (e.g. -10s, +10s, Autoplay imewashwa) */}
      {playerToast && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-black shadow-2xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{playerToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};
