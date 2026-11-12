import React, { useState } from 'react';
import {
  AudioWaveform,
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Globe,
  Minus,
  Moon,
  Play,
  Plus,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Volume2,
  X,
} from 'lucide-react';
import { Language } from '../../types';
import {
  AUTO_TRANSLATE_LANGUAGES,
  AutoTranslateLang,
  CAPTION_COLORS,
  CAPTION_EDGE_STYLES,
  CAPTION_FONT_FAMILIES,
  CAPTION_FONT_OPACITIES,
  CAPTION_FONT_SIZES,
  CAPTION_OPACITIES,
  CaptionStyleOptions,
  DEFAULT_CAPTION_OPTIONS,
  QUALITY_CHOICES,
  SleepTimerMode,
  SubtitleMode,
  VideoQualityOption,
  formatCountdownClock,
  formatQualitySummary,
} from '../../lib/videoSettings';

type SettingsView =
  | 'main'
  | 'quality'
  | 'speed'
  | 'captions'
  | 'autoTranslate'
  | 'captionOptions'
  | 'captionOptionDetail'
  | 'sleepTimer';

type CaptionOptionField = keyof CaptionStyleOptions;

interface VideoSettingsSheetProps {
  language: Language;
  isEmbedVideo: boolean;
  isDataSaver: boolean;
  autoplayNext: boolean;
  stableVolume: boolean;
  voiceBoost: boolean;
  selectedQuality: VideoQualityOption;
  playbackSpeed: number;
  subtitleMode: SubtitleMode;
  autoTranslateLang: AutoTranslateLang;
  captionOptions: CaptionStyleOptions;
  sleepTimerMode: SleepTimerMode;
  sleepRemainingSeconds: number | null;
  remainingVideoSeconds: number;
  onClose: () => void;
  onToggleDataSaver: () => void;
  onToggleAutoplay: () => void;
  onToggleStableVolume: () => void;
  onToggleVoiceBoost: () => void;
  onSelectQuality: (q: VideoQualityOption) => void;
  onChangeSpeed: (s: number) => void;
  onSelectSubtitleMode: (mode: SubtitleMode, translateLang?: AutoTranslateLang) => void;
  onUpdateCaptionOptions: (next: CaptionStyleOptions) => void;
  onSelectSleepTimer: (mode: SleepTimerMode) => void;
}

