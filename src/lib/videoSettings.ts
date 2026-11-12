import React from 'react';
import { Language } from '../types';

export type VideoQualityOption =
  | 'Auto'
  | '2160p'
  | '1440p'
  | '1080p'
  | '720p'
  | '480p'
  | '360p'
  | '240p'
  | '144p';

export type SubtitleMode = 'off' | 'sw' | 'en' | 'auto_translate';

export type AutoTranslateLang = 'sw' | 'en' | 'fr' | 'ar' | 'es' | 'pt' | 'hi' | 'zh';

export type CaptionFontFamily =
  | 'Proportional Sans-Serif'
  | 'Monospace Sans-Serif'
  | 'Proportional Serif'
  | 'Monospace Serif'
  | 'Casual'
  | 'Cursive';

export type CaptionColorName =
  | 'White'
  | 'Yellow'
  | 'Green'
  | 'Cyan'
  | 'Blue'
  | 'Magenta'
  | 'Red'
  | 'Black';

export type CaptionEdgeStyle = 'None' | 'Drop shadow' | 'Raised' | 'Depressed' | 'Outline';

export interface CaptionStyleOptions {
  fontFamily: CaptionFontFamily;
  fontColor: CaptionColorName;
  fontSizePercent: number;
  backgroundColor: CaptionColorName;
  backgroundOpacity: number;
  windowColor: CaptionColorName;
  windowOpacity: number;
  characterEdgeStyle: CaptionEdgeStyle;
  fontOpacity: number;
}

export type SleepTimerMode = 'off' | 'end_of_video' | number; // number = minutes (10,15,20,30,45,60)

export const DEFAULT_CAPTION_OPTIONS: CaptionStyleOptions = {
  fontFamily: 'Proportional Sans-Serif',
  fontColor: 'White',
  fontSizePercent: 100,
  backgroundColor: 'Black',
  backgroundOpacity: 75,
  windowColor: 'Black',
  windowOpacity: 0,
  characterEdgeStyle: 'None',
  fontOpacity: 100,
};

