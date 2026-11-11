import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  RotateCcw,
  RotateCw,
  Tv,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Check,
  PictureInPicture2,
  Copy,
  Wifi
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
  const { syncServerViews, recordView, adCampaigns, recordAdImpression, recordAdClick, isDataSaver, toggleDataSaver } = useVideo();
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
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<string>(isDataSaver ? '360p' : 'Auto (1080p)');
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [captionLang, setCaptionLang] = useState<'sw' | 'en'>('sw');
  const [hasRecordedView, setHasRecordedView] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [ambientImgError, setAmbientImgError] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Modern Mobile YouTube Controls State
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [showChaptersDrawer, setShowChaptersDrawer] = useState<boolean>(false);
  const [showCastModal, setShowCastModal] = useState<boolean>(false);
  const [castNotice, setCastNotice] = useState<string | null>(null);
  const [connectedCastDevice, setConnectedCastDevice] = useState<string | null>(null);
  const [isPiPActive, setIsPiPActive] = useState<boolean>(false);
  const [copiedCastLink, setCopiedCastLink] = useState<boolean>(false);
  const [playerToast, setPlayerToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  useEffect(() => {
    setSelectedQuality(isDataSaver ? '360p' : 'Auto (1080p)');
  }, [isDataSaver]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

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
      videoRef.current.playbackRate = playbackSpeed;
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
  };

  const handleNativeCastPrompt = async () => {
    setCastNotice(null);
    const el = videoRef.current as any;
    if (isEmbedVideo || !el) {
      setCastNotice('Video hii inachezwa kutoka kwa mtoa huduma wa nje (embed). Tumia ikoni ya Cast ndani ya kicheza video au nakili kiungo kufungua kwenye Smart TV.');
      return;
    }

    if (typeof el.webkitShowPlaybackTargetPicker === 'function') {
      try {
        el.webkitShowPlaybackTargetPicker();
        setConnectedCastDevice('AirPlay TV');
        triggerToast('AirPlay imefunguliwa');
        return;
      } catch {
        setCastNotice('AirPlay haipatikani kwenye kifaa hiki kwa sasa.');
        return;
      }
    }

    if (el.remote && typeof el.remote.prompt === 'function') {
      try {
        await el.remote.prompt();
        setConnectedCastDevice('Runinga / Chromecast');
        setShowCastModal(false);
        triggerToast('Imeunganishwa na Runinga');
      } catch (err: any) {
        const msg = err?.name === 'NotFoundError'
          ? 'Hakuna runinga yenye Chromecast iliyopatikana kwenye mtandao huu wa Wi-Fi.'
          : err?.name === 'NotAllowedError' || err?.name === 'NotSupportedError'
          ? 'Kivinjari kimezuia kutuma moja kwa moja ndani ya dirisha hili. Tumia Picture-in-Picture au nakili kiungo kwa Smart TV.'
          : 'Imeshindwa kutafuta vifaa vya TV kwenye mtandao huu.';
        setCastNotice(msg);
      }
      return;
    }

    setCastNotice('Kivinjari hiki hakiauni kutuma video moja kwa moja (Cast). Tumia Picture-in-Picture au nakili kiungo kucheza kwenye Smart TV.');
  };

  const handleTogglePictureInPicture = async () => {
    setCastNotice(null);
    const el = videoRef.current;
    if (isEmbedVideo || !el) {
      setCastNotice('Picture-in-Picture inafanya kazi kwenye video za moja kwa moja za Tazama.');
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
        triggerToast('Imetoka Picture-in-Picture');
      } else if (document.pictureInPictureEnabled && typeof el.requestPictureInPicture === 'function') {
        await el.requestPictureInPicture();
        setIsPiPActive(true);
        setShowCastModal(false);
        triggerToast('Inacheza kwenye dirisha dogo');
      } else {
        setCastNotice('Picture-in-Picture haipatikani kwenye kivinjari au dirisha hili.');
      }
    } catch {
      setCastNotice('Imeshindwa kuwasha Picture-in-Picture kwa sasa.');
    }
  };

  const handleCopyCastLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopiedCastLink(true);
    triggerToast('Kiungo kimenakiliwa');
    setTimeout(() => setCopiedCastLink(false), 1800);
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
    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    if (videoEl) {
      videoEl.addEventListener('webkitendfullscreen', handleVideoEndFullscreen);
      videoEl.addEventListener('enterpictureinpicture', handleEnterPiP);
      videoEl.addEventListener('leavepictureinpicture', handleLeavePiP);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleNativeFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleNativeFullscreenChange);
      if (videoEl) {
        videoEl.removeEventListener('webkitendfullscreen', handleVideoEndFullscreen);
        videoEl.removeEventListener('enterpictureinpicture', handleEnterPiP);
        videoEl.removeEventListener('leavepictureinpicture', handleLeavePiP);
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
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 left-0 right-0 p-2.5 sm:p-4 flex items-center justify-between z-30 transition-opacity duration-300 pointer-events-auto bg-gradient-to-b from-black/85 via-black/40 to-transparent ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Top Left: Down Chevron (Minimize / Rudi) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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
            {/* 1. Autoplay Toggle Switch Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCastNotice(null);
                setShowSettingsMenu(false);
                setShowChaptersDrawer(false);
                setShowCastModal(true);
              }}
              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer shadow-lg ${
                connectedCastDevice || isPiPActive
                  ? 'bg-[#16C784] border-[#16C784] text-black'
                  : 'bg-black/60 hover:bg-black/90 text-white border-white/20'
              }`}
              title="Tuma kwenye TV / Dirisha Dogo (Cast & PiP)"
            >
              <Tv className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* 3. CC (Subtitles) Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isEmbedVideo) {
                  triggerToast('Tumia alama ya CC ndani ya kicheza video chini kulia');
                  return;
                }
                setShowCaptions(prev => {
                  const next = !prev;
                  triggerToast(next ? `Manukuu (CC): ${captionLang === 'sw' ? 'Kiswahili' : 'English'}` : 'Manukuu yamezimwa');
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCastModal(false);
                setShowChaptersDrawer(false);
                setShowSettingsMenu(prev => !prev);
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
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 max-w-full"
        >
          {/* 1. Time Stamp */}
          <div className="text-[11px] sm:text-xs font-mono tabular-nums font-bold text-[#A7B0C0] shrink-0 whitespace-nowrap">
            <span className="text-white">{formatDuration(currentTime)}</span>
            <span className="mx-1 text-white/50">/</span>
            <span>{formatDuration(duration || video.durationSeconds || 0)}</span>
          </div>

          {/* 2. Active Chapter / Scene Pill Chip */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSettingsMenu(false);
              setShowCastModal(false);
              setShowChaptersDrawer(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium tracking-tight transition-all truncate max-w-[165px] sm:max-w-xs border border-white/10 active:scale-95 cursor-pointer shadow-md"
            title="Angalia Vipande vya Video (Chapters)"
          >
            <span className="truncate">{activeSceneTitle}</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
          </button>

          {/* 3. Fullscreen & Volume */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-all active:scale-95 cursor-pointer"
              title={isFullscreen ? 'Toka Skrini Nzima' : 'Weka Skrini Nzima'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-[#FF3040]" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Viewport-Safe Video Settings Sheet (Never clipped on mobile; works for both direct and embed videos) */}
      {showSettingsMenu && (
        <div
          onClick={() => setShowSettingsMenu(false)}
          className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm bg-white dark:bg-[#191E29] border-t sm:border border-slate-200 dark:border-[#262E3E] rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 max-h-[85dvh] overflow-y-auto text-left space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-[#262E3E]">
              <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#FF3040]" />
                Mipangilio ya Video
              </span>
              <button
                type="button"
                onClick={() => setShowSettingsMenu(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
                aria-label="Funga"
              >
                ✕
              </button>
            </div>

            {isEmbedVideo && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                Video hii inachezwa kutoka kwa mtoa huduma wa nje; kwa ubora na manukuu tumia pia ikoni ya gia ndani ya kicheza video chini kulia.
              </div>
            )}

            {/* Quality Selection */}
            {!isEmbedVideo && (
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-[#A7B0C0] uppercase tracking-wider block mb-2">
                  Ubora wa Picha (Quality)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Auto (1080p)', '1080p HD', '720p', '480p', '360p'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setSelectedQuality(q);
                        if (q === '360p' && !isDataSaver) toggleDataSaver();
                        else if (q !== '360p' && isDataSaver) toggleDataSaver();
                        setShowSettingsMenu(false);
                        triggerToast(`Ubora: ${q}`);
                      }}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer ${
                        selectedQuality === q 
                          ? 'bg-[#FF3040] text-white font-bold shadow-md shadow-[#FF3040]/25' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#10131B] dark:text-[#A7B0C0] dark:hover:text-white dark:hover:bg-[#232A39]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Speed Selection */}
            {!isEmbedVideo && (
              <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E]/70">
                <label className="text-[11px] font-bold text-slate-500 dark:text-[#A7B0C0] uppercase tracking-wider block mb-2">
                  Kasi ya Video (Playback Speed)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        changeSpeed(s);
                        setShowSettingsMenu(false);
                        triggerToast(`Kasi: ${s}x`);
                      }}
                      className={`px-2 py-2 rounded-xl text-center text-xs font-mono font-bold cursor-pointer transition-colors ${
                        playbackSpeed === s
                          ? 'bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/25'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#10131B] dark:text-[#A7B0C0] dark:hover:text-white'
                      }`}
                    >
                      {s === 1 ? '1x (Kawaida)' : `${s}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Captions Language */}
            {!isEmbedVideo && (
              <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E]/70">
                <label className="text-[11px] font-bold text-slate-500 dark:text-[#A7B0C0] uppercase tracking-wider block mb-2">
                  Manukuu (Subtitles / CC)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCaptions(false);
                      setShowSettingsMenu(false);
                      triggerToast('Manukuu yamezimwa');
                    }}
                    className={`px-2 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      !showCaptions
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                        : 'bg-slate-100 text-slate-700 dark:bg-[#10131B] dark:text-[#A7B0C0]'
                    }`}
                  >
                    Zima
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptionLang('sw');
                      setShowCaptions(true);
                      setShowSettingsMenu(false);
                      triggerToast('Manukuu: Kiswahili');
                    }}
                    className={`px-2 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      showCaptions && captionLang === 'sw'
                        ? 'bg-[#FF3040] text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-[#10131B] dark:text-[#A7B0C0]'
                    }`}
                  >
                    Kiswahili
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptionLang('en');
                      setShowCaptions(true);
                      setShowSettingsMenu(false);
                      triggerToast('Captions: English');
                    }}
                    className={`px-2 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      showCaptions && captionLang === 'en'
                        ? 'bg-[#FF3040] text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-[#10131B] dark:text-[#A7B0C0]'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            )}

            {/* Data Saver Toggle (Synced globally with VideoContext) */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E]/70 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Bana Bando (Data Saver)</span>
                <span className="text-[11px] text-slate-500 dark:text-[#A7B0C0]">360p kuokoa MBs kote kwenye app</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const willEnable = !isDataSaver;
                  toggleDataSaver();
                  setSelectedQuality(willEnable ? '360p' : 'Auto (1080p)');
                  triggerToast(willEnable ? 'Bana Bando: Imewashwa' : 'Bana Bando: Imezimwa');
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                  isDataSaver ? 'bg-[#16C784]' : 'bg-slate-300 dark:bg-[#262E3E]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isDataSaver ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Autoplay Next Video Toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E]/70 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Cheza Video Inayofuata</span>
                <span className="text-[11px] text-slate-500 dark:text-[#A7B0C0]">Autoplay video ikiisha</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAutoplayNext(prev => {
                    const next = !prev;
                    triggerToast(next ? 'Autoplay imewashwa' : 'Autoplay imezimwa');
                    return next;
                  });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                  autoplayNext ? 'bg-[#FF3040]' : 'bg-slate-300 dark:bg-[#262E3E]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  autoplayNext ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewport-Safe Chapters / Scenes Bottom Sheet */}
      {showChaptersDrawer && (
        <div
          onClick={() => setShowChaptersDrawer(false)}
          className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white dark:bg-[#141824] border-t sm:border border-slate-200 dark:border-white/15 rounded-t-3xl sm:rounded-3xl max-h-[75dvh] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  Vipande vya Video (Chapters)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-[#A7B0C0]">
                  Bofya kipande chochote kuruka moja kwa moja
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChaptersDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
                aria-label="Funga"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1">
              {scenes.map((sc, idx) => {
                const isActive = activeScene?.timeSeconds === sc.timeSeconds;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!isEmbedVideo && videoRef.current) {
                        videoRef.current.currentTime = sc.timeSeconds;
                        setCurrentTime(sc.timeSeconds);
                        if (videoRef.current.paused) {
                          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                        }
                      }
                      setShowChaptersDrawer(false);
                      triggerToast(`Kipande: ${sc.title}`);
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#FF3040]/15 border border-[#FF3040]/50 text-slate-900 dark:text-white' 
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 dark:bg-[#10131B] dark:hover:bg-[#1C2232] dark:border-white/5 dark:text-[#D1D7E0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-[#FF3040] text-white' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-[#A7B0C0]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-slate-900 dark:text-white">{sc.title}</div>
                        {sc.description && (
                          <div className="text-[11px] text-slate-500 dark:text-[#A7B0C0] truncate">{sc.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 dark:bg-white/10 text-[11px] font-mono font-bold dark:text-white shrink-0">
                      {formatDuration(sc.timeSeconds)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Viewport-Safe Cast to TV, Picture-in-Picture & Link Share Bottom Sheet (Real browser capabilities) */}
      {showCastModal && (
        <div
          onClick={() => setShowCastModal(false)}
          className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm bg-white dark:bg-[#181E29] border-t sm:border border-slate-200 dark:border-white/15 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-900 dark:text-white space-y-3.5 max-h-[85dvh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FF3040]/15 text-[#FF3040] flex items-center justify-center shrink-0">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Tazama Kwenye Skrini Nyingine</h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#A7B0C0]">Cast, AirPlay &amp; Picture-in-Picture</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCastModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
                aria-label="Funga"
              >
                ✕
              </button>
            </div>

            {castNotice && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                {castNotice}
              </div>
            )}

            <div className="space-y-2">
              {/* 1. Native Cast / AirPlay Trigger */}
              <button
                type="button"
                onClick={handleNativeCastPrompt}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  connectedCastDevice
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-[#16C784]/20 dark:border-[#16C784] dark:text-white'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-[#121622] dark:hover:bg-[#202737] dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Wifi className="w-5 h-5 text-[#FF3040] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {connectedCastDevice ? `Imeunganishwa: ${connectedCastDevice}` : 'Tafuta Runinga (Cast / AirPlay)'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#A7B0C0] truncate">
                      Chagua Smart TV au Chromecast kwenye Wi-Fi
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#FF3040] shrink-0">
                  {connectedCastDevice ? 'Badili' : 'Tafuta'}
                </span>
              </button>

              {/* 2. Real Picture-in-Picture Trigger */}
              <button
                type="button"
                onClick={handleTogglePictureInPicture}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isPiPActive
                    ? 'bg-emerald-50 border-emerald-400 dark:bg-[#16C784]/20 dark:border-[#16C784]'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-[#121622] dark:hover:bg-[#202737] dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PictureInPicture2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {isPiPActive ? 'Funga Dirisha Dogo (PiP)' : 'Dirisha Dogo (Picture-in-Picture)'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#A7B0C0]">
                      Endelea kutazama video ikielea juu ya skrini
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {isPiPActive ? 'Funga' : 'Washa'}
                </span>
              </button>

              {/* 3. Real Copy Link for Smart TV Browser */}
              <button
                type="button"
                onClick={handleCopyCastLink}
                className="w-full p-3 rounded-2xl border bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-[#121622] dark:hover:bg-[#202737] dark:border-white/10 text-left flex items-center justify-between gap-2 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {copiedCastLink ? (
                    <Check className="w-5 h-5 text-emerald-600 dark:text-[#16C784] shrink-0" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-600 dark:text-[#A7B0C0] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {copiedCastLink ? 'Kiungo Kimenakiliwa!' : 'Nakili Kiungo cha Video kwa TV'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#A7B0C0]">
                      Fungua kiungo hiki moja kwa moja kwenye kivinjari cha TV
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-[#CBD5E1] shrink-0">
                  {copiedCastLink ? 'Tayari' : 'Nakili'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCastModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
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
