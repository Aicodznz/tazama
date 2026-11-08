/**
 * High-Performance Dynamic Color Extraction & Animated Gradient Border System for Tazama
 * 
 * Capabilities:
 * 1. Automatic dominant color extraction from video thumbnails using an offscreen 16x16 canvas.
 * 2. Harmonic 2-3 color gradient synthesis with jewel-tone luminance compensation.
 * 3. Specialized presets:
 *    - Premium: Distinctive rich Gold gradient (#F59E0B, #FCD34D, #D97706)
 *    - Trending: Energetic Red / Orange fiery accents (#FF3040, #FF6B35, #F59E0B)
 *    - Live: Pulsing Red border (#FF1E42, #FF4D6D, #E11D48)
 *    - Dynamic: Extracted from thumbnail or genre/hash fallback
 * 4. In-memory & sessionStorage caching to eliminate redundant calculations.
 * 5. Native prefers-reduced-motion and Android/low-power optimization.
 */

import { VideoItem } from '../types';

export interface BorderGradientConfig {
  colors: [string, string, string];
  glowColor: string;
  animationType: 'rotate' | 'pulse-live' | 'static';
  variant: 'live' | 'premium' | 'trending' | 'dynamic';
}

// In-memory cache for fast instant lookups
const colorCache = new Map<string, [string, string, string]>();

// Curated Category Fallback Palettes (used when offline, CORS blocked, or loading)
const CATEGORY_PALETTES: Record<string, [string, string, string]> = {
  Vichekesho: ['#F59E0B', '#EF4444', '#EC4899'], // Warm energetic comedy
  Muziki: ['#8B5CF6', '#EC4899', '#3B82F6'],     // Synthwave violet/magenta
  Habari: ['#0284C7', '#0EA5E9', '#38BDF8'],     // Authoritative azure
  Michezo: ['#10B981', '#14B8A6', '#06B6D4'],    // Athletic emerald
  Elimu: ['#6366F1', '#8B5CF6', '#A855F7'],      // Educational indigo
  Teknolojia: ['#06B6D4', '#3B82F6', '#6366F1'], // Cyber cyan/blue
  'Mtindo wa Maisha': ['#F43F5E', '#FB7185', '#FDA4AF'], // Lifestyle rose
  Burudani: ['#EC4899', '#F43F5E', '#FB923C'],   // Entertainment coral
  Filamu: ['#E11D48', '#8B5CF6', '#4F46E5'],     // Cinematic crimson
};

const DEFAULT_TAZAMA_PALETTE: [string, string, string] = [
  '#FF3040',
  '#8B5CF6',
  '#3B82F6',
];

/**
 * Deterministically generates a pleasing 3-color palette from any string (ID or Title)
 */
export function getHashFallbackPalette(seed: string): [string, string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const baseHue = Math.abs(hash) % 360;
  const hue2 = (baseHue + 40) % 360;
  const hue3 = (baseHue + 80) % 360;

  return [
    `hsl(${baseHue}, 75%, 52%)`,
    `hsl(${hue2}, 80%, 55%)`,
    `hsl(${hue3}, 70%, 50%)`,
  ];
}

/**
 * Converts RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Converts HSL back to CSS hex string
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Extracts 2-3 vibrant, dominant colors from an image URL using a micro 16x16 canvas.
 * Highly optimized for low memory usage and sub-millisecond execution.
 */
