import React from 'react';
import { ExternalLink, Megaphone, Sparkles } from 'lucide-react';
import { AdCampaign } from '../../types';
import { useVideo } from '../../context/VideoContext';

interface InFeedAdCardProps {
  ad: AdCampaign;
}

export const InFeedAdCard: React.FC<InFeedAdCardProps> = ({ ad }) => {
  const { recordAdClick } = useVideo();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordAdClick(ad.id);
    window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col rounded-2xl sm:rounded-3xl bg-[#141824] border border-amber-500/40 hover:border-amber-400 p-3 sm:p-4 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Sponsored Pill Badge */}
      <div className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-black font-extrabold text-[10px] uppercase shadow-lg shadow-amber-500/30">
        <Megaphone className="w-3 h-3" />
        <span>Tangazo &bull; Sponsored</span>
      </div>

      {/* Media Container */}
      <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black mb-3">
        {ad.mediaType === 'video' ? (
          <video 
            src={ad.mediaUrl} 
            muted 
            autoPlay 
            loop 
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img 
            src={ad.mediaUrl} 
            alt={ad.headline} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white font-mono uppercase">
          {ad.adFormat.replace('_', ' ')}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#A7B0C0] mb-1">
            <span className="font-bold text-amber-300 truncate max-w-[200px]">{ad.creatorName}</span>
            <span className="text-[10px] text-emerald-400 font-mono">Tazama Verified Partner</span>
          </div>

          <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {ad.headline}
          </h3>

          <p className="text-xs text-[#A7B0C0] line-clamp-2 mt-1 leading-relaxed">
            {ad.description}
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-2 border-t border-[#262E3E]/60 flex items-center justify-between">
          <span className="text-[10px] text-[#A7B0C0] truncate max-w-[140px] font-mono">
            {ad.destinationUrl.replace('https://', '')}
          </span>

          <button
            onClick={handleClick}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
