/**
 * Video URL Parsing and Detection Utilities for Tazama
 * Supports Direct MP4/WebM/HLS streams, YouTube, Vimeo, and Cloudinary links.
 */

export interface ParsedVideoSource {
  originalUrl: string;
  sourceType: 'direct' | 'youtube' | 'vimeo' | 'unknown';
  videoId?: string;
  embedUrl?: string;
  streamUrl: string;
  suggestedThumbnail?: string;
  isEmbeddable: boolean;
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
  const url = (rawUrl || '').trim();
  if (!url) {
    return {
      originalUrl: '',
      sourceType: 'unknown',
      streamUrl: '',
      isEmbeddable: false
    };
  }

  // 1. YouTube Detection
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      originalUrl: url,
      sourceType: 'youtube',
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
      originalUrl: url,
      sourceType: 'vimeo',
      videoId: vmId,
      embedUrl: `https://player.vimeo.com/video/${vmId}`,
      streamUrl: `https://player.vimeo.com/video/${vmId}`,
      isEmbeddable: true
    };
  }

  // 3. Google Drive View link conversion to stream/download
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return {
        originalUrl: url,
        sourceType: 'direct',
        streamUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        isEmbeddable: false
      };
    }
  }

  // 4. Direct video URL (MP4, WebM, HLS m3u8, Cloudinary, AWS S3, etc.)
  return {
    originalUrl: url,
    sourceType: 'direct',
    streamUrl: url,
    isEmbeddable: false
  };
}