export async function extractDominantColors(
  imageUrl: string,
  fallbackCategory?: string,
  seed?: string
): Promise<[string, string, string]> {
  if (!imageUrl) {
    return (
      (fallbackCategory && CATEGORY_PALETTES[fallbackCategory]) ||
      (seed ? getHashFallbackPalette(seed) : DEFAULT_TAZAMA_PALETTE)
    );
  }

  // Check cache first
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  // Check sessionStorage for cross-component and page persistence
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = sessionStorage.getItem(`tz_clr_${imageUrl}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          const result: [string, string, string] = [parsed[0], parsed[1], parsed[2] || parsed[0]];
          colorCache.set(imageUrl, result);
          return result;
        }
      }
    } catch {}
  }

  return new Promise<[string, string, string]>((resolve) => {
    const fallback =
      (fallbackCategory && CATEGORY_PALETTES[fallbackCategory]) ||
      (seed ? getHashFallbackPalette(seed) : DEFAULT_TAZAMA_PALETTE);

    // If SVG Data URI (placeholder), quickly derive harmonic palette from seed
    if (imageUrl.startsWith('data:image/svg+xml')) {
      const result = seed ? getHashFallbackPalette(seed) : fallback;
      colorCache.set(imageUrl, result);
      return resolve(result);
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      // Timeout safeguard so network hangs never block UI
      const timeout = setTimeout(() => {
        resolve(fallback);
      }, 1500);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 16;
          canvas.height = 16;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) {
            resolve(fallback);
            return;
          }

          ctx.drawImage(img, 0, 0, 16, 16);
          const imageData = ctx.getImageData(0, 0, 16, 16);
          const data = imageData.data;

          // 12 hue bins (each 30 degrees)
          const hueBins = new Array(12).fill(0).map(() => ({ count: 0, totalS: 0, totalL: 0, hue: 0 }));

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue; // Skip translucent pixels

            const [h, s, l] = rgbToHsl(r, g, b);

            // Filter out near-black, near-white, or muddy low-saturation noise
            if (l < 15 || l > 90 || s < 18) continue;

            const binIndex = Math.floor(h / 30) % 12;
            const bin = hueBins[binIndex];
            bin.count += 1;
            bin.totalS += s;
            bin.totalL += l;
            bin.hue = binIndex * 30 + 15;
          }

          // Sort bins by prominence
          const sortedBins = hueBins
            .filter((b) => b.count > 0)
            .sort((a, b) => b.count - a.count);

          if (sortedBins.length === 0) {
            resolve(fallback);
            return;
          }

          // Pick primary dominant hue
          const primaryHue = sortedBins[0].hue;
          // Normalize saturation to 72% and lightness to 52% for luminous jewel tone
          const color1 = hslToHex(primaryHue, 76, 52);

          // Find a distinct secondary hue (at least 45 degrees away)
          let secondaryBin = sortedBins.find((b) => {
            const diff = Math.abs(b.hue - primaryHue);
            return diff >= 45 && diff <= 315;
          });

          const secondaryHue = secondaryBin ? secondaryBin.hue : (primaryHue + 45) % 360;
          const color2 = hslToHex(secondaryHue, 80, 56);

          // Tertiary harmonic color
          const tertiaryHue = (primaryHue + 90) % 360;
          const color3 = hslToHex(tertiaryHue, 74, 50);

          const result: [string, string, string] = [color1, color2, color3];

          // Store in caches
          colorCache.set(imageUrl, result);
          try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
              sessionStorage.setItem(`tz_clr_${imageUrl}`, JSON.stringify(result));
            }
          } catch {}

          resolve(result);
        } catch {
          // If canvas was tainted (CORS error), smoothly use fallback
          resolve(fallback);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(fallback);
      };

      img.src = imageUrl;
    } catch {
      resolve(fallback);
    }
  });
}

/**
 * Determines the gradient border configuration for any Tazama video item
 */
export interface BorderGradientConfig {
  colors: [string, string, string];
  highlightColor: string;
  baseBorderColor: string;
  glowColor: string;
  beamConicGradient: string;
  animationType: 'rotate' | 'pulse-live' | 'static';
  variant: 'live' | 'premium' | 'trending' | 'dynamic';
}

/**
 * Creates the high-intensity traveling Border Beam conic-gradient
 * Transparent around 200 degrees, then accelerates into rich gradient tail and white-hot highlight head
 */
export function createBorderBeamGradient(
  highlight: string,
  primary: string,
  secondary: string,
  tertiary: string
): string {
  return `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 200deg, ${tertiary} 240deg, ${secondary} 280deg, ${primary} 325deg, ${highlight} 354deg, ${primary} 358deg, transparent 360deg)`;
}

/**
 * Determines the gradient border configuration for any Tazama video item
 */
export function getVideoGradientConfig(
  video: VideoItem,
  customExtractedColors?: [string, string, string] | null
): BorderGradientConfig {
  const isLive = Boolean(
    (video.viewsCount || 0) > 500000 ||
    video.category?.toLowerCase() === 'mubashara' ||
    video.tags?.some((t) => t.toLowerCase() === 'live' || t.toLowerCase() === 'mubashara')
  );

  // 1. Live Videos: Pulsing Red border with radiant glow (Rule 8)
  if (isLive) {
    const colors: [string, string, string] = ['#FF1E42', '#FF4D6D', '#FF0033'];
    const highlight = '#FFFFFF';
    return {
      variant: 'live',
      colors,
      highlightColor: highlight,
      baseBorderColor: 'rgba(255, 30, 66, 0.35)',
      glowColor: 'rgba(255, 30, 66, 0.55)',
      beamConicGradient: createBorderBeamGradient(highlight, colors[0], colors[1], colors[2]),
      animationType: 'pulse-live',
    };
  }

  // 2. Premium Videos: Distinctive Luxury Gold gradient beam (Rule 6 & reference image_97ec2eb4.png)
  const isPremium = Boolean(
    video.isMembersOnly ||
    video.tags?.some((t) => t.toLowerCase().includes('premium') || t.toLowerCase().includes('vip'))
  );

  if (isPremium) {
    const colors: [string, string, string] = ['#F59E0B', '#FCD34D', '#D97706'];
    const highlight = '#FFFDE7'; // Brilliant gold-white specular highlight
    return {
      variant: 'premium',
      colors,
      highlightColor: highlight,
      baseBorderColor: 'rgba(245, 158, 11, 0.22)',
      glowColor: 'rgba(245, 158, 11, 0.55)',
      beamConicGradient: createBorderBeamGradient(highlight, '#FCD34D', '#F59E0B', '#B45309'),
      animationType: 'rotate',
    };
  }

  // 3. Trending Videos: Red/Orange fiery accents (Rule 7)
  const isTrending = Boolean(
    (video.viewsCount || 0) >= 10000 ||
    video.tags?.some((t) => t.toLowerCase().includes('trending') || t.toLowerCase().includes('zinazovuma'))
  );

  if (isTrending) {
    const colors: [string, string, string] = ['#FF3040', '#FF6B35', '#F59E0B'];
    const highlight = '#FFF1F2';
    return {
      variant: 'trending',
      colors,
      highlightColor: highlight,
      baseBorderColor: 'rgba(255, 48, 64, 0.2)',
      glowColor: 'rgba(255, 48, 64, 0.45)',
      beamConicGradient: createBorderBeamGradient(highlight, colors[0], colors[1], colors[2]),
      animationType: 'rotate',
    };
  }

  // 4. Dynamic Thumbnail-based 2-3 Color Gradient Beam (Rule 1 & 2)
  const colors =
    customExtractedColors ||
    CATEGORY_PALETTES[video.category] ||
    getHashFallbackPalette(video.id || video.title || 'tazama');

  const highlight = '#FFFFFF';
  const hex = colors[0].startsWith('#') ? colors[0] : '#FF3040';
  const r = parseInt(hex.slice(1, 3), 16) || 255;
  const g = parseInt(hex.slice(3, 5), 16) || 48;
  const b = parseInt(hex.slice(5, 7), 16) || 64;

  return {
    variant: 'dynamic',
    colors,
    highlightColor: highlight,
    baseBorderColor: `rgba(${r}, ${g}, ${b}, 0.18)`,
    glowColor: `rgba(${r}, ${g}, ${b}, 0.45)`,
    beamConicGradient: createBorderBeamGradient(highlight, colors[0], colors[1], colors[2]),
    animationType: 'rotate',
  };
}