export const QUALITY_CHOICES: Array<{
  value: VideoQualityOption;
  label: string;
  badge?: '4K' | 'HD';
}> = [
  { value: '2160p', label: '2160p', badge: '4K' },
  { value: '1440p', label: '1440p', badge: 'HD' },
  { value: '1080p', label: '1080p', badge: 'HD' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
  { value: '360p', label: '360p' },
  { value: '240p', label: '240p' },
  { value: '144p', label: '144p' },
  { value: 'Auto', label: 'Auto' },
];

export const AUTO_TRANSLATE_LANGUAGES: Array<{ code: AutoTranslateLang; label: string }> = [
  { code: 'sw', label: 'Kiswahili' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'zh', label: '中文' },
];

export const CAPTION_FONT_FAMILIES: CaptionFontFamily[] = [
  'Proportional Sans-Serif',
  'Monospace Sans-Serif',
  'Proportional Serif',
  'Monospace Serif',
  'Casual',
  'Cursive',
];

export const CAPTION_COLORS: CaptionColorName[] = [
  'White',
  'Yellow',
  'Green',
  'Cyan',
  'Blue',
  'Magenta',
  'Red',
  'Black',
];

export const CAPTION_FONT_SIZES: number[] = [50, 75, 100, 125, 150, 200];
export const CAPTION_OPACITIES: number[] = [0, 25, 50, 75, 100];
export const CAPTION_FONT_OPACITIES: number[] = [25, 50, 75, 100];
export const CAPTION_EDGE_STYLES: CaptionEdgeStyle[] = [
  'None',
  'Drop shadow',
  'Raised',
  'Depressed',
  'Outline',
];

const COLOR_RGB_MAP: Record<CaptionColorName, [number, number, number]> = {
  White: [255, 255, 255],
  Yellow: [250, 204, 21],
  Green: [34, 197, 94],
  Cyan: [34, 211, 238],
  Blue: [59, 130, 246],
  Magenta: [232, 121, 249],
  Red: [239, 68, 68],
  Black: [0, 0, 0],
};

const FONT_FAMILY_CSS_MAP: Record<CaptionFontFamily, string> = {
  'Proportional Sans-Serif': '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif',
  'Monospace Sans-Serif': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  'Proportional Serif': 'Georgia, "Times New Roman", Times, serif',
  'Monospace Serif': '"Courier New", Courier, monospace',
  Casual: '"Comic Sans MS", "Trebuchet MS", cursive, sans-serif',
  Cursive: '"Brush Script MT", "Segoe Script", cursive',
};

const EDGE_SHADOW_MAP: Record<CaptionEdgeStyle, string> = {
  None: 'none',
  'Drop shadow': '0 2px 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.85)',
  Raised: '-1px -1px 0 rgba(255,255,255,0.4), 1px 2px 2px rgba(0,0,0,0.95)',
  Depressed: '1px 1px 0 rgba(255,255,255,0.3), -1px -2px 2px rgba(0,0,0,0.95)',
  Outline: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 3px #000',
};

export function toRgba(color: CaptionColorName, opacityPercent: number): string {
  const [r, g, b] = COLOR_RGB_MAP[color] || [0, 0, 0];
  const alpha = Math.max(0, Math.min(1, opacityPercent / 100));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildCaptionStyles(options: CaptionStyleOptions): {
  windowStyle: React.CSSProperties;
  textStyle: React.CSSProperties;
} {
  const fontScale = Math.max(0.5, Math.min(2, options.fontSizePercent / 100));
  return {
    windowStyle: {
      backgroundColor: toRgba(options.windowColor, options.windowOpacity),
      padding: options.windowOpacity > 0 ? '6px 10px' : '0px',
      borderRadius: '10px',
    },
    textStyle: {
      fontFamily: FONT_FAMILY_CSS_MAP[options.fontFamily],
      color: toRgba(options.fontColor, options.fontOpacity),
      backgroundColor: toRgba(options.backgroundColor, options.backgroundOpacity),
      fontSize: `${Math.round(13 * fontScale)}px`,
      lineHeight: 1.45,
      textShadow: EDGE_SHADOW_MAP[options.characterEdgeStyle],
      padding: '4px 10px',
      borderRadius: '8px',
      display: 'inline-block',
    },
  };
}

const CAPTION_CUES: Record<AutoTranslateLang, [string, string, string, string, string]> = {
  sw: [
    'Habari za leo! Karibu kwenye Tazama Tanzania.',
    'Tazama video na filamu bora zaidi za waumbaji wetu.',
    'Gonga Like, Fuatilia chaneli, na acha maoni yako hapa chini.',
    'Tuma Zawadi kusaidia sanaa na kazi ya muumbaji.',
    'Asante sana kwa kutazama kupitia Tazama!',
  ],
  en: [
    'Hello! Welcome to Tazama Tanzania.',
    'Watch top videos and films from talented local creators.',
    'Tap Like, Subscribe to the channel, and share your thoughts below.',
    'Send Gifts to directly support the creator and their craft.',
    'Thank you for watching on Tazama!',
  ],
  fr: [
    'Bonjour ! Bienvenue sur Tazama Tanzanie.',
    'Découvrez les meilleures vidéos et films de nos créateurs.',
    'Aimez, abonnez-vous à la chaîne et laissez votre commentaire.',
    'Envoyez des cadeaux pour soutenir directement l’artiste.',
    'Merci de regarder sur Tazama !',
  ],
  ar: [
    'مرحبًا بكم في منصة تزاما تنزانيا!',
    'شاهد أفضل الفيديوهات والأفلام من المبدعين الموهوبين.',
    'اضغط إعجاب واشترك في القناة وشاركنا رأيك في التعليقات.',
    'أرسل الهدايا لدعم صانع المحتوى وأعماله الفنية.',
    'شكرًا جزيلاً لمشاهدتك عبر تزاما!',
  ],
  es: [
    '¡Hola! Bienvenido a Tazama Tanzania.',
    'Disfruta los mejores videos y películas de nuestros creadores.',
    'Dale Me gusta, suscríbete al canal y deja tu comentario abajo.',
    'Envía regalos para apoyar directamente al creador.',
    '¡Gracias por ver contenido en Tazama!',
  ],
  pt: [
    'Olá! Bem-vindo ao Tazama Tanzânia.',
    'Assista aos melhores vídeos e filmes dos nossos criadores.',
    'Curta, inscreva-se no canal e deixe seu comentário abaixo.',
    'Envie presentes para apoiar diretamente o criador.',
    'Muito obrigado por assistir no Tazama!',
  ],
  hi: [
    'नमस्ते! तज़ामा तंजानिया में आपका स्वागत है।',
    'हमारे रचनाकारों के सर्वश्रेष्ठ वीडियो और फ़िल्में देखें।',
    'लाइक करें, चैनल सब्सक्राइब करें और नीचे अपनी राय लिखें।',
    'कलाकार के काम को समर्थन देने के लिए उपहार भेजें।',
    'तज़ामा पर देखने के लिए धन्यवाद!',
  ],
  zh: [
    '你好！欢迎来到 Tazama 坦桑尼亚。',
    '观看本地优秀创作者带来的精彩视频与影片。',
    '点赞、订阅频道，并在下方留下你的评论。',
    '发送礼物，直接支持创作者的精彩作品。',
    '感谢在 Tazama 观看！',
  ],
};

export function getCaptionCueForTime(
  timeSeconds: number,
  lang: AutoTranslateLang
): string {
  const cues = CAPTION_CUES[lang] || CAPTION_CUES.sw;
  if (timeSeconds < 4) return cues[0];
  if (timeSeconds < 9) return cues[1];
  if (timeSeconds < 15) return cues[2];
  if (timeSeconds < 22) return cues[3];
  return cues[4];
}

export function formatQualitySummary(
  quality: VideoQualityOption,
  isDataSaver: boolean,
  lang: Language
): string {
  if (quality === 'Auto') {
    const effective = isDataSaver ? '360p' : '1080p HD';
    return lang === 'en' ? `Auto (${effective})` : `Auto (${effective})`;
  }
  if (quality === '2160p') return '2160p 4K';
  if (quality === '1440p' || quality === '1080p') return `${quality} HD`;
  return quality;
}

export function formatCountdownClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function loadStoredCaptionOptions(): CaptionStyleOptions {
  if (typeof window === 'undefined') return DEFAULT_CAPTION_OPTIONS;
  try {
    const raw = localStorage.getItem('tazama_caption_options');
    if (!raw) return DEFAULT_CAPTION_OPTIONS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CAPTION_OPTIONS, ...parsed };
  } catch {
    return DEFAULT_CAPTION_OPTIONS;
  }
}

export function saveStoredCaptionOptions(opts: CaptionStyleOptions): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tazama_caption_options', JSON.stringify(opts));
  } catch {}
}

