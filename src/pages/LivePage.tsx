import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Users, 
  Send, 
  Gift, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { LiveStream, LiveChatMessage } from '../types';
import { createAvatarSvgDataUri } from '../lib/mediaPlaceholders';
import { dispatchActionToast } from '../components/video/VideoActionsMenu';

interface LivePageProps {
  onSelectChannel: (channelId: string) => void;
  onOpenWallet: () => void;
}

export const LivePage: React.FC<LivePageProps> = ({ onSelectChannel, onOpenWallet }) => {
  const { 
    liveStreams, 
    activeLiveStream, 
    setActiveLiveStream,
    liveChatMessages, 
    sendLiveChatMessage, 
    sendLiveTip,
    userSubscriptions,
    toggleSubscribe
  } = useVideo();
  const { profile, language } = useAuth();
  const isEn = language === 'en';

  const currentStream: LiveStream | undefined = activeLiveStream || liveStreams[0];
  const streamMessages: LiveChatMessage[] = currentStream ? (liveChatMessages[currentStream.id] || []) : [];

  const [inputText, setInputText] = useState<string>('');
  const [showTipModal, setShowTipModal] = useState<boolean>(false);
  const [tipAmount, setTipAmount] = useState<number>(2000);
  const [tipGift, setTipGift] = useState<string>('Simba wa Mbugani');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tipStatus, setTipStatus] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const isSubbed = currentStream ? userSubscriptions.includes(currentStream.channelId) : false;

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [streamMessages]);

  // Keep fullscreen state in sync with browser controls
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Periodic fan comment simulation safely above conditional return
  useEffect(() => {
    if (!currentStream?.id) return;
    const streamId = currentStream.id;
    const randomComments = [
      'Dar es Salaam tumesimama na nyie! 🔥🇹🇿',
      'Wimbo huu ni hatari sana, piga tena!',
      'Salamu kutoka Mwanza Rock City!',
      'Kamera na ubora wa 4K uko safi kabisa Tazama!',
      'Leo ubora uko juu sana!',
      'Hongereni sana waandaaji 🚀'
    ];
    const randomNames = ['Juma Kapera', 'Zuhura Bakari', 'Erick Kimaro', 'Fatma Omary', 'Innocent Masawe'];

    const interval = setInterval(() => {
      const randomText = randomComments[Math.floor(Math.random() * randomComments.length)];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      sendLiveChatMessage(streamId, randomText, {
        name: randomName,
        avatar: createAvatarSvgDataUri(randomName),
      });
    }, 9000);

    return () => clearInterval(interval);
  }, [currentStream?.id]);

  if (!currentStream) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 select-none">
        <div className="max-w-md w-full bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-8 text-center space-y-4 shadow-sm dark:shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
            <Radio className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEn ? 'No Live Streams Right Now' : 'Hakuna Mubashara kwa Sasa'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
              {isEn
                ? 'No creator is currently broadcasting live. Once registered creators go live, streams will appear here.'
                : 'Bado hakuna mtayarishaji anayerusha matangazo ya moja kwa moja kwa wakati huu. Watayarishaji waliosajiliwa wakianza mubashara, wataonekana hapa.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (playerContainerRef.current?.requestFullscreen) {
        await playerContainerRef.current.requestFullscreen();
      }
    } catch {}
  };

  const handleShareLive = () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?live=${currentStream.id}`;
      navigator.clipboard?.writeText(url);
      dispatchActionToast({
        message: isEn ? 'Live broadcast link copied!' : 'Kiungo cha Mubashara kimenakiliwa!',
      });
    } catch {}
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendLiveChatMessage(currentStream.id, inputText.trim());
    setInputText('');
  };

  const handleSendTip = async () => {
    if (!profile) {
      setTipStatus(isEn ? 'Please sign in first to send a tip.' : 'Tafadhali ingia kwenye akaunti kwanza ili kutuma tip.');
      return;
    }
    if (profile.balanceTZS < tipAmount) {
      setTipStatus(isEn ? 'Insufficient balance. Top up via M-Pesa.' : 'Salio halitoshi. Tafadhali weka salio kupitia M-Pesa.');
      return;
    }
    const ok = await sendLiveTip(currentStream.id, tipAmount, tipGift);
    if (ok) {
      setShowTipModal(false);
      setTipStatus('');
    } else {
      setTipStatus(isEn ? 'Unable to send tip right now.' : 'Kulitokea hitilafu ya kutoa fedha.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 pb-6 select-none max-w-6xl mx-auto">
      
      {/* Left Column: Player & Info */}
      <div className="flex-1 min-w-0 space-y-4">
        
        {/* Active Stream Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {liveStreams.map((stream) => {
            const isSelected = stream.id === currentStream.id;
            return (
              <button
                key={stream.id}
                onClick={() => setActiveLiveStream(stream)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#FF3040] text-white shadow-lg shadow-[#FF3040]/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full animate-pulse ${isSelected ? 'bg-white' : 'bg-[#FF3040]'}`} />
                <span className="truncate max-w-[150px] sm:max-w-xs">{stream.channelName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-slate-100 text-slate-700 dark:bg-black/40 dark:text-[#A7B0C0]'}`}>
                  {(stream.viewerCount / 1000).toFixed(1)}k
                </span>
              </button>
            );
          })}
        </div>

        {/* Video Player Canvas */}
        <div
          ref={playerContainerRef}
          className="relative w-full aspect-video rounded-none sm:rounded-3xl overflow-hidden bg-black border border-[#262E3E] shadow-2xl"
        >
          <video
            src={currentStream.streamUrl}
            poster={currentStream.thumbnailUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Top Live Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FF3040] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#FF3040]/50 animate-pulse pointer-events-auto">
                <Radio className="w-3.5 h-3.5" />
                {isEn ? 'LIVE' : 'MUBASHARA'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#16C784]" />
                {currentStream.viewerCount.toLocaleString()} {isEn ? 'viewers' : 'watazamaji'}
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
                title={isMuted ? (isEn ? 'Unmute' : 'Washa sauti') : (isEn ? 'Mute' : 'Zima sauti')}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
                title={isFullscreen ? (isEn ? 'Exit fullscreen' : 'Toka skrini nzima') : (isEn ? 'Fullscreen' : 'Skrini nzima')}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bottom Watermark */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/90 border border-white/10 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16C784] animate-pulse" />
            <span>Tazama Ultra-HD Live CDN</span>
          </div>
        </div>

        {/* Title & Channel Details */}
        <div className="px-3 sm:px-0 space-y-3">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
            {currentStream.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#262E3E]">
            <div 
              onClick={() => onSelectChannel(currentStream.channelId)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={currentStream.channelAvatar || createAvatarSvgDataUri(currentStream.channelName)}
                alt={currentStream.channelName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = createAvatarSvgDataUri(currentStream.channelName);
                }}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-[#FF3040] bg-slate-100 dark:bg-[#141824]"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  {currentStream.channelName}
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0]">Kituo Rasmi cha Maudhui Tanzania</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => toggleSubscribe(currentStream.channelId)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer ${
                  isSubbed 
                    ? 'bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#232A39] dark:text-[#A7B0C0] dark:hover:text-white' 
                    : 'bg-[#FF3040] hover:bg-[#e02434] text-white shadow-[#FF3040]/30'
                }`}
              >
                {isSubbed ? (isEn ? 'Subscribed' : 'Unamfuatilia') : (isEn ? 'Subscribe' : 'Fuatilia')}
              </button>

              <button
                type="button"
                onClick={handleShareLive}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] text-slate-800 dark:text-white border border-slate-200 dark:border-[#323C52] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Share' : 'Shiriki'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTipModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#16C784] hover:bg-[#13af74] text-black text-xs font-extrabold shadow-lg shadow-[#16C784]/20 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{isEn ? 'Send Tip' : 'Tuma Tip'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
            {currentStream.description}
          </p>
        </div>

      </div>

      {/* Right Column: Live Chat Room */}
      <div className="w-full lg:w-88 shrink-0 bg-white dark:bg-[#141822] border border-slate-200 dark:border-[#262E3E] rounded-2xl sm:rounded-3xl flex flex-col h-[520px] lg:h-[620px] overflow-hidden shadow-sm dark:shadow-2xl">
        
        {/* Chat Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#262E3E] flex items-center justify-between bg-slate-50 dark:bg-[#191E29]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF3040]" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">
              {isEn ? 'Live Chat' : 'Maoni Mubashara'}
            </h3>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-[#16C784] font-semibold bg-emerald-50 dark:bg-[#16C784]/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-[#16C784]/20">
            {isEn ? 'Moderation Active' : 'Hewa Iko Salama'}
          </span>
        </div>

        {/* Message Stream */}
        <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-sans">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-[#A7B0C0] text-center">
            Karibu kwenye mazungumzo mubashara ya Tazama. Zingatia maadili na heshima ya jamii.
          </div>

          {streamMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-2.5 rounded-xl transition-all ${
                msg.isTip 
                  ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30' 
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#191E29]/70 dark:hover:bg-[#191E29]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <img
                    src={msg.senderAvatar || createAvatarSvgDataUri(msg.senderName)}
                    alt={msg.senderName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(msg.senderName);
                    }}
                    className="w-5 h-5 rounded-full object-cover shrink-0 bg-slate-200 dark:bg-[#141824]"
                  />
                  <span className={`text-[11px] font-bold truncate ${msg.isTip ? 'text-amber-800 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>
                    {msg.senderName}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#A7B0C0] font-mono shrink-0">{msg.timestamp}</span>
              </div>

              {msg.isTip && (
                <div className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  <Sparkles className="w-3 h-3" />
                  <span>TIP: TZS {msg.tipAmountTZS?.toLocaleString()}</span>
                </div>
              )}

              <p className="text-xs text-slate-800 dark:text-white/90 leading-snug break-words">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-[#262E3E] bg-slate-50 dark:bg-[#191E29] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Toa maoni yako mubashara..."
            className="flex-1 bg-white dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-full py-2 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040]"
          />
          <button
            type="button"
            onClick={() => setShowTipModal(true)}
            className="p-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/30 dark:border-amber-500/30 transition-colors"
            title="Tuma Tip ya Pesa"
          >
            <Gift className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-full bg-[#FF3040] hover:bg-[#e02434] disabled:opacity-40 text-white transition-colors shadow-md"
            title="Tuma"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Live Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600 dark:text-[#16C784]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tuma Zawadi / Tip Mubashara</h3>
              </div>
              <button 
                onClick={() => setShowTipModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
              Zawadi yako itaonekana hewani na jina lako litang&apos;ara kwenye maoni ya watazamaji wote.
            </p>

            {/* Gift selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Chai ya Rangi', icon: '☕', amount: 1000 },
                { name: 'Simba wa Mbugani', icon: '🦁', amount: 5000 },
                { name: 'Tanzanite Royal', icon: '💎', amount: 20000 }
              ].map((g) => (
                <button
                  key={g.name}
                  onClick={() => { setTipGift(g.name); setTipAmount(g.amount); }}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    tipAmount === g.amount 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-[#16C784] dark:bg-[#16C784]/15 dark:text-white shadow-sm dark:shadow-lg' 
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-[#262E3E] dark:bg-[#10131B] dark:text-[#A7B0C0] dark:hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div className="text-[11px] font-bold truncate">{g.name}</div>
                  <div className="text-[10px] text-emerald-700 dark:text-[#16C784] font-mono mt-0.5">TZS {g.amount.toLocaleString()}</div>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-[#10131B] p-3 rounded-2xl border border-slate-200 dark:border-[#262E3E] flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-[#A7B0C0]">Salio Lako:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-[#16C784]">TZS {(profile?.balanceTZS || 0).toLocaleString()}</span>
            </div>

            {tipStatus && (
              <div className="text-xs text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-2.5 rounded-xl">
                {tipStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onOpenWallet}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#262E3E] text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white"
              >
                + Weka Salio
              </button>
              <button
                onClick={handleSendTip}
                className="py-2.5 px-3 rounded-xl bg-[#16C784] hover:bg-[#13af74] text-black text-xs font-black shadow-lg shadow-[#16C784]/20"
              >
                Tuma TZS {tipAmount.toLocaleString()}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
