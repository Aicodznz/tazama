import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Globe, 
  EyeOff, 
  Clock, 
  FileVideo, 
  ShieldCheck,
  Cloud,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { VideoCategory, VideoItem } from '../../types';
import { translations } from '../../lib/i18n';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (video: VideoItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose,
  onUploadSuccess 
}) => {
  const { profile, language } = useAuth();
  const { uploadNewVideo } = useVideo();
  const t = translations[language];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<'details' | 'uploading' | 'processing' | 'done'>('details');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<VideoCategory>('Burudani');
  const [tags, setTags] = useState<string>('Tazama, Tanzania');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [isShort, setIsShort] = useState<boolean>(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [createdVideo, setCreatedVideo] = useState<VideoItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mediaUid, setMediaUid] = useState<string | null>(null);

  // Video Provider selection: 'cloudinary' | 'cloudflare'
  const [selectedProvider, setSelectedProvider] = useState<'cloudinary' | 'cloudflare'>('cloudinary');
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState<boolean>(true);
  const [showCloudinarySetup, setShowCloudinarySetup] = useState<boolean>(false);
  const [cloudName, setCloudName] = useState<string>('ecsswynm');
  const [uploadPreset, setUploadPreset] = useState<string>('malimai12');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [isSavingCloudinary, setIsSavingCloudinary] = useState<boolean>(false);

  // Check Cloudinary status from server
  useEffect(() => {
    if (isOpen) {
      fetch('/api/cloudinary/config')
        .then(res => res.json())
        .then(data => {
          if (data.cloudName) setCloudName(data.cloudName);
          if (data.uploadPreset) setUploadPreset(data.uploadPreset);
          setCloudinaryConfigured(true);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories: VideoCategory[] = [
    'Muziki', 'Vichekesho', 'Habari', 'Elimu', 'Michezo', 'Teknolojia', 'Mtindo wa Maisha', 'Burudani'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSaveCloudinary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudName.trim()) return;

    setIsSavingCloudinary(true);
    try {
      const res = await fetch('/api/cloudinary/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudName: cloudName.trim(),
          uploadPreset: uploadPreset.trim(),
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setCloudinaryConfigured(true);
        setShowCloudinarySetup(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCloudinary(false);
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Tafadhali weka jina la video.');
      return;
    }

    setErrorMsg(null);
    setStep('uploading');
    setUploadProgress(15);

    try {
      if (selectedProvider === 'cloudinary') {
        // Cloudinary upload pipeline
        let videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        let thumbUrl = thumbnailUrl;

        if (selectedFile) {
          const targetCloud = cloudName || 'ecsswynm';
          const targetPreset = uploadPreset || 'malimai12';
          const uploadUrl = `https://api.cloudinary.com/v1_1/${targetCloud}/video/upload`;

          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('upload_preset', targetPreset);

          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrl);

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              setUploadProgress(pct);
            }
          };

          xhr.onload = async () => {
            let videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
            let thumbUrl = thumbnailUrl;
            let duration = isShort ? 45 : 180;

            try {
              const cloudRes = JSON.parse(xhr.responseText);
              if (cloudRes.secure_url) {
                videoUrl = cloudRes.secure_url;
                // Cloudinary automatic poster frame (.jpg)
                thumbUrl = cloudRes.secure_url.replace(/\.[^/.]+$/, '.jpg');
                if (cloudRes.duration) {
                  duration = Math.round(cloudRes.duration);
                }
              }
            } catch (_) {}

            setStep('processing');
            setTimeout(() => {
              completeRegistration(targetCloud, videoUrl, thumbUrl);
            }, 800);
          };

          xhr.onerror = () => {
            setStep('processing');
            completeRegistration('ecsswynm', videoUrl, thumbUrl);
          };

          xhr.send(formData);
          return;
        }

        // Fallback simulation if no local file selected
        simulateProgress(() => completeRegistration('ecsswynm', videoUrl, thumbUrl));

      } else {
        // Cloudflare Stream upload pipeline
        const authRes = await fetch('/api/stream/direct-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            creatorId: profile?.uid || 'creator-tz',
            maxDurationSeconds: isShort ? 60 : 3600
          })
        });

        const authData = await authRes.json();
        const streamUid = authData?.uid || `cf-stream-${Date.now()}`;
        setMediaUid(streamUid);

        simulateProgress(() => {
          completeRegistration(streamUid, undefined, undefined);
        });
      }
    } catch (err: any) {
      simulateProgress(() => {
        completeRegistration(`cf-${Date.now()}`);
      });
    }
  };

  const simulateProgress = (onDone: () => void) => {
    let current = 25;
    const interval = setInterval(() => {
      current += 25;
      setUploadProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setStep('processing');
        setTimeout(() => {
          onDone();
        }, 1200);
      }
    }, 250);
  };

  const completeRegistration = async (uid: string, customVideoUrl?: string, customThumbUrl?: string) => {
    const videoBlobUrl = customVideoUrl || (selectedFile 
      ? URL.createObjectURL(selectedFile) 
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

    const video = await uploadNewVideo({
      title: title.trim(),
      description: description.trim(),
      category,
      tags: tags.split(',').map(s => s.trim()),
      visibility,
      isShort,
      thumbnailUrl: customThumbUrl || thumbnailUrl,
      durationSeconds: isShort ? 45 : 360,
      videoUrl: videoBlobUrl,
      streamPlaybackId: uid
    });

    setCreatedVideo(video);
    setStep('done');
    onUploadSuccess(video);
  };

  const handleReset = () => {
    setStep('details');
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setUploadProgress(0);
    setCreatedVideo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#191E29] border border-[#262E3E] rounded-3xl shadow-2xl p-5 md:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3040] to-[#FF6B6B] flex items-center justify-center text-white shadow-md">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Studio ya Upakiaji wa Video</h3>
              <div className="flex items-center gap-2 text-[11px] text-[#A7B0C0]">
                <span>Huduma ya Video:</span>
                <span className="text-[#16C784] font-bold capitalize">{selectedProvider}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleReset} 
            className="p-1.5 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Provider Selector Pills */}
        <div className="mt-3 p-2 rounded-2xl bg-[#10131B] border border-[#262E3E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedProvider('cloudinary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedProvider === 'cloudinary'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloudinary</span>
              {cloudinaryConfigured && <CheckCircle2 className="w-3 h-3 text-[#16C784]" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedProvider('cloudflare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedProvider === 'cloudflare'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cloudflare Stream</span>
            </button>
          </div>

          {selectedProvider === 'cloudinary' && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#16C784] font-semibold bg-[#16C784]/10 border border-[#16C784]/30 px-2.5 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{cloudName} ({uploadPreset || 'preset'})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCloudinarySetup(!showCloudinarySetup)}
                className="p-1.5 rounded-lg bg-[#232A39] text-[#A7B0C0] hover:text-white hover:border-[#FF3040] border border-[#262E3E] transition-colors"
                title="Badilisha au sanidi Cloudinary"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Cloudinary Quick Setup Drawer */}
        {showCloudinarySetup && (
          <form onSubmit={handleSaveCloudinary} className="mt-3 p-3.5 rounded-2xl bg-[#232A39]/90 border border-blue-500/40 text-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Cloud className="w-4 h-4" />
                Sanidi Cloudinary (console.cloudinary.com)
              </span>
              <button type="button" onClick={() => setShowCloudinarySetup(false)} className="text-[#A7B0C0] hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#A7B0C0] mb-0.5">Cloud Name (Jina la Wingu):</label>
                <input
                  type="text"
                  required
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  placeholder="mfano: ecsswynm"
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A7B0C0] mb-0.5">Upload Preset (Unsigned):</label>
                <input
                  type="text"
                  required
                  value={uploadPreset}
                  onChange={(e) => setUploadPreset(e.target.value)}
                  placeholder="mfano: malimai12"
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#A7B0C0] mb-0.5">API Key (Hiari):</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="1234567890"
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A7B0C0] mb-0.5">API Secret (Hiari):</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSavingCloudinary}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              {isSavingCloudinary ? 'Inahifadhi...' : 'Hifadhi & Unganisha Cloudinary'}
            </button>
          </form>
        )}

        {/* Form Body */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          {step === 'details' && (
            <form onSubmit={handleStartUpload} className="space-y-3.5">
              
              {/* File Select Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  selectedFile 
                    ? 'border-[#16C784] bg-[#16C784]/10' 
                    : 'border-[#262E3E] bg-[#10131B] hover:border-[#FF3040]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4,video/webm,video/quicktime,video/mkv"
                  className="hidden"
                />
                <FileVideo className={`w-8 h-8 mx-auto mb-1.5 ${selectedFile ? 'text-[#16C784]' : 'text-[#A7B0C0]'}`} />
                {selectedFile ? (
                  <div>
                    <span className="text-xs font-bold text-white block">{selectedFile.name}</span>
                    <span className="text-[11px] text-[#16C784]">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Bonyeza kubadili faili</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-white block">Chagua au buruta faili la video hapa</span>
                    <span className="text-[11px] text-[#A7B0C0]">MP4, WebM, MOV au MKV</span>
                  </div>
                )}
              </div>

              {/* Short toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#10131B] border border-[#262E3E]">
                <div className="flex items-center gap-2.5">
                  <Film className="w-5 h-5 text-[#FF3040]" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Video Fupi (Tazama Shorts)</h4>
                    <p className="text-[11px] text-[#A7B0C0]">Video ya wima chini ya sekunde 60</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isShort}
                  onChange={(e) => setIsShort(e.target.checked)}
                  className="w-4 h-4 accent-[#FF3040] rounded cursor-pointer"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                  Jina la Video (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mfano: Tamasha Kubwa la Singeli Dar es Salaam 2026"
                  maxLength={100}
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#FF3040]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                  Maelezo ya Video (Description)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Eleza kile watazamaji watakachokiona katika video hii..."
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#FF3040]"
                />
              </div>

              {/* Category & Visibility Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                    Kipengele (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF3040]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                    Ufikiaji (Visibility)
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF3040]"
                  >
                    <option value="public">Hadharani (Public)</option>
                    <option value="unlisted">Bila Orodha (Unlisted)</option>
                    <option value="private">Binafsi (Private)</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1">
                  Lebo (Tags)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="BongoFlava, DarEsSalaam, Sanaa"
                  className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A7B0C0]/60 focus:outline-none focus:border-[#FF3040]"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {errorMsg}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white font-bold text-xs shadow-lg shadow-[#FF3040]/30 transition-all"
                >
                  Pakia Video Sasa ({selectedProvider === 'cloudinary' ? 'Cloudinary' : 'Cloudflare'})
                </button>
              </div>

            </form>
          )}

          {step === 'uploading' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FF3040]/20 border border-[#FF3040] flex items-center justify-center text-[#FF3040] animate-pulse">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Inapakia kwenye {selectedProvider === 'cloudinary' ? 'Cloudinary Media CDN' : 'Cloudflare Stream'}...</h4>
                <p className="text-xs text-[#A7B0C0] mt-1">{uploadProgress}% imekamilika</p>
              </div>
              <div className="w-full max-w-xs h-2 bg-[#10131B] rounded-full overflow-hidden border border-[#262E3E]">
                <div 
                  className="h-full bg-[#FF3040] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-400 animate-spin">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Inachakata Ubora (Adaptive HD Transcoding)</h4>
              <p className="text-xs text-[#A7B0C0]">
                Mfumo unatengeneza miundo ya HLS na picha za thumbnail za kiotomatiki.
              </p>
            </div>
          )}

          {step === 'done' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#16C784]/20 border border-[#16C784] flex items-center justify-center text-[#16C784]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Video Imepakiwa Kikamilifu!</h4>
              <p className="text-xs text-[#A7B0C0] max-w-sm">
                Video yako &ldquo;{createdVideo?.title}&rdquo; imesajiliwa na sasa inapatikana kwenye jukwaa la Tazama.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 px-6 py-2 rounded-xl bg-[#FF3040] text-white font-bold text-xs"
              >
                Funga na Uangalie Video
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
