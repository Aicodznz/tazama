import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, ExternalLink, Play, Megaphone, Sparkles } from 'lucide-react';
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
    window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-black via-[#141824] to-black border border-amber-500/40 shadow-2xl mb-6 group">
      
      {/* Background Video player */}
      <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full max-h-[360px] overflow-hidden bg-black">
        {ad.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={ad.mediaUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-500"
          />
        ) : (
          <img
            src={ad.mediaUrl}
            alt={ad.headline}
            className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-500"
          />
        )}

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10131B] via-[#10131B]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10131B] via-[#10131B]/80 to-transparent pointer-events-none max-w-xl" />

        {/* Floating Sound Toggle */}
        {ad.mediaType === 'video' && (
          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
            title={isMuted ? 'Washa Sauti' : 'Zima Sauti'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        )}
      </div>

      {/* Floating Content Over Masthead */}
      <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-4 sm:p-8 max-w-xl z-20 space-y-3 pointer-events-none">
        
        {/* Brand & Format Badges */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
            <Megaphone className="w-3 h-3" />
            <span>YouTube Masthead Video Ad</span>
          </span>
          <span className="text-xs font-bold text-amber-300 drop-shadow">
            {ad.creatorName}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
          {ad.headline}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#A7B0C0] line-clamp-2 leading-relaxed drop-shadow">
          {ad.description}
        </p>

        {/* CTA Button */}
        <div className="pt-2 pointer-events-auto flex items-center gap-3">
          <button
            onClick={handleCtaClick}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <span className="text-[11px] text-[#A7B0C0] font-mono">
            {ad.destinationUrl.replace('https://', '')}
          </span>
        </div>

      </div>

    </div>
  );
};
