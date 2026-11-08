/**
 * Video URL Parsing and Detection Utilities for Tazama
 * Supports Direct MP4/WebM/HLS streams, YouTube, Vimeo, and Cloudinary links.
 */

export interface ParsedVideoSource {
  originalUrl: string;
  sourceType: 'direct' | 'youtube' | 'vimeo' | 'embed' | 'unknown';
  providerName?: string;
  videoId?: string;
  embedUrl?: string;
  streamUrl: string;
  suggestedThumbnail?: string;
  isEmbeddable: boolean;
}

/**
 * Extracts a URL from an iframe embed snippet if the user pasted <iframe src="...">
 */
export function extractIframeSrc(input: string): string | null {
  if (!input) return null;
  const match = input.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:vimeo\.com\/)(\d+)/i);
  return match ? match[1] : null;
}

export function parseVideoSource(rawUrl: string): ParsedVideoSource {
  let url = (rawUrl || '').trim();
  if (!url) {
    return {
      originalUrl: '',
      sourceType: 'unknown',
      streamUrl: '',
      isEmbeddable: false
    };
  }

  // Auto-extract src from pasted raw iframe HTML
  if (url.includes('<iframe') && url.includes('src=')) {
    const extracted = extractIframeSrc(url);
    if (extracted) {
      url = extracted.trim();
    }
  }

  // 1. YouTube Detection
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      originalUrl: rawUrl,
      sourceType: 'youtube',
      providerName: 'YouTube',
      videoId: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      streamUrl: `https://www.youtube.com/embed/${ytId}`,
      suggestedThumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      isEmbeddable: true
    };
  }

  // 2. Vimeo Detection
  const vmId = extractVimeoId(url);
  if (vmId) {
    return {
      originalUrl: rawUrl,
      sourceType: 'vimeo',
      providerName: 'Vimeo',
      videoId: vmId,
      embedUrl: `https://player.vimeo.com/video/${vmId}`,
      streamUrl: `https://player.vimeo.com/video/${vmId}`,
      isEmbeddable: true
    };
  }

  // 3. Streamtape Detection (e.g. streamtape.com/v/XYZ/ or /e/XYZ/)
  const streamtapeMatch = url.match(/(?:streamtape\.com|streamta\.pe)\/(?:v|e)\/([a-zA-Z0-9_-]+)/i);
  if (streamtapeMatch && streamtapeMatch[1]) {
    const tapeId = streamtapeMatch[1];
    const embed = `https://streamtape.com/e/${tapeId}`;
    return {
      originalUrl: rawUrl,
      sourceType: 'embed',
      providerName: 'Streamtape',
      videoId: tapeId,
      embedUrl: embed,
      streamUrl: embed,
      isEmbeddable: true
    };
  }

  // 4. DoodStream Detection (dood.to, doodstream.com, dood.so, dood.ws, ds2play.com, etc.)
  const doodMatch = url.match(/(?:doodstream\.com|dood\.(?:to|so|ws|pm|cx|la|watch|sh)|ds2play\.com)\/(?:e|d)\/([a-zA-Z0-9]+)/i);
  if (doodMatch && doodMatch[1]) {
    const doodId = doodMatch[1];
    const embed = `https://dood.to/e/${doodId}`;
    return {
      originalUrl: rawUrl,
      sourceType: 'embed',
      providerName: 'DoodStream',
      videoId: doodId,
      embedUrl: embed,
      streamUrl: embed,
      isEmbeddable: true
    };
  }

  // 5. Filemoon Detection (filemoon.sx, filemoon.to, filemoon.wf)
  const filemoonMatch = url.match(/(?:filemoon\.(?:sx|to|wf|nl|in))\/(?:e|d)\/([a-zA-Z0-9_-]+)/i);
  if (filemoonMatch && filemoonMatch[1]) {
    const moonId = filemoonMatch[1];
    const embed = `https://filemoon.sx/e/${moonId}`;
    return {
      originalUrl: rawUrl,
      sourceType: 'embed',
      providerName: 'Filemoon',
      videoId: moonId,
      embedUrl: embed,
      streamUrl: embed,
      isEmbeddable: true
    };
  }

  // 6. Mp4Upload Detection (mp4upload.com/embed-XYZ.html or mp4upload.com/XYZ)
  const mp4UploadMatch = url.match(/(?:mp4upload\.com)\/(?:embed-)?([a-zA-Z0-9]+)(?:\.html)?/i);
  if (mp4UploadMatch && mp4UploadMatch[1]) {
    const mpId = mp4UploadMatch[1];
    const embed = `https://www.mp4upload.com/embed-${mpId}.html`;
    return {
      originalUrl: rawUrl,
      sourceType: 'embed',
      providerName: 'Mp4Upload',
      videoId: mpId,
      embedUrl: embed,
      streamUrl: embed,
      isEmbeddable: true
    };
  }

  // 7. LuciferDonghua direct page or embed detection
  if (url.includes('luciferdonghua.in')) {
    return {
      originalUrl: rawUrl,
      sourceType: 'embed',
      providerName: 'LuciferDonghua',
      embedUrl: url,
      streamUrl: url,
      isEmbeddable: true
    };
  }

  // 8. General Third-Party Embeds (Megacloud, Rapidcloud, Vidcloud, etc.)
  if (url.includes('/embed') || url.includes('/e/') || url.includes('player') || url.includes('megacloud.tv') || url.includes('rapid-cloud.co')) {
    return {
      originalUrl: rawUrl,
      sourceType: 'embed',
      providerName: 'Video Streaming Embed',
      embedUrl: url,
      streamUrl: url,
      isEmbeddable: true
    };
  }

  // 9. Google Drive View link conversion to stream/download
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return {
        originalUrl: rawUrl,
        sourceType: 'direct',
        streamUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        isEmbeddable: false
      };
    }
  }

  // 10. Direct video URL (MP4, WebM, HLS m3u8, Cloudinary, AWS S3, etc.)
  const isDirectFile = /\.(mp4|webm|m3u8|mov|ogg)($|\?)/i.test(url) || url.includes('cloudinary.com') || url.includes('r2.cloudflarestorage.com');
  if (isDirectFile) {
    return {
      originalUrl: rawUrl,
      sourceType: 'direct',
      streamUrl: url,
      isEmbeddable: false
    };
  }

  // Default fallback: If it's a web link without a clear extension, treat as universal streaming embed so it renders cleanly in iframe
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return {
      originalUrl: rawUrl,
      sourceType: 'embed',
      providerName: 'Web Stream / Embed',
      embedUrl: url,
      streamUrl: url,
      isEmbeddable: true
    };
  }

  return {
    originalUrl: rawUrl,
    sourceType: 'direct',
    streamUrl: url,
    isEmbeddable: false
  };
}