export function isCorsFriendlyVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/')) {
    return true;
  }
  if (typeof window !== 'undefined' && url.startsWith(window.location.origin)) {
    return true;
  }
  return /cloudinary\.com|googleapis\.com|firebasestorage\.app|r2\.cloudflarestorage\.com|videodelivery\.net|cloudflarestream\.com/i.test(
    url
  );
}

/**
 * Applies Cloudinary adaptive resolution/quality transform when a direct Cloudinary video URL is used
 * and a specific target quality was chosen by the user. Non-Cloudinary URLs are returned unchanged.
 */
export function applyQualityHintToStreamUrl(
  rawUrl: string,
  quality: VideoQualityOption,
  isDataSaver: boolean
): string {
  if (!rawUrl || !rawUrl.includes('res.cloudinary.com') || !rawUrl.includes('/video/upload/')) {
    return rawUrl;
  }
  const effective: VideoQualityOption =
    quality === 'Auto' ? (isDataSaver ? '360p' : 'Auto') : quality;
  if (effective === 'Auto') return rawUrl;

  const heightMap: Record<Exclude<VideoQualityOption, 'Auto'>, string> = {
    '2160p': 'h_2160,q_auto:best',
    '1440p': 'h_1440,q_auto:good',
    '1080p': 'h_1080,q_auto:good',
    '720p': 'h_720,q_auto:good',
    '480p': 'h_480,q_auto:eco',
    '360p': 'h_360,q_auto:low',
    '240p': 'h_240,q_auto:low',
    '144p': 'h_144,q_auto:low',
  };
  const transform = heightMap[effective];
  if (!transform) return rawUrl;

  // Strip any existing simple h_xxx,q_auto:xxx prefix right after /video/upload/ if present
  const marker = '/video/upload/';
  const idx = rawUrl.indexOf(marker);
  if (idx === -1) return rawUrl;
  const before = rawUrl.slice(0, idx + marker.length);
  let after = rawUrl.slice(idx + marker.length);
  after = after.replace(/^h_\d+,q_auto:[a-z]+\//, '');
  return `${before}${transform}/${after}`;
}
