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

export function createThumbnailSvgDataUri(title: string, category: string = 'Tazama'): string {
  const theme = getChannelTheme(title + category);
  const safeTitle = title.length > 55 ? title.substring(0, 52) + '...' : title;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141824"/>
        <stop offset="50%" stop-color="#0E1119"/>
        <stop offset="100%" stop-color="#080A0F"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${theme.from}"/>
        <stop offset="100%" stop-color="${theme.accent}"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect width="1280" height="720" fill="url(#grid)"/>
    
    <!-- Decorative Glow Circles -->
    <circle cx="1100" cy="180" r="280" fill="${theme.from}" opacity="0.15" filter="blur(60px)"/>
    <circle cx="180" cy="540" r="240" fill="${theme.to}" opacity="0.2" filter="blur(50px)"/>
    
    <!-- Top Category Ribbon -->
    <rect x="60" y="55" width="220" height="46" rx="23" fill="url(#accent)"/>
    <text x="170" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">${category.toUpperCase()}</text>

    <!-- Tanzanian Flag Accent Dots -->
    <circle cx="1200" cy="75" r="8" fill="#1EB53A"/>
    <circle cx="1180" cy="75" r="8" fill="#FCD116"/>
    <circle cx="1160" cy="75" r="8" fill="#00A3DD"/>

    <!-- Central Play Glass Artwork -->
    <circle cx="640" cy="340" r="80" fill="rgba(255, 48, 64, 0.9)" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <polygon points="630,310 670,340 630,370" fill="#ffffff"/>

    <!-- Bottom Dark Gradient for Title Legibility -->
    <rect x="0" y="460" width="1280" height="260" fill="rgba(8, 10, 15, 0.85)"/>
    
    <!-- Video Title -->
    <text x="60" y="560" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#ffffff">${safeTitle}</text>
    
    <!-- Tazama Branding -->
    <text x="60" y="640" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#FF3040">TAZAMA • HD 1080p</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
