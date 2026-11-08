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
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { VideoItem, AdCampaign } from '../../types';
import { formatDuration } from '../../lib/i18n';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { ExternalLink } from 'lucide-react';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../../lib/mediaPlaceholders';
import { parseVideoSource } from '../../lib/videoUtils';
import { getVideoScenes, getActiveSceneForTime } from '../../lib/videoScenes';

interface VideoPlayerProps {
  video: VideoItem;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, autoPlay = true }) => {
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
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Smart Timeline Scrubber Hover Preview State
  const [scrubberHoverTime, setScrubberHoverTime] = useState<number | null>(null);
  const [scrubberHoverPercent, setScrubberHoverPercent] = useState<number | null>(null);
  const scenes = React.useMemo(() => getVideoScenes(video), [video]);
  const activeHoverScene = React.useMemo(() => 
    scrubberHoverTime !== null ? getActiveSceneForTime(scenes, scrubberHoverTime) : null,
    [scenes, scrubberHoverTime]
  );
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
    setHasRecordedView(false);
    setHasShownAdForVideo(false);

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
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full bg-black select-none transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none flex items-center justify-center overflow-hidden'
          : 'aspect-video-player rounded-none sm:rounded-2xl overflow-hidden shadow-2xl group'
      }`}
    >
      {/* HTML5 video element with Cloudflare Stream / CDN or Embedded YouTube/Vimeo/Streamtape/LuciferDonghua player */}
      {isEmbedVideo ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <iframe
            src={
              parsedSource.sourceType === 'youtube'
                ? `${parsedSource.embedUrl}?autoplay=${autoPlay ? 1 : 0}&enablejsapi=1&rel=0&modestbranding=1`
                : parsedSource.sourceType === 'vimeo'
                ? `${parsedSource.embedUrl}?autoplay=${autoPlay ? 1 : 0}`
                : (parsedSource.embedUrl || parsedSource.streamUrl)
            }
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"
          />
        </div>
      ) : (
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
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          className={`w-full h-full cursor-pointer ${
            isFullscreen ? 'max-h-screen object-contain' : 'object-contain'
          }`}
          playsInline
        />
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

      {/* Captions Overlay (Synchronized Kiswahili / English captions) */}
      {showCaptions && !isAdPlaying && !isEmbedVideo && (
        <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md text-amber-300 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm text-center pointer-events-none max-w-[90%] shadow-2xl border border-amber-500/30 transition-all duration-300">
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

      {/* Play/Pause Overlay indicator when clicking video */}
      {!isEmbedVideo && (
        <div 
          onClick={togglePlay}
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            !isPlaying ? 'opacity-100 bg-black/30' : 'opacity-0'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-xl shadow-[#FF3040]/50 transform transition hover:scale-110 pointer-events-auto cursor-pointer">
            <Play className="w-7 h-7 ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* Main Video Controls Container (Strictly Hidden during In-Stream Ad or External Embed) */}
      {!isAdPlaying && !isEmbedVideo && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 md:px-5 py-3 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
        {/* Scrubber Progress bar with Smart Timeline Hover Preview */}
        <div 
          className="relative mb-2.5 flex items-center group/scrubber cursor-pointer py-1"
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
          {/* Smart Timeline Floating Hover Preview Popup with Live Video & Full Time */}
          {scrubberHoverPercent !== null && scrubberHoverTime !== null && (
            <div 
              className="absolute bottom-6 pointer-events-none z-50 transform -translate-x-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-100"
              style={{ left: `${Math.max(14, Math.min(86, scrubberHoverPercent))}%` }}
            >
              <div className="w-44 sm:w-52 aspect-video rounded-xl overflow-hidden bg-black/95 border-2 border-white/25 shadow-2xl relative ring-1 ring-black/80">
                {/* Fallback Static Thumbnail */}
                <img
                  src={video.thumbnailUrl || createThumbnailSvgDataUri(video.title, video.category)}
                  alt=""
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    hoverVideoLoaded && !hoverVideoError && !isEmbedVideo ? 'opacity-0' : 'opacity-100'
                  }`}
                />

                {/* Live Video Preview playing muted for 5–8 seconds in a loop */}
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
                    onTimeUpdate={() => {
                      if (hoverVideoRef.current && scrubberHoverTime !== null) {
                        const cur = hoverVideoRef.current.currentTime;
                        const loopDuration = 7; // 5–8 seconds loop
                        const loopEnd = Math.min(duration || 100, scrubberHoverTime + loopDuration);
                        if (cur >= loopEnd || cur < scrubberHoverTime - 0.5) {
                          hoverVideoRef.current.currentTime = scrubberHoverTime;
                        }
                      }
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                      hoverVideoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}

                {/* Exact full time badge: e.g. 0:14 / 0:21 */}
                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/90 backdrop-blur-md font-mono text-[10px] font-bold text-white shadow-lg border border-white/20 flex items-center gap-1">
                  <span className="text-[#FF3040]">{formatDuration(scrubberHoverTime)}</span>
                  <span className="text-white/60">/</span>
                  <span>{formatDuration(duration || video.durationSeconds || 0)}</span>
                </div>

                {/* Mini progress line at bottom of floating card */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF3040] to-amber-400"
                    style={{ width: `${scrubberHoverPercent}%` }}
                  />
                </div>
              </div>

              {/* Triangle pointer downward */}
              <div className="w-2.5 h-2.5 bg-black/95 border-r border-b border-white/25 transform rotate-45 -mt-1.5 shadow" />
            </div>
          )}

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 hover:h-2.5 transition-all bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF3040] focus:outline-none"
            style={{
              background: `linear-gradient(to right, #FF3040 0%, #FF3040 ${progressPercentage}%, rgba(255,255,255,0.2) ${progressPercentage}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 max-w-full overflow-visible">
          
          {/* Left Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button 
              onClick={togglePlay} 
              className="p-1 sm:p-1.5 hover:text-[#FF3040] transition-colors focus:outline-none cursor-pointer"
              title={isPlaying ? 'Sitisha (Space)' : 'Cheza (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />}
            </button>

            {/* Volume - Slider hidden on mobile, physical buttons used */}
            <div className="flex items-center gap-1 sm:gap-2 group/vol">
              <button 
                onClick={toggleMute} 
                className="p-1 sm:p-1.5 hover:text-[#FF3040] transition-colors cursor-pointer"
                title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden sm:block w-14 md:w-20 h-1 bg-white/30 rounded-lg appearance-none accent-[#FF3040] cursor-pointer"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[10px] sm:text-[11px] font-mono text-[#A7B0C0] shrink-0 whitespace-nowrap">
              <span className="text-white font-semibold">{formatDuration(currentTime)}</span>
              <span className="mx-0.5 sm:mx-1">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right Controls (CC, 1x Speed, Settings ⚙️, Fullscreen) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* 1. CC (Subtitles Button) */}
            <button
              onClick={() => setShowCaptions(prev => !prev)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                showCaptions 
                  ? 'text-black bg-[#FF3040] font-black shadow-md shadow-[#FF3040]/40' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="CC - Washa/Zima Manukuu (Subtitles)"
              aria-label="Washa au zima manukuu"
            >
              <Subtitles className="w-4 h-4" />
              <span className="text-[10px] font-bold">CC</span>
            </button>

            {/* 2. 1x Playback Speed Button & Menu */}
            <div className="relative">
              <button
                onClick={() => { 
                  setShowSpeedMenu(!showSpeedMenu); 
                  setShowSettingsMenu(false); 
                }}
                className={`px-2 py-1 rounded-lg hover:bg-white/10 transition-colors text-[11px] sm:text-xs font-bold font-mono cursor-pointer flex items-center gap-0.5 ${
                  playbackSpeed !== 1 ? 'text-[#FF3040] bg-white/10' : 'text-white/90'
                }`}
                title="1x - Kasi ya Video (Playback Speed)"
              >
                <span>{playbackSpeed}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-[#191E29] border border-[#262E3E] rounded-2xl shadow-2xl py-1.5 w-32 text-center z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] text-[#A7B0C0] font-bold border-b border-[#262E3E] flex items-center justify-between">
                    <span>KASI YA VIDEO</span>
                    <span className="text-amber-400 font-mono">{playbackSpeed}x</span>
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full py-1.5 px-3 text-xs flex items-center justify-between hover:bg-[#232A39] cursor-pointer transition-colors ${
                        playbackSpeed === s ? 'text-[#FF3040] font-extrabold bg-[#232A39]/60' : 'text-white'
                      }`}
                    >
                      <span>{s === 1 ? 'Kawaida (1x)' : `${s}x`}</span>
                      {playbackSpeed === s && <span className="w-1.5 h-1.5 rounded-full bg-[#FF3040]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Settings (⚙️) Button & Comprehensive Modal/Popover */}
            <div className="relative">
              <button
                onClick={() => { 
                  setShowSettingsMenu(!showSettingsMenu); 
                  setShowSpeedMenu(false); 
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showSettingsMenu ? 'text-[#FF3040] bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Settings (⚙️) - Mipangilio ya video"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              {showSettingsMenu && (
                <div className="absolute bottom-9 right-0 bg-[#191E29] border border-[#262E3E] rounded-2xl shadow-2xl p-3 w-56 sm:w-64 z-50 text-left animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262E3E]">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-[#FF3040]" />
                      Mipangilio ya Video
                    </span>
                    <button
                      onClick={() => setShowSettingsMenu(false)}
                      className="text-[#A7B0C0] hover:text-white text-xs px-1"
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

                  {/* Subtitles (CC) Toggle & Language */}
                  <div className="pt-2 border-t border-[#262E3E]/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-[#A7B0C0] uppercase tracking-wider">
                        Manukuu (CC)
                      </label>
                      <button
                        onClick={() => setShowCaptions(prev => !prev)}
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          showCaptions ? 'bg-[#16C784] text-black' : 'bg-[#232A39] text-[#A7B0C0]'
                        }`}
                      >
                        {showCaptions ? 'YAMEWASHWA' : 'YAMEZIMWA'}
                      </button>
                    </div>
                    {showCaptions && (
                      <div className="flex gap-1.5 mt-1">
                        <button
                          onClick={() => setCaptionLang('sw')}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            captionLang === 'sw' ? 'bg-[#FF3040] text-white' : 'bg-[#10131B] text-[#A7B0C0]'
                          }`}
                        >
                          Kiswahili
                        </button>
                        <button
                          onClick={() => setCaptionLang('en')}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            captionLang === 'en' ? 'bg-[#FF3040] text-white' : 'bg-[#10131B] text-[#A7B0C0]'
                          }`}
                        >
                          English
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Data Saver Toggle */}
                  <div className="pt-2 border-t border-[#262E3E]/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Bana Bando (Data Saver)</span>
                      <span className="text-[10px] text-[#A7B0C0]">Inatumia ubora wa 360p kuokoa MBs</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = !isDataSaverActive;
                        setIsDataSaverActive(next);
                        if (next) setSelectedQuality('360p');
                        else setSelectedQuality('Auto (1080p)');
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

            {/* 4. Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-lg transition-all focus:outline-none flex items-center gap-1 active:scale-95 cursor-pointer ${
                isFullscreen ? 'text-[#FF3040] bg-white/15 font-bold' : 'hover:text-[#FF3040] hover:bg-white/10'
              }`}
              title={isFullscreen ? 'Ondoa Skrini Nzima (Toka Fulu)' : 'Weka Skrini Nzima (Fulu)'}
              aria-label={isFullscreen ? 'Ondoa Skrini Nzima' : 'Weka Skrini Nzima'}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 text-[#FF3040]" />
                  <span className="hidden sm:inline text-[10px] text-[#FF3040] font-bold">Toka</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4" />
                  <span className="hidden sm:inline text-[10px] text-[#A7B0C0] font-semibold">Fulu</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
      )}
    </div>
  );
};
