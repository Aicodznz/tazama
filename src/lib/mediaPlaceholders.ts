/**
 * Resilient SVG & media fallback generators for Tazama
 * Guarantees zero broken images when external CDNs (like Unsplash) are offline or restricted.
 */

export function getInitials(name: string): string {
  if (!name) return 'TZ';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getChannelTheme(name: string): { from: string; to: string; accent: string } {
  const lower = (name || '').toLowerCase();
  if (lower.includes('wasafi') || lower.includes('diamond')) {
    return { from: '#FF1A2B', to: '#7A0009', accent: '#FF4D5E' };
  }
  if (lower.includes('millard') || lower.includes('ayo')) {
    return { from: '#0284C7', to: '#0C4A6E', accent: '#38BDF8' };
  }
  if (lower.includes('azam') || lower.includes('sports')) {
    return { from: '#0EA5E9', to: '#1E3A8A', accent: '#60A5FA' };
  }
  if (lower.includes('joti') || lower.includes('vichekesho')) {
    return { from: '#F97316', to: '#7C2D12', accent: '#FB923C' };
  }
  if (lower.includes('tech') || lower.includes('swahili')) {
    return { from: '#10B981', to: '#064E3B', accent: '#34D399' };
  }
  if (lower.includes('serengeti') || lower.includes('wild')) {
    return { from: '#EAB308', to: '#713F12', accent: '#FDE047' };
  }
  return { from: '#8B5CF6', to: '#4C1D95', accent: '#A78BFA' };
}

export function createAvatarSvgDataUri(name: string): string {
  const initials = getInitials(name);
  const theme = getChannelTheme(name);
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.from}"/>
        <stop offset="100%" stop-color="${theme.to}"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#grad)" stroke="${theme.accent}" stroke-width="2"/>
    <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Creates a clean, cinematic video thumbnail poster background.
 * DOES NOT include pseudo UI badges, ribbons, or duplicate play buttons,
 * ensuring the React DOM badges (Live, Category, Duration, Play) sit cleanly without duplicate tails.
 */
export function createThumbnailSvgDataUri(title: string, category: string = 'Tazama'): string {
  const theme = getChannelTheme(title + ' ' + category);
  const lowerCat = category.toLowerCase();

  // Category-specific ambient graphics
  let categoryArt = '';

  if (lowerCat.includes('muzik') || lowerCat.includes('music')) {
    // Music: Stage spotlights, soundwave curves, equalizer aura
    categoryArt = `
      <ellipse cx="640" cy="720" rx="550" ry="220" fill="${theme.from}" opacity="0.25" filter="blur(60px)"/>
      <path d="M 100 480 Q 300 320 640 460 T 1180 400" fill="none" stroke="${theme.accent}" stroke-width="4" opacity="0.4"/>
      <path d="M 80 520 Q 380 380 640 500 T 1200 440" fill="none" stroke="${theme.from}" stroke-width="3" opacity="0.3"/>
      <!-- Equalizer ambient pulses -->
      <line x1="440" y1="440" x2="440" y2="280" stroke="${theme.accent}" stroke-width="6" stroke-linecap="round" opacity="0.35"/>
      <line x1="500" y1="460" x2="500" y2="220" stroke="${theme.accent}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
      <line x1="560" y1="480" x2="560" y2="180" stroke="${theme.from}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
      <line x1="620" y1="490" x2="620" y2="150" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
      <line x1="680" y1="490" x2="680" y2="200" stroke="${theme.from}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
      <line x1="740" y1="480" x2="740" y2="250" stroke="${theme.accent}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
      <line x1="800" y1="450" x2="800" y2="300" stroke="${theme.accent}" stroke-width="6" stroke-linecap="round" opacity="0.35"/>
    `;
  } else if (lowerCat.includes('habari') || lowerCat.includes('news')) {
    // News: High-tech studio globe arc & newsroom light bands
    categoryArt = `
      <ellipse cx="640" cy="360" rx="420" ry="420" fill="none" stroke="${theme.accent}" stroke-width="2" opacity="0.18"/>
      <ellipse cx="640" cy="360" rx="320" ry="180" fill="none" stroke="${theme.from}" stroke-width="2.5" opacity="0.25"/>
      <ellipse cx="640" cy="360" rx="520" ry="240" fill="none" stroke="${theme.accent}" stroke-width="1.5" opacity="0.15"/>
      <line x1="120" y1="360" x2="1160" y2="360" stroke="${theme.accent}" stroke-width="1.5" opacity="0.2"/>
    `;
  } else if (lowerCat.includes('michezo') || lowerCat.includes('sports')) {
    // Sports: Stadium floodlight beams, pitch arcs
    categoryArt = `
      <polygon points="100,0 260,720 0,720" fill="${theme.accent}" opacity="0.08"/>
      <polygon points="1180,0 1280,720 1020,720" fill="${theme.from}" opacity="0.08"/>
      <path d="M 200 650 Q 640 400 1080 650" fill="none" stroke="${theme.accent}" stroke-width="3" opacity="0.3"/>
      <circle cx="640" cy="360" r="140" fill="none" stroke="${theme.accent}" stroke-width="2" opacity="0.2"/>
    `;
  } else if (lowerCat.includes('tech') || lowerCat.includes('teknolojia')) {
    // Tech: Cyber grid and glowing circuit nodes
    categoryArt = `
      <path d="M 200 200 L 400 200 L 500 300 L 800 300 L 900 400 L 1100 400" fill="none" stroke="${theme.accent}" stroke-width="2" opacity="0.3"/>
      <circle cx="500" cy="300" r="6" fill="${theme.accent}" opacity="0.6"/>
      <circle cx="900" cy="400" r="6" fill="${theme.from}" opacity="0.6"/>
      <path d="M 150 500 L 350 500 L 450 420 L 750 420" fill="none" stroke="${theme.from}" stroke-width="2" opacity="0.25"/>
    `;
  } else {
    // Entertainment / Comedy / Default: Cinematic spotlight & bokeh glow
    categoryArt = `
      <circle cx="640" cy="320" r="260" fill="${theme.from}" opacity="0.18" filter="blur(70px)"/>
      <circle cx="820" cy="240" r="140" fill="${theme.accent}" opacity="0.2" filter="blur(50px)"/>
      <circle cx="460" cy="400" r="120" fill="${theme.from}" opacity="0.15" filter="blur(40px)"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141824"/>
        <stop offset="50%" stop-color="#0E121A"/>
        <stop offset="100%" stop-color="#07090E"/>
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="${theme.from}" stop-opacity="0.32"/>
        <stop offset="50%" stop-color="${theme.accent}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <pattern id="fineGrid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
      </pattern>
    </defs>
    
    <!-- Base Canvas -->
    <rect width="1280" height="720" fill="url(#bgGrad)"/>
    <rect width="1280" height="720" fill="url(#fineGrid)"/>
    
    <!-- Ambient Category Atmospheric Glow -->
    <rect width="1280" height="720" fill="url(#centerGlow)"/>
    
    <!-- Category Specific Artwork -->
    ${categoryArt}
    
    <!-- Subtle Edge Vignette to keep corners deep and badges high-contrast -->
    <rect width="1280" height="720" fill="none" stroke="rgba(0,0,0,0.6)" stroke-width="40"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