export const VideoSettingsSheet: React.FC<VideoSettingsSheetProps> = ({
  language,
  isEmbedVideo,
  isDataSaver,
  autoplayNext,
  stableVolume,
  voiceBoost,
  selectedQuality,
  playbackSpeed,
  subtitleMode,
  autoTranslateLang,
  captionOptions,
  sleepTimerMode,
  sleepRemainingSeconds,
  remainingVideoSeconds,
  onClose,
  onToggleDataSaver,
  onToggleAutoplay,
  onToggleStableVolume,
  onToggleVoiceBoost,
  onSelectQuality,
  onChangeSpeed,
  onSelectSubtitleMode,
  onUpdateCaptionOptions,
  onSelectSleepTimer,
}) => {
  const isEn = language === 'en';
  const [view, setView] = useState<SettingsView>('main');
  const [detailField, setDetailField] = useState<CaptionOptionField>('fontFamily');

  const subtitleSummary = (() => {
    if (subtitleMode === 'off') return isEn ? 'Off' : 'Zima';
    if (subtitleMode === 'sw') return 'Kiswahili';
    if (subtitleMode === 'en') return isEn ? 'English (auto-generated)' : 'Kiingereza (Auto)';
    const found = AUTO_TRANSLATE_LANGUAGES.find((l) => l.code === autoTranslateLang);
    return found ? `${found.label} (${isEn ? 'Auto-translate' : 'Tafsiri'})` : 'Auto-translate';
  })();

  const sleepTimerSummary = (() => {
    if (sleepTimerMode === 'off') return isEn ? 'Off' : 'Zima';
    if (sleepTimerMode === 'end_of_video') {
      return isEn ? 'End of video' : 'Mwisho wa video';
    }
    if (typeof sleepRemainingSeconds === 'number' && sleepRemainingSeconds > 0) {
      return formatCountdownClock(sleepRemainingSeconds);
    }
    return `${sleepTimerMode} ${isEn ? 'min' : 'dakika'}`;
  })();

  const speedSummary =
    Math.abs(playbackSpeed - 1) < 0.001
      ? isEn
        ? 'Normal'
        : 'Kawaida'
      : `${playbackSpeed.toFixed(2).replace(/\.00$/, '')}x`;

  const remainingVideoLabel = (() => {
    const mins = Math.max(1, Math.round(remainingVideoSeconds / 60));
    if (remainingVideoSeconds < 60) {
      return `${Math.max(1, Math.round(remainingVideoSeconds))} sec`;
    }
    return `${mins} min`;
  })();

  const captionOptionRows: Array<{
    field: CaptionOptionField;
    label: string;
    valueDisplay: string;
  }> = [
    {
      field: 'fontFamily',
      label: isEn ? 'Font family' : 'Aina ya Herufi',
      valueDisplay: captionOptions.fontFamily,
    },
    {
      field: 'fontColor',
      label: isEn ? 'Font color' : 'Rangi ya Herufi',
      valueDisplay: captionOptions.fontColor,
    },
    {
      field: 'fontSizePercent',
      label: isEn ? 'Font size' : 'Ukubwa wa Herufi',
      valueDisplay: `${captionOptions.fontSizePercent}%`,
    },
    {
      field: 'backgroundColor',
      label: isEn ? 'Background color' : 'Rangi ya Mandharinyuma',
      valueDisplay: captionOptions.backgroundColor,
    },
    {
      field: 'backgroundOpacity',
      label: isEn ? 'Background opacity' : 'Uwazi wa Mandharinyuma',
      valueDisplay: `${captionOptions.backgroundOpacity}%`,
    },
    {
      field: 'windowColor',
      label: isEn ? 'Window color' : 'Rangi ya Dirisha',
      valueDisplay: captionOptions.windowColor,
    },
    {
      field: 'windowOpacity',
      label: isEn ? 'Window opacity' : 'Uwazi wa Dirisha',
      valueDisplay: `${captionOptions.windowOpacity}%`,
    },
    {
      field: 'characterEdgeStyle',
      label: isEn ? 'Character edge style' : 'Ukingo wa Herufi',
      valueDisplay: captionOptions.characterEdgeStyle,
    },
    {
      field: 'fontOpacity',
      label: isEn ? 'Font opacity' : 'Uwazi wa Herufi',
      valueDisplay: `${captionOptions.fontOpacity}%`,
    },
  ];

  const getDetailChoices = (field: CaptionOptionField): Array<{ label: string; value: any }> => {
    switch (field) {
      case 'fontFamily':
        return CAPTION_FONT_FAMILIES.map((v) => ({ label: v, value: v }));
      case 'fontColor':
      case 'backgroundColor':
      case 'windowColor':
        return CAPTION_COLORS.map((v) => ({ label: v, value: v }));
      case 'fontSizePercent':
        return CAPTION_FONT_SIZES.map((v) => ({ label: `${v}%`, value: v }));
      case 'backgroundOpacity':
      case 'windowOpacity':
        return CAPTION_OPACITIES.map((v) => ({ label: `${v}%`, value: v }));
      case 'fontOpacity':
        return CAPTION_FONT_OPACITIES.map((v) => ({ label: `${v}%`, value: v }));
      case 'characterEdgeStyle':
        return CAPTION_EDGE_STYLES.map((v) => ({ label: v, value: v }));
      default:
        return [];
    }
  };

  const detailTitle = captionOptionRows.find((r) => r.field === detailField)?.label || 'Options';

  const handleBack = () => {
    if (view === 'captionOptionDetail') setView('captionOptions');
    else if (view === 'captionOptions' || view === 'autoTranslate') setView('captions');
    else setView('main');
  };

  const renderHeader = () => {
    const titles: Record<SettingsView, string> = {
      main: isEn ? 'Video Settings' : 'Mipangilio ya Video',
      quality: isEn ? 'Quality' : 'Ubora wa Picha',
      speed: isEn ? 'Playback speed' : 'Kasi ya Video',
      captions: 'Subtitles/CC',
      autoTranslate: isEn ? 'Auto-translate' : 'Tafsiri Otomatiki',
      captionOptions: isEn ? 'Options' : 'Muonekano wa Manukuu',
      captionOptionDetail: detailTitle,
      sleepTimer: isEn ? 'Sleep timer' : 'Kipima Muda',
    };

    return (
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E] shrink-0">
        {view === 'main' ? (
          <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#FF3040]" />
            <span>{titles.main}</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-900 dark:text-white hover:text-[#FF3040] transition-colors cursor-pointer py-0.5"
          >
            <ChevronLeft className="w-5 h-5 -ml-1" />
            <span>{titles[view]}</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {view === 'captions' && (
            <button
              type="button"
              onClick={() => setView('captionOptions')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/10 underline underline-offset-4 cursor-pointer transition-colors"
            >
              {isEn ? 'Options' : 'Muonekano'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label={isEn ? 'Close' : 'Funga'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[390px] bg-white dark:bg-[#191E29] border-t sm:border border-slate-200 dark:border-[#262E3E] rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 max-h-[85dvh] flex flex-col text-left animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        {renderHeader()}

        <div className="overflow-y-auto pt-2 space-y-1 flex-1 pr-0.5">
          {isEmbedVideo && view === 'main' && (
            <div className="mb-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
              {isEn
                ? 'This video plays via an external embed; use its bottom-right gear icon for provider tracks as well.'
                : 'Video hii inachezwa kutoka kwa mtoa huduma wa nje; mipangilio ya ubora na manukuu inaweza pia kupatikana chini kulia ndani ya video.'}
            </div>
          )}

          {/* 1. MAIN SETTINGS MENU */}
          {view === 'main' && (
            <div className="divide-y divide-slate-100 dark:divide-[#262E3E]/60">
              {!isEmbedVideo && (
                <>
                  {/* Stable Volume */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <AudioWaveform className="w-4.5 h-4.5 text-slate-600 dark:text-[#CBD5E1] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white block">
                          {isEn ? 'Stable Volume' : 'Usawazishaji wa Sauti (Stable Volume)'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block truncate">
                          {isEn ? 'Balance sudden loud & quiet parts' : 'Huweka kiwango sawa cha sauti'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={stableVolume}
                      onClick={onToggleStableVolume}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                        stableVolume ? 'bg-[#16C784]' : 'bg-slate-300 dark:bg-[#2F374A]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          stableVolume ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Voice boost */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Volume2 className="w-4.5 h-4.5 text-slate-600 dark:text-[#CBD5E1] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white block">
                          {isEn ? 'Voice boost' : 'Kuza Sauti ya Mazungumzo (Voice boost)'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block truncate">
                          {isEn ? 'Enhance spoken dialogue clarity' : 'Huongeza uwazi wa sauti za mazungumzo'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={voiceBoost}
                      onClick={onToggleVoiceBoost}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                        voiceBoost ? 'bg-[#16C784]' : 'bg-slate-300 dark:bg-[#2F374A]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          voiceBoost ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Subtitles/CC Drill-down */}
                  <button
                    type="button"
                    onClick={() => setView('captions')}
                    className="w-full py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-1.5 -mx-1.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Captions className="w-4.5 h-4.5 text-slate-600 dark:text-[#CBD5E1] shrink-0" />
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                        Subtitles/CC
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A7B0C0] shrink-0 max-w-[50%]">
                      <span className="truncate font-medium">{subtitleSummary}</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </div>
                  </button>

                  {/* Sleep timer Drill-down */}
                  <button
                    type="button"
                    onClick={() => setView('sleepTimer')}
                    className="w-full py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-1.5 -mx-1.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Moon
                        className={`w-4.5 h-4.5 shrink-0 ${
                          sleepTimerMode !== 'off'
                            ? 'text-[#FF3040]'
                            : 'text-slate-600 dark:text-[#CBD5E1]'
                        }`}
                      />
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                        {isEn ? 'Sleep timer' : 'Kipima Muda (Sleep timer)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A7B0C0] shrink-0">
                      <span
                        className={`font-medium tabular-nums ${
                          sleepTimerMode !== 'off' ? 'text-[#FF3040] font-bold' : ''
                        }`}
                      >
                        {sleepTimerSummary}
                      </span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </div>
                  </button>

                  {/* Playback speed Drill-down */}
                  <button
                    type="button"
                    onClick={() => setView('speed')}
                    className="w-full py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-1.5 -mx-1.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Gauge className="w-4.5 h-4.5 text-slate-600 dark:text-[#CBD5E1] shrink-0" />
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                        {isEn ? 'Playback speed' : 'Kasi ya Video'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A7B0C0] shrink-0">
                      <span className="font-medium tabular-nums">{speedSummary}</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </div>
                  </button>

                  {/* Quality Drill-down */}
                  <button
                    type="button"
                    onClick={() => setView('quality')}
                    className="w-full py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-1.5 -mx-1.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SlidersHorizontal className="w-4.5 h-4.5 text-slate-600 dark:text-[#CBD5E1] shrink-0" />
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                        {isEn ? 'Quality' : 'Ubora wa Picha'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A7B0C0] shrink-0">
                      <span className="font-medium">
                        {formatQualitySummary(selectedQuality, isDataSaver, language)}
                      </span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </div>
                  </button>
                </>
              )}

              {/* Bana Bando (Data Saver) */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Smartphone className="w-4.5 h-4.5 text-slate-600 dark:text-[#CBD5E1] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white block">
                      {isEn ? 'Data Saver' : 'Bana Bando (Data Saver)'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block truncate">
                      {isEn ? '360p across the app' : '360p kuokoa MBs kote kwenye app'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDataSaver}
                  onClick={onToggleDataSaver}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                    isDataSaver ? 'bg-[#16C784]' : 'bg-slate-300 dark:bg-[#2F374A]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      isDataSaver ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Cheza Video Inayofuata (Autoplay) */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Play className="w-4.5 h-4.5 text-slate-600 dark:text-[#CBD5E1] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white block">
                      {isEn ? 'Autoplay next video' : 'Cheza Video Inayofuata'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block truncate">
                      {isEn ? 'Automatically play next video' : 'Autoplay video ikiisha'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoplayNext}
                  onClick={onToggleAutoplay}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                    autoplayNext ? 'bg-[#FF3040]' : 'bg-slate-300 dark:bg-[#2F374A]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      autoplayNext ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* 2. QUALITY SUBMENU (2160p 4K down to 144p + Auto) */}
          {view === 'quality' && (
            <div className="space-y-0.5 py-1">
              {QUALITY_CHOICES.map((q) => {
                const isSelected = selectedQuality === q.value;
                return (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => {
                      onSelectQuality(q.value);
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-2.5 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <span className="w-5 flex items-center justify-center shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-[#FF3040] stroke-[2.5]" />}
                    </span>
                    <span
                      className={`text-sm flex items-baseline gap-1 ${
                        isSelected
                          ? 'font-extrabold text-slate-900 dark:text-white'
                          : 'font-semibold text-slate-700 dark:text-[#E2E8F0]'
                      }`}
                    >
                      <span>{q.label}</span>
                      {q.badge && (
                        <sup className="text-[10px] font-black text-slate-500 dark:text-[#94A3B8]">
                          {q.badge}
                        </sup>
                      )}
                      {q.value === 'Auto' && (
                        <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8] ml-1">
                          ({isDataSaver ? '360p' : '1080p HD'})
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. PLAYBACK SPEED SUBMENU (0.25x - 3.00x slider + presets) */}
          {view === 'speed' && (
            <div className="py-4 px-1 space-y-6">
              <div className="text-center">
                <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {playbackSpeed.toFixed(2)}x
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(0.25, Math.round((playbackSpeed - 0.05) * 100) / 100);
                    onChangeSpeed(next);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  aria-label="Decrease speed"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min={0.25}
                  max={3}
                  step={0.05}
                  value={playbackSpeed}
                  onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-[#FF3040] cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(3, Math.round((playbackSpeed + 0.05) * 100) / 100);
                    onChangeSpeed(next);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  aria-label="Increase speed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { value: 1, label: '1.0', sub: isEn ? 'Normal' : 'Kawaida' },
                  { value: 1.25, label: '1.25' },
                  { value: 1.5, label: '1.5' },
                  { value: 2, label: '2.0' },
                  { value: 3, label: '3.0', premiumBadge: true },
                ].map((preset) => {
                  const isActive = Math.abs(playbackSpeed - preset.value) < 0.02;
                  return (
                    <div key={preset.value} className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onChangeSpeed(preset.value)}
                        className={`w-full min-h-[38px] px-1.5 rounded-full text-xs font-bold tabular-nums flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/30'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#232A39] dark:hover:bg-[#2E374B] dark:text-white'
                        }`}
                      >
                        {preset.premiumBadge && (
                          <span className="px-1 py-0.2 rounded bg-[#FF3040] text-white text-[9px] font-black leading-tight">
                            P
                          </span>
                        )}
                        <span>{preset.label}</span>
                      </button>
                      {preset.sub && (
                        <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                          {preset.sub}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. SUBTITLES / CC SUBMENU */}
          {view === 'captions' && (
            <div className="space-y-0.5 py-1">
              {[
                { mode: 'off' as const, label: isEn ? 'Off' : 'Zima (Off)' },
                { mode: 'sw' as const, label: 'Kiswahili' },
                {
                  mode: 'en' as const,
                  label: isEn ? 'English (auto-generated)' : 'English (auto-generated)',
                },
              ].map((item) => {
                const isSelected = subtitleMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => {
                      onSelectSubtitleMode(item.mode);
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-2.5 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <span className="w-5 flex items-center justify-center shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-[#FF3040] stroke-[2.5]" />}
                    </span>
                    <span
                      className={`text-sm ${
                        isSelected
                          ? 'font-extrabold text-slate-900 dark:text-white'
                          : 'font-semibold text-slate-700 dark:text-[#E2E8F0]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setView('autoTranslate')}
                className="w-full min-h-[44px] px-2.5 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 flex items-center justify-center shrink-0">
                    {subtitleMode === 'auto_translate' ? (
                      <Check className="w-4 h-4 text-[#FF3040] stroke-[2.5]" />
                    ) : (
                      <Globe className="w-4 h-4 text-slate-500 dark:text-[#94A3B8]" />
                    )}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-[#E2E8F0]">
                    {isEn ? 'Auto-translate' : 'Tafsiri Otomatiki (Auto-translate)'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* 4b. AUTO-TRANSLATE LANGUAGE PICKER */}
          {view === 'autoTranslate' && (
            <div className="space-y-0.5 py-1">
              {AUTO_TRANSLATE_LANGUAGES.map((langItem) => {
                const isSelected =
                  subtitleMode === 'auto_translate' && autoTranslateLang === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => {
                      onSelectSubtitleMode('auto_translate', langItem.code);
                      onClose();
                    }}
                    className="w-full min-h-[42px] px-2.5 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <span className="w-5 flex items-center justify-center shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-[#FF3040] stroke-[2.5]" />}
                    </span>
                    <span
                      className={`text-sm ${
                        isSelected
                          ? 'font-extrabold text-slate-900 dark:text-white'
                          : 'font-semibold text-slate-700 dark:text-[#E2E8F0]'
                      }`}
                    >
                      {langItem.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 5. CAPTION OPTIONS SUBMENU (9 styling controls + Reset) */}
          {view === 'captionOptions' && (
            <div className="space-y-0.5 py-1">
              {captionOptionRows.map((row) => (
                <button
                  key={row.field}
                  type="button"
                  onClick={() => {
                    setDetailField(row.field);
                    setView('captionOptionDetail');
                  }}
                  className="w-full min-h-[44px] px-2.5 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-white">
                    {row.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-[#A7B0C0] max-w-[52%]">
                    <span className="truncate">{row.valueDisplay}</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </span>
                </button>
              ))}

              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-[#262E3E]">
                <button
                  type="button"
                  onClick={() => onUpdateCaptionOptions({ ...DEFAULT_CAPTION_OPTIONS })}
                  className="w-full min-h-[42px] px-2.5 rounded-xl flex items-center gap-2 text-[13px] font-bold text-[#FF3040] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isEn ? 'Reset' : 'Rejesha Chaguo-msingi (Reset)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 5b. CAPTION OPTION DETAIL PICKER */}
          {view === 'captionOptionDetail' && (
            <div className="space-y-0.5 py-1">
              {getDetailChoices(detailField).map((choice) => {
                const isSelected = captionOptions[detailField] === choice.value;
                return (
                  <button
                    key={String(choice.value)}
                    type="button"
                    onClick={() => {
                      onUpdateCaptionOptions({
                        ...captionOptions,
                        [detailField]: choice.value,
                      });
                      setView('captionOptions');
                    }}
                    className="w-full min-h-[42px] px-2.5 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <span className="w-5 flex items-center justify-center shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-[#FF3040] stroke-[2.5]" />}
                    </span>
                    <span
                      className={`text-sm ${
                        isSelected
                          ? 'font-extrabold text-slate-900 dark:text-white'
                          : 'font-semibold text-slate-700 dark:text-[#E2E8F0]'
                      }`}
                    >
                      {choice.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 6. SLEEP TIMER SUBMENU */}
          {view === 'sleepTimer' && (
            <div className="space-y-0.5 py-1">
              {[
                { mode: 'off' as const, label: isEn ? 'Off' : 'Zima (Off)' },
                { mode: 10 as const, label: isEn ? '10 minutes' : 'Dakika 10' },
                { mode: 15 as const, label: isEn ? '15 minutes' : 'Dakika 15' },
                { mode: 20 as const, label: isEn ? '20 minutes' : 'Dakika 20' },
                { mode: 30 as const, label: isEn ? '30 minutes' : 'Dakika 30' },
                { mode: 45 as const, label: isEn ? '45 minutes' : 'Dakika 45' },
                { mode: 60 as const, label: isEn ? '60 minutes' : 'Dakika 60' },
                {
                  mode: 'end_of_video' as const,
                  label: isEn ? 'End of video' : 'Mwisho wa video',
                  sub: remainingVideoLabel,
                },
              ].map((item) => {
                const isSelected = sleepTimerMode === item.mode;
                return (
                  <button
                    key={String(item.mode)}
                    type="button"
                    onClick={() => {
                      onSelectSleepTimer(item.mode);
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-2.5 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <span className="w-5 flex items-center justify-center shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-[#FF3040] stroke-[2.5]" />}
                    </span>
                    <div className="min-w-0">
                      <span
                        className={`text-sm block ${
                          isSelected
                            ? 'font-extrabold text-slate-900 dark:text-white'
                            : 'font-semibold text-slate-700 dark:text-[#E2E8F0]'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.sub && (
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono tabular-nums block">
                          {item.sub}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
