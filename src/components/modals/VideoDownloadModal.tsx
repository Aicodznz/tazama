import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  X, 
  HardDrive, 
  Film, 
  Sparkles, 
  WifiOff, 
  Play, 
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { VideoItem } from '../../types';
import { useVideo } from '../../context/VideoContext';

interface VideoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
  onGoToLibrary?: () => void;
}

export const VideoDownloadModal: React.FC<VideoDownloadModalProps> = ({
  isOpen,
  onClose,
  video,
  onGoToLibrary
}) => {
  const { downloadVideo, isDownloaded, removeDownload } = useVideo();
  
  const alreadyDownloaded = isDownloaded(video.id);

  const [quality, setQuality] = useState<'720p' | '480p' | '360p'>('720p');
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>(
    alreadyDownloaded ? 'completed' : 'idle'
  );
  const [progress, setProgress] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const qualityOptions = [
    {
      id: '720p',
      name: 'Ubora wa Juu (720p HD)',
      size: '34.5 MB',
      desc: 'Inafaa kwa skrini kubwa na picha angavu'
    },
    {
      id: '480p',
      name: 'Ubora wa Wastani (480p)',
      size: '18.2 MB',
      desc: 'Sawia kati ya ubora mzuri na MB chache'
    },
    {
      id: '360p',
      name: 'Kubana Bando (360p)',
      size: '9.8 MB',
      desc: 'Inaokoa bando na kupakua haraka sana'
    }
  ];

  const handleStartDownload = async () => {
    setDownloadState('downloading');
    setProgress(15);
    setDownloadError(null);

    // Save into Tazama offline storage
    downloadVideo(video);

    // Simulate realistic download progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          finishDownload();
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 250);
  };

  const finishDownload = async () => {
    // Save into Tazama offline storage
    downloadVideo(video);

    // Trigger real browser file download for the user's phone / PC
    try {
      const cleanTitle = (video.title || 'tazama-video')
        .replace(/[^a-zA-Z0-9_\u00C0-\u017F\s-]/g, '')
        .trim()
        .slice(0, 35)
        .replace(/\s+/g, '_');
      
      const fileName = `Tazama_${cleanTitle}_${quality}.mp4`;
      const urlToDownload = video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

      // Attempt blob download first for true offline save on phone storage
      try {
        const response = await fetch(urlToDownload, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        } else {
          throw new Error('CORS fetch fallback');
        }
      } catch {
        // Fallback to direct anchor download
        const link = document.createElement('a');
        link.href = urlToDownload;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.warn('Direct file download fallback triggered', err);
    }

    setDownloadState('completed');
  };

  const handleRemove = () => {
    removeDownload(video.id);
    setDownloadState('idle');
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#191E29] border border-[#262E3E] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#121620] px-4 py-3.5 border-b border-[#262E3E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#16C784]/20 text-[#16C784] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Pakua Video Kwenye Simu</h3>
              <p className="text-[11px] text-[#A7B0C0]">Hifadhi kwa ajili ya kutazama nje ya mtandao</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#A7B0C0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          
          {/* Video Preview Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E]">
            <img 
              src={video.thumbnailUrl} 
              alt={video.title} 
              className="w-20 h-14 object-cover rounded-xl shrink-0 border border-[#262E3E]" 
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                {video.title}
              </h4>
              <p className="text-[11px] text-[#A7B0C0] truncate mt-0.5">
                {video.channelName}
              </p>
            </div>
          </div>

          {/* Downloading state with progress bar */}
          {downloadState === 'downloading' && (
            <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-white">
                  <Loader2 className="w-4 h-4 animate-spin text-[#16C784]" />
                  Inapakua faili kwenye simu...
                </span>
                <span className="font-mono text-[#16C784]">{progress}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#232A39] rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#16C784] to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-[11px] text-[#A7B0C0] text-center">
                Tafadhali subiri kidogo, faili linatayarishwa na kuhifadhiwa kwenye kumbukumbu ya simu.
              </p>
            </div>
          )}

          {/* Completed state */}
          {downloadState === 'completed' && (
            <div className="p-4 rounded-2xl bg-[#16C784]/15 border border-[#16C784]/30 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#16C784] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#16C784]/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Video Imepakuliwa Kikamilifu!</h4>
                <p className="text-xs text-[#A7B0C0] mt-1">
                  Imehifadhiwa kwenye folda ya <strong>Downloads</strong> ya simu yako na kwenye <strong>Maktaba ya Nje ya Mtandao</strong> ya Tazama.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {onGoToLibrary && (
                  <button
                    onClick={() => {
                      onClose();
                      onGoToLibrary();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#16C784] hover:bg-[#13b376] text-black font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#16C784]/20"
                  >
                    <WifiOff className="w-4 h-4" />
                    <span>Fungua Kwenye Maktaba ya Nje ya Mtandao</span>
                  </button>
                )}

                <button
                  onClick={finishDownload}
                  className="w-full py-2 rounded-xl bg-[#232A39] hover:bg-[#2E3748] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#16C784]" />
                  <span>Pakua Faili Tena (Download Again)</span>
                </button>

                <button
                  onClick={handleRemove}
                  className="text-[11px] text-red-400 hover:underline pt-1"
                >
                  Ondoa video hii kwenye maktaba
                </button>
              </div>
            </div>
          )}

          {/* Idle: Select Quality */}
          {downloadState === 'idle' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#A7B0C0] uppercase tracking-wider block">
                Chagua Ubora wa Video (Quality)
              </label>

              <div className="space-y-2">
                {qualityOptions.map((opt) => {
                  const isSelected = quality === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setQuality(opt.id as any)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-[#16C784]/15 border-[#16C784] shadow-md shadow-[#16C784]/10' 
                          : 'bg-[#10131B] border-[#262E3E] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#16C784] bg-[#16C784]' : 'border-[#A7B0C0]'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#A7B0C0]'}`}>
                            {opt.name}
                          </p>
                          <p className="text-[11px] text-[#A7B0C0]/80">
                            {opt.desc}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#16C784] bg-[#16C784]/10 px-2 py-0.5 rounded-lg border border-[#16C784]/20">
                        {opt.size}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Offline perks banner */}
              <div className="p-3 rounded-2xl bg-[#121620] border border-[#262E3E] flex items-center gap-2.5 text-xs text-[#A7B0C0]">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Utaweza kutazama video hii hata ukiwa bila intaneti au ukiwa safarini.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-[#10131B] hover:bg-[#232A39] border border-[#262E3E] text-xs font-bold text-white transition-all active:scale-95"
                >
                  Ghairi
                </button>
                <button
                  type="button"
                  onClick={handleStartDownload}
                  className="flex-[2] py-3 rounded-2xl bg-[#16C784] hover:bg-[#13b376] text-xs font-extrabold text-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#16C784]/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Anza Kupakua Sasa</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
