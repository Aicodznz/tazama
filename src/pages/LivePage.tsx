import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Users, 
  Send, 
  Gift, 
  Heart, 
  Flame, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { LiveStream, LiveChatMessage } from '../types';

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
  const { profile } = useAuth();

  const currentStream: LiveStream = activeLiveStream || liveStreams[0];
  const streamMessages: LiveChatMessage[] = liveChatMessages[currentStream.id] || [];

  const [inputText, setInputText] = useState<string>('');
  const [showTipModal, setShowTipModal] = useState<boolean>(false);
  const [tipAmount, setTipAmount] = useState<number>(2000);
  const [tipGift, setTipGift] = useState<string>('Simba wa Mbugani');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [tipStatus, setTipStatus] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const isSubbed = userSubscriptions.includes(currentStream.channelId);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [streamMessages]);

  // Periodic random fan comment simulation to keep chat alive
  useEffect(() => {
    const randomComments = [
      'Dar es Salaam tumesimama na nyie! 🔥🇹🇿',
      'Wimbo huu ni hatari sana, piga tena!',
      'Salamu kutoka Mwanza Rock City!',
      'Kamera na ubora wa 4K uko safi kabisa Tazama!',
      'Simba oyeeee! Leo tunashinda 3-0!',
      'Wasafi mmeupiga mwingi sana mwaka huu 🚀'
    ];
    const randomNames = ['Juma Kapera', 'Zuhura Bakari', 'Erick Kimaro', 'Fatma Omary', 'Innocent Masawe'];

    const interval = setInterval(() => {
      const randomText = randomComments[Math.floor(Math.random() * randomComments.length)];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      const autoMsg: LiveChatMessage = {
        id: `auto-${Date.now()}-${Math.random()}`,
        senderName: randomName,
        senderAvatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 50000000)}?w=100&auto=format&fit=crop&q=80`,
        message: randomText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Append silently to chat
      sendLiveChatMessage(currentStream.id, randomText);
    }, 9000);

    return () => clearInterval(interval);
  }, [currentStream.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendLiveChatMessage(currentStream.id, inputText.trim());
    setInputText('');
  };

  const handleSendTip = async () => {
    if (!profile || profile.balanceTZS < tipAmount) {
      setTipStatus('Salio halitoshi. Tafadhali weka salio kupitia M-Pesa.');
      return;
    }
    const ok = await sendLiveTip(currentStream.id, tipAmount, tipGift);
    if (ok) {
      setShowTipModal(false);
      setTipStatus('');
    } else {
      setTipStatus('Kulitokea hitilafu ya kutoa fedha.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 pb-20 select-none max-w-6xl mx-auto">
      
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
                    : 'bg-[#191E29] text-[#A7B0C0] hover:text-white border border-[#262E3E]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="truncate max-w-[150px] sm:max-w-xs">{stream.channelName}</span>
                <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">
                  {(stream.viewerCount / 1000).toFixed(1)}k
                </span>
              </button>
            );
          })}
        </div>

        {/* Video Player Canvas */}
        <div className="relative w-full aspect-video rounded-none sm:rounded-3xl overflow-hidden bg-black border border-[#262E3E] shadow-2xl">
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
                MUBASHARA (LIVE)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#16C784]" />
                {currentStream.viewerCount.toLocaleString()} watazamaji
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
                title={isMuted ? 'Washa sauti' : 'Zima sauti'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
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
          <h1 className="text-base sm:text-lg font-extrabold text-white leading-snug">
            {currentStream.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262E3E]">
            <div 
              onClick={() => onSelectChannel(currentStream.channelId)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={currentStream.channelAvatar}
                alt={currentStream.channelName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-[#FF3040]"
              />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1">
                  {currentStream.channelName}
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                </h3>
                <p className="text-[11px] text-[#A7B0C0]">Kituo Rasmi cha Maudhui Tanzania</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => toggleSubscribe(currentStream.channelId)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
                  isSubbed 
                    ? 'bg-[#232A39] text-[#A7B0C0] hover:text-white' 
                    : 'bg-[#FF3040] hover:bg-[#e02434] text-white shadow-[#FF3040]/30'
                }`}
              >
                {isSubbed ? 'Umejisajili' : 'Jisajili (Subscribe)'}
              </button>

              <button
                onClick={() => setShowTipModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#16C784] hover:bg-[#13af74] text-black text-xs font-extrabold shadow-lg shadow-[#16C784]/20 active:scale-95 transition-all"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Tuma Tip</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-[#A7B0C0] leading-relaxed">
            {currentStream.description}
          </p>
        </div>

      </div>

      {/* Right Column: Live Chat Room */}
      <div className="w-full lg:w-88 shrink-0 bg-[#141822] border border-[#262E3E] rounded-2xl sm:rounded-3xl flex flex-col h-[520px] lg:h-[620px] overflow-hidden shadow-2xl">
        
        {/* Chat Header */}
        <div className="p-3.5 border-b border-[#262E3E] flex items-center justify-between bg-[#191E29]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF3040] animate-pulse" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Maoni Mubashara (Live Chat)</h3>
          </div>
          <span className="text-[11px] text-[#16C784] font-semibold bg-[#16C784]/10 px-2 py-0.5 rounded-full border border-[#16C784]/20">
            Hewa Iko Salama
          </span>
        </div>

        {/* Message Stream */}
        <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-sans">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#A7B0C0] text-center">
            Karibu kwenye mazungumzo mubashara ya Tazama. Zingatia maadili na heshima ya jamii.
          </div>

          {streamMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-2.5 rounded-xl transition-all ${
                msg.isTip 
                  ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30' 
                  : 'bg-[#191E29]/70 hover:bg-[#191E29]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                  <span className={`text-[11px] font-bold truncate ${msg.isTip ? 'text-amber-300' : 'text-white'}`}>
                    {msg.senderName}
                  </span>
                </div>
                <span className="text-[9px] text-[#A7B0C0] font-mono shrink-0">{msg.timestamp}</span>
              </div>

              {msg.isTip && (
                <div className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  <Sparkles className="w-3 h-3" />
                  <span>TIP: TZS {msg.tipAmountTZS?.toLocaleString()}</span>
                </div>
              )}

              <p className="text-xs text-white/90 leading-snug break-words">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#262E3E] bg-[#191E29] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Toa maoni yako mubashara..."
            className="flex-1 bg-[#10131B] border border-[#262E3E] rounded-full py-2 px-3.5 text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040]"
          />
          <button
            type="button"
            onClick={() => setShowTipModal(true)}
            className="p-2 rounded-full bg-amber-500/15 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#191E29] border border-[#262E3E] rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#16C784]" />
                <h3 className="text-sm font-bold text-white">Tuma Zawadi / Tip Mubashara</h3>
              </div>
              <button 
                onClick={() => setShowTipModal(false)}
                className="text-[#A7B0C0] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A7B0C0]">
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
                      ? 'border-[#16C784] bg-[#16C784]/15 text-white shadow-lg' 
                      : 'border-[#262E3E] bg-[#10131B] text-[#A7B0C0] hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div className="text-[11px] font-bold truncate">{g.name}</div>
                  <div className="text-[10px] text-[#16C784] font-mono mt-0.5">TZS {g.amount.toLocaleString()}</div>
                </button>
              ))}
            </div>

            <div className="bg-[#10131B] p-3 rounded-2xl border border-[#262E3E] flex items-center justify-between text-xs">
              <span className="text-[#A7B0C0]">Salio Lako:</span>
              <span className="font-mono font-bold text-[#16C784]">TZS {(profile?.balanceTZS || 0).toLocaleString()}</span>
            </div>

            {tipStatus && (
              <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                {tipStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onOpenWallet}
                className="py-2.5 px-3 rounded-xl border border-[#262E3E] text-xs font-bold text-[#A7B0C0] hover:text-white"
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
