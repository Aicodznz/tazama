import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, ExternalLink, Megaphone, Globe, Building2, CheckCircle2 } from 'lucide-react';
import { AdCampaign } from '../../types';
import { useVideo } from '../../context/VideoContext';

interface MastheadAdBannerProps {
  ad: AdCampaign;
}

export const MastheadAdBanner: React.FC<MastheadAdBannerProps> = ({ ad }) => {
  const { recordAdClick } = useVideo();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleCtaClick = () => {
    recordAdClick(ad.id);
    if (ad.destinationUrl) {
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const cleanUrl = (ad.destinationUrl || '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '');

  const advertiserTitle = ad.advertiserName || ad.creatorName || 'Mdhamini Rasmi';

  return (
    <div 
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0F131C] border border-amber-500/35 hover:border-amber-500/60 shadow-xl shadow-black/50 transition-all duration-300 group"
    >
      {/* 1. Background Media (Responsive height filling the card) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
        {ad.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={ad.mediaUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover opacity-60 sm:opacity-75 group-hover:opacity-85 transition-opacity duration-700"
          />
        ) : (
          <img
            src={ad.mediaUrl}
            alt={ad.headline}
            className="w-full h-full object-cover opacity-60 sm:opacity-75 group-hover:opacity-85 transition-opacity duration-700"
          />
        )}

        {/* Gradient overlays to guarantee maximum readability on all screens */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E17] via-[#0B0E17]/75 to-[#0B0E17]/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E17] via-[#0B0E17]/85 to-transparent pointer-events-none max-w-2xl" />
      </div>

      {/* 2. Structured Card Content with Safe Area Padding */}
      <div className="relative z-10 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] md:min-h-[280px] p-4 sm:p-6 md:p-7 space-y-3">
        
        {/* Top Header Row: Badges + Sound Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Masthead Tag */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md">
              <Megaphone className="w-3 h-3 text-black fill-black" />
              <span>Tangazo Maalum</span>
            </span>

            {/* Advertiser Chip */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-200 text-xs font-semibold">
              <Building2 className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">{advertiserTitle}</span>
              <CheckCircle2 className="w-3 h-3 text-amber-400 fill-amber-400/20 shrink-0" />
            </div>
          </div>

          {/* Sound Toggle Button (Safe top-right placement) */}
          {ad.mediaType === 'video' && (
            <button
              onClick={toggleMute}
              className="p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg shrink-0 cursor-pointer"
              title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
              aria-label={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              )}
            </button>
          )}
        </div>

        {/* Middle Content: Headline & Description */}
        <div className="space-y-1.5 max-w-2xl py-1">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-snug drop-shadow-md group-hover:text-amber-300 transition-colors line-clamp-2">
            {ad.headline}
          </h2>

          {ad.description && (
            <p className="text-xs sm:text-sm text-[#CBD5E1] line-clamp-2 leading-relaxed drop-shadow-sm">
              {ad.description}
            </p>
          )}
        </div>

        {/* Bottom CTA Row: Action Button + Domain Link */}
        <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
          <button
            onClick={handleCtaClick}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>{ad.ctaText || 'Tembelea Sasa'}</span>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>

          {cleanUrl && (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#94A3B8] font-mono bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 truncate max-w-[200px] sm:max-w-xs">
              <Globe className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{cleanUrl}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
