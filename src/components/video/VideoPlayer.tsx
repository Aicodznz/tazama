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
  Sparkles
} from 'lucide-react';
import { VideoItem, AdCampaign } from '../../types';
import { formatDuration } from '../../lib/i18n';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  video: VideoItem;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { recordView, adCampaigns, recordAdImpression, recordAdClick } = useVideo();
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
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto (1080p)');
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [hasRecordedView, setHasRecordedView] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Initialize Ad check when video changes (VIP users are ad-free)
  useEffect(() => {
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
    if (videoRef.current) {
      videoRef.current.src = video.videoUrl;
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

  // Deduplicated view increment: record after 5 seconds of active watch
  useEffect(() => {
    setHasRecordedView(false);
  }, [video.id]);

  useEffect(() => {
    if (currentTime >= 5 && !hasRecordedView) {
      setHasRecordedView(true);
      recordView(video.id);
    }
  }, [currentTime, hasRecordedView, video.id, recordView]);

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
      {/* HTML5 video element with Cloudflare Stream / CDN or Ad source */}
      <video
        ref={videoRef}
        src={isAdPlaying && activeAd ? activeAd.mediaUrl : video.videoUrl}
        poster={isAdPlaying && activeAd ? undefined : video.thumbnailUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (isAdPlaying) {
            handleCompleteAd();
          } else {
            setIsPlaying(false);
          }
        }}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className={`w-full h-full cursor-pointer ${
          isFullscreen ? 'max-h-screen object-contain' : 'object-contain'
        }`}
        playsInline
      />

      {/* IN-STREAM AD OVERLAY UI */}
      {isAdPlaying && activeAd && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-40 bg-gradient-to-t from-black/80 via-transparent to-black/60">
          
          {/* Top Bar: Ad Badge & Skip Countdown */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider shadow-lg">
                Tangazo &bull; 1 kati ya 1
              </span>
              <span className="text-xs text-white/90 font-medium hidden sm:inline drop-shadow">
                {activeAd.campaignName}
              </span>
            </div>

            {/* Skip / Non-skippable timer */}
            <div>
              {canSkipAd ? (
                <button
                  onClick={handleSkipAd}
                  className="px-4 py-2 rounded-full bg-black/80 hover:bg-[#FF3040] text-white border border-white/30 text-xs font-black shadow-2xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  <span>Ruka Tangazo (Skip Ad)</span>
                  <span className="text-amber-300">&rarr;</span>
                </button>
              ) : (
                <div className="px-3.5 py-1.5 rounded-full bg-black/80 border border-white/20 text-white font-mono text-xs flex items-center gap-2 backdrop-blur-md shadow-xl">
                  {activeAd.adFormat === 'non_skippable_instream' || activeAd.adFormat === 'bumper' ? (
                    <span>Tangazo litakamilika: <strong className="text-amber-400">{adTimeLeft}s</strong></span>
                  ) : (
                    <span>Unaweza kuruka baada ya: <strong className="text-amber-400">{adSkipCountdown}s</strong></span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Advertiser Details & CTA Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-auto">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 flex items-center justify-between sm:justify-start gap-4 shadow-2xl max-w-lg">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase block">
                  {activeAd.creatorName} ({activeAd.adFormat.replace('_', ' ')})
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">
                  {activeAd.headline}
                </h4>
                <p className="text-[11px] text-[#A7B0C0] line-clamp-1 hidden sm:block">
                  {activeAd.description}
                </p>
              </div>

              <button
                onClick={handleAdCtaClick}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shrink-0 flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
              >
                <span>{activeAd.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleCompleteAd}
              className="text-[10px] text-white/70 hover:text-white underline self-end sm:self-center bg-black/50 px-2 py-1 rounded"
            >
              Funga tangazo
            </button>
          </div>

        </div>
      )}

      {/* Floating Exit Fullscreen Button in Fullscreen Mode */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 shadow-2xl flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all backdrop-blur-md"
          title="Toka Skrini Nzima (Funga)"
        >
          <Minimize className="w-4 h-4 text-[#FF3040]" />
          <span>Toka Fulu</span>
        </button>
      )}

      {/* Cloudflare Stream CDN Watermark */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/90 border border-white/10 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16C784] animate-pulse" />
        <span className="font-medium">Cloudflare Stream 1080p CDN</span>
      </div>

      {/* Captions Overlay (Sample Kiswahili captions) */}
      {showCaptions && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-yellow-300 font-semibold px-4 py-1.5 rounded-lg text-xs md:text-sm text-center pointer-events-none max-w-[85%]">
          [Kiswahili]: Karibu sana kwenye video hii mpya ya Tazama Tanzania.
        </div>
      )}

      {/* Play/Pause Overlay indicator when clicking video */}
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

      {/* Controls Container */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 md:px-5 py-3 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Scrubber Progress bar */}
        <div className="relative mb-2.5 flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF3040] focus:outline-none"
            style={{
              background: `linear-gradient(to right, #FF3040 0%, #FF3040 ${progressPercentage}%, rgba(255,255,255,0.2) ${progressPercentage}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 max-w-full overflow-hidden">
          
          {/* Left Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button 
              onClick={togglePlay} 
              className="p-1 sm:p-1.5 hover:text-[#FF3040] transition-colors focus:outline-none"
              title={isPlaying ? 'Sitisha (Space)' : 'Cheza (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />}
            </button>

            {/* Volume - Slider hidden on mobile, physical buttons used */}
            <div className="flex items-center gap-1 sm:gap-2 group/vol">
              <button 
                onClick={toggleMute} 
                className="p-1 sm:p-1.5 hover:text-[#FF3040] transition-colors"
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

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Captions - Desktop / Tablet */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`hidden sm:block p-1.5 rounded-lg transition-colors ${showCaptions ? 'text-[#FF3040] bg-white/10' : 'text-white/80 hover:text-white'}`}
              title="Manukuu (Captions)"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}
                className="px-1.5 py-1 rounded-lg hover:bg-white/10 text-white/90 text-[11px] sm:text-xs font-semibold"
                title="Kasi ya Video (Speed)"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-[#191E29] border border-[#262E3E] rounded-xl shadow-xl py-1 w-24 text-center z-50">
                  <div className="px-2 py-1 text-[10px] text-[#A7B0C0] font-bold border-b border-[#262E3E]">KASI</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full py-1 text-xs hover:bg-[#232A39] ${playbackSpeed === s ? 'text-[#FF3040] font-bold' : 'text-white'}`}
                    >
                      {s === 1 ? 'Kawaida (1x)' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Picker */}
            <div className="relative">
              <button
                onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                title="Ubora wa Video (Resolution)"
              >
                <Settings className="w-4 h-4" />
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-9 right-0 bg-[#191E29] border border-[#262E3E] rounded-xl shadow-xl py-1 w-32 z-50">
                  <div className="px-3 py-1 text-[10px] text-[#A7B0C0] font-bold border-b border-[#262E3E]">UBORA WA PICHA</div>
                  {['Auto (1080p)', '1080p HD', '720p', '480p (Data Saver)', '360p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setSelectedQuality(q); setShowQualityMenu(false); }}
                      className={`w-full text-left px-3 py-1 text-xs hover:bg-[#232A39] ${selectedQuality === q ? 'text-[#FF3040] font-bold' : 'text-white'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-lg transition-all focus:outline-none flex items-center gap-1 active:scale-95 ${
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
    </div>
  );
};
