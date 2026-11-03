import { VideoItem, VideoScene } from '../types';

/**
 * Pre-computes or retrieves AI Scene Discovery metadata for a video.
 * Stored as pre-computed metadata rather than analyzing repeatedly on mouse hover.
 */
export function getVideoScenes(video: VideoItem): VideoScene[] {
  if (video.scenes && video.scenes.length > 0) {
    return video.scenes;
  }

  const duration = video.durationSeconds || 180;
  const title = video.title || 'Video';
  const category = video.category || 'Burudani';

  // Category & Title-specific chapter labels for Tanzania / East African context
  const chapterPresets: Record<string, string[]> = {
    Muziki: ['Utangulizi wa Wimbo', 'Mbeti ya Kwanza', 'Kiitikio (Chorus)', 'Mbeti ya Pili', 'Solo / Hitimisho'],
    Vichekesho: ['Mwanzo wa Kichekesho', 'Kisa Kinaanza', 'Tukio la Kuchekesha', 'Kipande Kikuu', 'Majanga & Mwisho'],
    Habari: ['Habari Kuu', 'Uchambuzi wa Kina', 'Maoni ya Wananchi', 'Muhtasari', 'Hitimisho'],
    Michezo: ['Kabla ya Mechi', 'Dakika za Mwanzo', 'Goli / Hatua Kali', 'Ushindani Mkubwa', 'Matokeo & Maoni'],
    Elimu: ['Utangulizi wa Somo', 'Dhana Kuu', 'Mifano Halisi', 'Maswali & Majibu', 'Muhtasari wa Somo'],
    Filamu: ['Mwanzo wa Hadithi', 'Mgogoro Unaanza', 'Kipande cha Mvutano', 'Kilele cha Filamu', 'Mwisho wa Hadithi'],
    Default: ['Mwanzo', 'Utangulizi', 'Tukio Kuu', 'Kipande cha Kati', 'Hitimisho']
  };

  const labels = chapterPresets[category] || chapterPresets.Default;
  const count = Math.min(labels.length, Math.max(3, Math.floor(duration / 30)));
  const step = duration / count;

  return Array.from({ length: count }, (_, i) => {
    const time = Math.floor(i * step);
    return {
      timeSeconds: time,
      title: `${labels[i % labels.length]} (${title.slice(0, 20)}...)`,
      description: `Kipande cha ${i + 1}: ${labels[i % labels.length]}`
    };
  });
}

/**
 * Find the active scene for a given playback or hover timestamp.
 */
export function getActiveSceneForTime(scenes: VideoScene[], timeSeconds: number): VideoScene | null {
  if (!scenes || scenes.length === 0) return null;
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (timeSeconds >= scenes[i].timeSeconds) {
      return scenes[i];
    }
  }
  return scenes[0];
}
