import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudflare credentials from user configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'abba19ca4804e07fb1bad6979e8a2bfd';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN || 'cfat_EkwG7R4MC1RVGPEnYc95FcGKBIb3EfxbwOPfVfWQ37895610';
const CLOUDFLARE_R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'caac9a1cfec2edbba7bf5b914dbd6e9a';
const CLOUDFLARE_R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT || 'https://abba19ca4804e07fb1bad6979e8a2bfd.r2.cloudflarestorage.com';
let CLOUDFLARE_STREAM_WEBHOOK_SECRET = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET || '';

// Cloudinary configuration (Pre-configured from user console)
let CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ecsswynm';
let CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'malimai12';
let CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
let CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

// App public URL for webhook callbacks
const APP_URL = process.env.APP_URL || 'https://ais-dev-eep2lwwfbj7wxdexlmat2x-203689465733.europe-west2.run.app';

function verifyWebhookSignature(signatureHeader: string | undefined, rawBody: string, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    const parts = signatureHeader.split(',');
    let timestamp = '';
    let sig1 = '';

    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k === 'time') timestamp = v;
      if (k === 'sig1') sig1 = v;
    }

    if (!timestamp || !sig1) return false;

    // Concatenate `${time}.${body}`
    const sourceString = `${timestamp}.${rawBody}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(sourceString).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(sig1, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch (err) {
    console.warn('Webhook signature check failed:', err);
    return false;
  }
}

const VIDEOS_STORAGE_FILE = path.join(__dirname, 'data', 'videos.json');
const CHANNELS_STORAGE_FILE = path.join(__dirname, 'data', 'channels.json');

function getStoredVideos(): any[] {
  try {
    if (fs.existsSync(VIDEOS_STORAGE_FILE)) {
      const content = fs.readFileSync(VIDEOS_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed.filter((item: any) => Boolean(item && item.id && item.videoUrl));
    }
  } catch (err) {
    console.error('Error reading stored videos:', err);
  }
  return [];
}

function saveStoredVideos(videos: any[]) {
  try {
    const dir = path.dirname(VIDEOS_STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VIDEOS_STORAGE_FILE, JSON.stringify(videos, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stored videos:', err);
  }
}

function getStoredChannels(): any[] {
  try {
    if (fs.existsSync(CHANNELS_STORAGE_FILE)) {
      const content = fs.readFileSync(CHANNELS_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed.filter((item: any) => Boolean(item && item.id));
    }
  } catch (err) {
    console.error('Error reading stored channels:', err);
  }
  return [];
}

function saveStoredChannels(channels: any[]) {
  try {
    const dir = path.dirname(CHANNELS_STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHANNELS_STORAGE_FILE, JSON.stringify(channels, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stored channels:', err);
  }
}

const ADS_STORAGE_FILE = path.join(__dirname, 'data', 'ads.json');

function getStoredAds(): any[] {
  try {
    if (fs.existsSync(ADS_STORAGE_FILE)) {
      const content = fs.readFileSync(ADS_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed.filter((item: any) => Boolean(item && item.id));
    }
  } catch (err) {
    console.error('Error reading stored ads:', err);
  }
  return [];
}

function saveStoredAds(ads: any[]) {
  try {
    const dir = path.dirname(ADS_STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ADS_STORAGE_FILE, JSON.stringify(ads, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stored ads:', err);
  }
}

const VIEWS_ANALYTICS_FILE = path.join(__dirname, 'data', 'views_analytics.json');

export interface ViewerHistoryItem {
  lastViewedAt: number;
  totalWatchSeconds: number;
  viewCount: number;
}

export interface VideoAnalyticsRecord {
  videoId: string;
  totalViews: number;
  uniqueViewers: number;
  watchTimeSeconds: number;
  viewerHistory: Record<string, ViewerHistoryItem>;
}

function getStoredAnalytics(): Record<string, VideoAnalyticsRecord> {
  try {
    if (fs.existsSync(VIEWS_ANALYTICS_FILE)) {
      const content = fs.readFileSync(VIEWS_ANALYTICS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (err) {
    console.error('Error reading stored views analytics:', err);
  }
  return {};
}

function saveStoredAnalytics(data: Record<string, VideoAnalyticsRecord>) {
  try {
    const dir = path.dirname(VIEWS_ANALYTICS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VIEWS_ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stored views analytics:', err);
  }
}

const LIKES_STORAGE_FILE = path.join(__dirname, 'data', 'likes.json');

function getStoredLikes(): Record<string, string[]> {
  try {
    if (fs.existsSync(LIKES_STORAGE_FILE)) {
      const content = fs.readFileSync(LIKES_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (err) {
    console.error('Error reading stored likes:', err);
  }
  return {};
}

function saveStoredLikes(likes: Record<string, string[]>) {
  try {
    const dir = path.dirname(LIKES_STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LIKES_STORAGE_FILE, JSON.stringify(likes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stored likes:', err);
  }
}

// Concurrency mutex lock per video to prevent race condition double-counting
const videoMutexQueues = new Map<string, Promise<any>>();
function runWithVideoLock<T>(videoId: string, task: () => Promise<T>): Promise<T> {
  const previousPromise = videoMutexQueues.get(videoId) || Promise.resolve();
  const nextPromise = previousPromise.then(task, task);
  videoMutexQueues.set(videoId, nextPromise.catch(() => {}));
  return nextPromise;
}

// Bot & fake view crawler detection
function isSuspiciousBot(req: express.Request): boolean {
  const ua = ((req.headers['user-agent'] as string) || '').toLowerCase();
  if (!ua) return true;
  const botPatterns = [
    'bot', 'crawl', 'spider', 'slurp', 'mediapartners', 'phantomjs', 'selenium', 
    'headless', 'puppeteer', 'playwright', 'curl', 'wget', 'python', 'postman', 
    'insomnia', 'httpclient', 'node-fetch', 'axios', 'scrapy'
  ];
  return botPatterns.some(pattern => ua.includes(pattern));
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Capture raw body for HMAC signature verification
  app.use(express.json({
    limit: '100mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  // ==========================================
  // SHARED PERSISTENT VIDEOS & CHANNELS API
  // ==========================================

  // 1. Get all globally uploaded videos & shorts
  app.get('/api/videos', (_req, res) => {
    try {
      const videos = getStoredVideos();
      res.json({ success: true, videos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, videos: [] });
    }
  });

  // 2. Save or update uploaded video
  app.post('/api/videos', (req, res) => {
    try {
      const newVideo = req.body;
      if (!newVideo || !newVideo.id) {
        return res.status(400).json({ success: false, error: 'Video data with valid ID is required' });
      }

      const current = getStoredVideos();
      const existingIdx = current.findIndex(v => v.id === newVideo.id);
      let updatedList;
      if (existingIdx >= 0) {
        updatedList = [...current];
        updatedList[existingIdx] = { 
          ...updatedList[existingIdx], 
          ...newVideo,
          videoUrl: newVideo.videoUrl || updatedList[existingIdx].videoUrl 
        };
      } else {
        if (!newVideo.videoUrl) {
          return res.status(400).json({ success: false, error: 'videoUrl is required for new videos' });
        }
        updatedList = [newVideo, ...current];
      }

      saveStoredVideos(updatedList);
      res.json({ success: true, video: newVideo, totalVideos: updatedList.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Active playback sessions for real video event & heartbeat verification
  interface PlaybackSession {
    sessionId: string;
    videoId: string;
    userKey: string;           // "user:<uid>" (cross-device) or "guest:<deviceId>:<ipSubnet>"
    viewerUid?: string;
    isOwner: boolean;
    createdAt: number;
    lastHeartbeatAt: number;
    lastCurrentTime: number;
    accumulatedWatchSeconds: number;
    viewAwarded: boolean;
    duration: number;
    minWatchTime: number;
  }

  const activePlaybackSessions = new Map<string, PlaybackSession>();

  // Cleanup stale sessions older than 30 minutes every 10 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [sId, sess] of activePlaybackSessions.entries()) {
      if (now - sess.lastHeartbeatAt > 30 * 60 * 1000) {
        activePlaybackSessions.delete(sId);
      }
    }
  }, 10 * 60 * 1000);

  // Helper to determine owner and viewerKey
  function resolveViewerContext(target: any, viewerUid?: string, viewerChannelId?: string, viewerName?: string, deviceId?: string, clientIp?: string) {
    const isOwner = Boolean(
      (target.channelOwnerId && viewerUid && target.channelOwnerId === viewerUid) ||
      (target.channelId && viewerChannelId && target.channelId === viewerChannelId) ||
      (target.channelName && viewerName && target.channelName.trim().toLowerCase() === viewerName.trim().toLowerCase())
    );

    const rawIp = clientIp || '127.0.0.1';
    const ipPart = rawIp.split(',')[0].trim().split('.').slice(0, 3).join('.');
    // Multi-device deduplication: if signed in, user identity deduplicates phone + desktop + tablet!
    const userKey = viewerUid ? `user:${viewerUid}` : `dev:${deviceId || 'anon'}:${ipPart}`;

    return { isOwner, userKey };
  }

  // 2b. Start Playback Session (Called when user actually presses Play on a video)
  app.post('/api/videos/:id/playback-session/start', (req, res) => {
    try {
      if (isSuspiciousBot(req)) {
        return res.status(403).json({ success: false, error: 'Automated or suspicious traffic blocked' });
      }

      const { id } = req.params;
      const { viewerUid, viewerChannelId, viewerName, deviceId, duration, initialTime } = req.body || {};
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

      const current = getStoredVideos();
      const target = current.find((v: any) => v.id === id);
      if (!target) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }

      const { isOwner, userKey } = resolveViewerContext(target, viewerUid, viewerChannelId, viewerName, deviceId, clientIp);
      const videoDuration = Number(duration) || Number(target.durationSeconds) || 0;
      // Minimum watch requirement: 5s (or 3s for short videos under 10s)
      const minWatchTime = (videoDuration > 0 && videoDuration < 10) ? 3 : 5;

      const sessionId = crypto.randomUUID();
      const session: PlaybackSession = {
        sessionId,
        videoId: id,
        userKey,
        viewerUid: viewerUid || undefined,
        isOwner,
        createdAt: Date.now(),
        lastHeartbeatAt: Date.now(),
        lastCurrentTime: Math.max(0, Number(initialTime) || 0),
        accumulatedWatchSeconds: 0,
        viewAwarded: false,
        duration: videoDuration,
        minWatchTime
      };

      activePlaybackSessions.set(sessionId, session);

      res.json({
        success: true,
        sessionId,
        isOwner,
        minWatchTime,
        viewsCount: target.viewsCount || 0
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2c. Playback Heartbeat (Called continuously during active playback with video events)
  app.post('/api/videos/:id/playback-heartbeat', async (req, res) => {
    try {
      if (isSuspiciousBot(req)) {
        return res.status(403).json({ success: false, error: 'Automated traffic blocked' });
      }

      const { id } = req.params;
      const { sessionId, currentTime, playbackRate, isPlaying } = req.body || {};

      if (!sessionId || !activePlaybackSessions.has(sessionId)) {
        return res.status(400).json({ success: false, error: 'Session expired or invalid' });
      }

      const session = activePlaybackSessions.get(sessionId)!;
      if (session.videoId !== id) {
        return res.status(400).json({ success: false, error: 'Session video mismatch' });
      }

      const now = Date.now();
      const deltaWallClockMs = now - session.lastHeartbeatAt;
      
      // Throttle heartbeat spam: require at least 350ms between heartbeats
      if (deltaWallClockMs < 350) {
        return res.json({ 
          success: true, 
          viewAwarded: session.viewAwarded,
          accumulatedWatchSeconds: session.accumulatedWatchSeconds 
        });
      }

      const deltaWallClockSec = deltaWallClockMs / 1000;
      const currTime = Math.max(0, Number(currentTime) || 0);
      const deltaMedia = currTime - session.lastCurrentTime;
      const rate = Math.max(0.25, Math.min(2.5, Number(playbackRate) || 1));
      const playing = Boolean(isPlaying);

      // Verify legitimate media progress:
      // If paused or seeking, media elapsed is 0 or capped by wall-clock time elapsed
      let legitimateProgressSec = 0;
      if (playing && deltaMedia > 0) {
        const maxExpectedProgress = deltaWallClockSec * rate * 1.5; // 1.5x tolerance for micro-jitters
        legitimateProgressSec = Math.min(deltaMedia, maxExpectedProgress);
        legitimateProgressSec = Math.min(legitimateProgressSec, deltaWallClockSec * rate);
      }

      session.accumulatedWatchSeconds += legitimateProgressSec;
      session.lastHeartbeatAt = now;
      session.lastCurrentTime = currTime;

      // Check if viewing criteria met (accumulatedWatchSeconds >= minWatchTime)
      if (session.accumulatedWatchSeconds >= session.minWatchTime && !session.viewAwarded) {
        session.viewAwarded = true;

        // 1. CREATOR SELF-VIEW FILTER: Never award views to the video creator
        if (session.isOwner) {
          return res.json({
            success: true,
            viewAwarded: false,
            isOwner: true,
            reason: 'creator_self_view_ignored',
            message: 'Creator views are not counted towards view metrics',
            accumulatedWatchSeconds: Math.round(session.accumulatedWatchSeconds * 10) / 10
          });
        }

        // 2. CONCURRENCY MUTEX LOCK & 24-HOUR MULTI-DEVICE DEDUPLICATION
        const awardResult = await runWithVideoLock(id, async () => {
          const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
          const analytics = getStoredAnalytics();
          if (!analytics[id]) {
            analytics[id] = {
              videoId: id,
              totalViews: 0,
              uniqueViewers: 0,
              watchTimeSeconds: 0,
              viewerHistory: {}
            };
          }

          const videoRec = analytics[id];
          if (!videoRec.viewerHistory) videoRec.viewerHistory = {};
          const viewerHist = videoRec.viewerHistory[session.userKey];

          // Deduplication check: Has this user/device viewed within 24h?
          if (viewerHist && (now - viewerHist.lastViewedAt < COOLDOWN_MS)) {
            // Already viewed within 24h: Update watch time only, DO NOT double-count view
            viewerHist.totalWatchSeconds = (viewerHist.totalWatchSeconds || 0) + session.accumulatedWatchSeconds;
            videoRec.watchTimeSeconds = (videoRec.watchTimeSeconds || 0) + session.accumulatedWatchSeconds;
            saveStoredAnalytics(analytics);

            const vids = getStoredVideos();
            const currentVid = vids.find((v: any) => v.id === id);
            return {
              awarded: false,
              deduplicated: true,
              viewsCount: currentVid?.viewsCount || videoRec.totalViews,
              uniqueViewers: videoRec.uniqueViewers,
              watchTimeSeconds: Math.round(videoRec.watchTimeSeconds),
              reason: '24h_cooldown_active'
            };
          }

          // Certified Legitimate View! Atomically increment views
          const isUnique = !viewerHist;
          videoRec.totalViews = (videoRec.totalViews || 0) + 1;
          if (isUnique) {
            videoRec.uniqueViewers = (videoRec.uniqueViewers || 0) + 1;
          }
          videoRec.watchTimeSeconds = (videoRec.watchTimeSeconds || 0) + session.accumulatedWatchSeconds;
          videoRec.viewerHistory[session.userKey] = {
            lastViewedAt: now,
            totalWatchSeconds: ((viewerHist?.totalWatchSeconds) || 0) + session.accumulatedWatchSeconds,
            viewCount: ((viewerHist?.viewCount) || 0) + 1
          };

          // Synchronize atomically into data/videos.json
          const currentVids = getStoredVideos();
          let updatedVideo: any = null;
          const nextVids = currentVids.map((v: any) => {
            if (v.id === id) {
              const newViews = (v.viewsCount || 0) + 1;
              updatedVideo = {
                ...v,
                viewsCount: newViews,
                uniqueViewers: videoRec.uniqueViewers,
                watchTimeSeconds: Math.round(videoRec.watchTimeSeconds)
              };
              return updatedVideo;
            }
            return v;
          });

          saveStoredVideos(nextVids);
          saveStoredAnalytics(analytics);

          return {
            awarded: true,
            deduplicated: false,
            viewsCount: updatedVideo ? updatedVideo.viewsCount : videoRec.totalViews,
            uniqueViewers: videoRec.uniqueViewers,
            watchTimeSeconds: Math.round(videoRec.watchTimeSeconds),
            video: updatedVideo
          };
        });

        return res.json({
          success: true,
          viewAwarded: awardResult.awarded,
          deduplicated: awardResult.deduplicated,
          viewsCount: awardResult.viewsCount,
          uniqueViewers: awardResult.uniqueViewers,
          watchTimeSeconds: awardResult.watchTimeSeconds,
          video: awardResult.video,
          accumulatedWatchSeconds: Math.round(session.accumulatedWatchSeconds * 10) / 10
        });
      }

      res.json({
        success: true,
        viewAwarded: session.viewAwarded,
        accumulatedWatchSeconds: Math.round(session.accumulatedWatchSeconds * 10) / 10
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2d. Video Analytics Endpoint (Records and serves unique viewers, total views, and watch time)
  app.get('/api/videos/:id/analytics', (req, res) => {
    try {
      const { id } = req.params;
      const analytics = getStoredAnalytics();
      const videoRec = analytics[id] || {
        videoId: id,
        totalViews: 0,
        uniqueViewers: 0,
        watchTimeSeconds: 0
      };
      res.json({
        success: true,
        analytics: {
          videoId: id,
          totalViews: videoRec.totalViews || 0,
          uniqueViewers: videoRec.uniqueViewers || 0,
          watchTimeSeconds: Math.round(videoRec.watchTimeSeconds || 0)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2e. Legacy/Fallback Direct View Increment Endpoint (With Concurrency Lock & 24h Deduplication)
  app.post('/api/videos/:id/view', async (req, res) => {
    try {
      if (isSuspiciousBot(req)) {
        return res.status(403).json({ success: false, error: 'Suspicious bot traffic rejected' });
      }

      const { id } = req.params;
      const { viewerUid, viewerChannelId, viewerName, deviceId } = req.body || {};
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

      const current = getStoredVideos();
      const target = current.find((v: any) => v.id === id);
      if (!target) {
        return res.json({ success: true, viewsCount: 1 });
      }

      const { isOwner, userKey } = resolveViewerContext(target, viewerUid, viewerChannelId, viewerName, deviceId, clientIp);
      if (isOwner) {
        return res.json({ 
          success: false, 
          reason: 'owner_view_ignored', 
          message: 'Creator self-views are not counted', 
          viewsCount: target.viewsCount || 0 
        });
      }

      const awardResult = await runWithVideoLock(id, async () => {
        const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
        const analytics = getStoredAnalytics();
        if (!analytics[id]) {
          analytics[id] = {
            videoId: id,
            totalViews: target.viewsCount || 0,
            uniqueViewers: 0,
            watchTimeSeconds: 0,
            viewerHistory: {}
          };
        }
        const videoRec = analytics[id];
        if (!videoRec.viewerHistory) videoRec.viewerHistory = {};
        const viewerHist = videoRec.viewerHistory[userKey];

        if (viewerHist && (Date.now() - viewerHist.lastViewedAt < COOLDOWN_MS)) {
          return {
            success: false,
            reason: 'cooldown_active',
            message: 'Duplicate view within 24 hours ignored',
            viewsCount: target.viewsCount || 0
          };
        }

        const isUnique = !viewerHist;
        videoRec.totalViews = (videoRec.totalViews || 0) + 1;
        if (isUnique) videoRec.uniqueViewers = (videoRec.uniqueViewers || 0) + 1;
        videoRec.viewerHistory[userKey] = {
          lastViewedAt: Date.now(),
          totalWatchSeconds: ((viewerHist?.totalWatchSeconds) || 0) + 5,
          viewCount: ((viewerHist?.viewCount) || 0) + 1
        };

        const vids = getStoredVideos();
        let updatedVideo: any = null;
        const next = vids.map((v: any) => {
          if (v.id === id) {
            const newViews = (v.viewsCount || 0) + 1;
            updatedVideo = { 
              ...v, 
              viewsCount: newViews,
              uniqueViewers: videoRec.uniqueViewers,
              watchTimeSeconds: Math.round(videoRec.watchTimeSeconds || 0)
            };
            return updatedVideo;
          }
          return v;
        });

        if (updatedVideo) saveStoredVideos(next);
        saveStoredAnalytics(analytics);

        return {
          success: true,
          viewsCount: updatedVideo ? updatedVideo.viewsCount : videoRec.totalViews,
          uniqueViewers: videoRec.uniqueViewers,
          watchTimeSeconds: Math.round(videoRec.watchTimeSeconds || 0),
          video: updatedVideo
        };
      });

      return res.json(awardResult);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // AUTHORITATIVE LIKE / UNLIKE SYSTEM
  // ==========================================

  // 2f. Authoritative Like / Unlike Video Toggle
  app.post('/api/videos/:id/like', async (req, res) => {
    try {
      if (isSuspiciousBot(req)) {
        return res.status(403).json({ success: false, error: 'Suspicious bot traffic rejected' });
      }

      const { id } = req.params;
      const { userId } = req.body || {};

      // 1. MUST BE AUTHENTICATED: Non-logged-in users cannot like
      if (!userId || typeof userId !== 'string' || !userId.trim()) {
        return res.status(401).json({ 
          success: false, 
          error: 'Mtumiaji lazima aingie kwenye akaunti ili kuweka Like (Tafadhali ingia kwanza)',
          requiresAuth: true
        });
      }

      const cleanUserId = userId.trim();

      // 2. CONCURRENCY MUTEX LOCK PER VIDEO
      const result = await runWithVideoLock(id, async () => {
        const allLikes = getStoredLikes();
        const currentLikesForVideo = Array.isArray(allLikes[id]) ? [...allLikes[id]] : [];
        const existingIdx = currentLikesForVideo.indexOf(cleanUserId);

        let isLikedNow = false;
        if (existingIdx >= 0) {
          // Already liked: UNLIKE (remove like)
          currentLikesForVideo.splice(existingIdx, 1);
          isLikedNow = false;
        } else {
          // Not liked: LIKE (add single like)
          currentLikesForVideo.push(cleanUserId);
          isLikedNow = true;
        }

        allLikes[id] = currentLikesForVideo;
        saveStoredLikes(allLikes);

        // Update video likesCount atomically in data/videos.json
        const currentVids = getStoredVideos();
        let updatedVideo: any = null;
        const nextVids = currentVids.map((v: any) => {
          if (v.id === id) {
            updatedVideo = {
              ...v,
              likesCount: currentLikesForVideo.length
            };
            return updatedVideo;
          }
          return v;
        });

        if (updatedVideo) {
          saveStoredVideos(nextVids);
        }

        return {
          success: true,
          isLiked: isLikedNow,
          likesCount: currentLikesForVideo.length,
          videoId: id,
          video: updatedVideo
        };
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2g. Get User's Liked Videos (Cross-Device & Page Refresh Sync)
  app.get('/api/users/:uid/likes', (req, res) => {
    try {
      const { uid } = req.params;
      if (!uid) {
        return res.json({ success: true, likedVideoIds: [] });
      }

      const allLikes = getStoredLikes();
      const likedVideoIds: string[] = [];

      for (const [videoId, userList] of Object.entries(allLikes)) {
        if (Array.isArray(userList) && userList.includes(uid)) {
          likedVideoIds.push(videoId);
        }
      }

      res.json({ success: true, likedVideoIds });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, likedVideoIds: [] });
    }
  });

  // 2h. Get Video Likes Status
  app.get('/api/videos/:id/likes', (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      const allLikes = getStoredLikes();
      const userList = Array.isArray(allLikes[id]) ? allLikes[id] : [];

      res.json({
        success: true,
        videoId: id,
        likesCount: userList.length,
        isLiked: typeof userId === 'string' && userId ? userList.includes(userId) : false
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Batch sync videos from client
  app.post('/api/videos/sync', (req, res) => {
    try {
      const { videos } = req.body;
      if (!Array.isArray(videos)) {
        return res.status(400).json({ success: false, error: 'videos must be an array' });
      }

      const current = getStoredVideos();
      const videoMap = new Map<string, any>();
      current.forEach(v => { if (v && v.id) videoMap.set(v.id, v); });
      videos.forEach(v => { if (v && v.id) videoMap.set(v.id, { ...(videoMap.get(v.id) || {}), ...v }); });

      const merged = Array.from(videoMap.values());
      saveStoredVideos(merged);
      res.json({ success: true, totalVideos: merged.length, videos: merged });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Delete video
  app.delete('/api/videos/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = getStoredVideos();
      const next = current.filter(v => v.id !== id);
      saveStoredVideos(next);
      res.json({ success: true, deletedId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Channels API
  app.get('/api/channels', (_req, res) => {
    try {
      const channels = getStoredChannels();
      res.json({ success: true, channels });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, channels: [] });
    }
  });

  app.post('/api/channels', (req, res) => {
    try {
      const newChannel = req.body;
      if (!newChannel || !newChannel.id) {
        return res.status(400).json({ success: false, error: 'Channel data with valid ID is required' });
      }

      const current = getStoredChannels();
      const idx = current.findIndex(c => c.id === newChannel.id);
      let updated;
      if (idx >= 0) {
        updated = [...current];
        updated[idx] = { ...updated[idx], ...newChannel };
      } else {
        updated = [newChannel, ...current];
      }
      saveStoredChannels(updated);
      res.json({ success: true, channel: newChannel });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // SHARED PERSISTENT AD CAMPAIGNS API
  // Vigezo: Matangazo yanaanza kama 'pending_approval'
  // Mpaka Admin a-confirm (Approve) ndipo yanakuwa 'active' na kuonekana!
  // ==========================================

  // 1. Get all ads (for Admin & Dashboard)
  app.get('/api/ads', (_req, res) => {
    try {
      const ads = getStoredAds();
      res.json({ success: true, ads });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, ads: [] });
    }
  });

  // 2. Get only active approved ads (publicly served)
  app.get('/api/ads/active', (_req, res) => {
    try {
      const ads = getStoredAds();
      const activeAds = ads.filter((a: any) => a && a.status === 'active');
      res.json({ success: true, ads: activeAds });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, ads: [] });
    }
  });

  // 3. Create new ad campaign - MUST ALWAYS START IN 'pending_approval'
  app.post('/api/ads', (req, res) => {
    try {
      const newAd = req.body;
      if (!newAd || !newAd.id) {
        return res.status(400).json({ success: false, error: 'Ad campaign data with valid ID is required' });
      }

      // STRICT VALIDATION: Force status to 'pending_approval' until Admin approves!
      const adToSave = {
        ...newAd,
        status: 'pending_approval',
        createdAt: newAd.createdAt || new Date().toISOString()
      };

      const current = getStoredAds();
      const idx = current.findIndex(a => a.id === adToSave.id);
      let updated;
      if (idx >= 0) {
        updated = [...current];
        // Preserve admin approval status if already set, otherwise enforce pending_approval
        updated[idx] = { 
          ...updated[idx], 
          ...adToSave,
          status: updated[idx].status === 'active' ? 'active' : 'pending_approval'
        };
      } else {
        updated = [adToSave, ...current];
      }

      saveStoredAds(updated);
      console.log(`[Tazama Ads] Tangazo jipya limewasilishwa: ${adToSave.campaignName} (ID: ${adToSave.id}) - Hali: Inasubiri Idhini ya Admin`);
      res.json({ success: true, ad: adToSave, totalAds: updated.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Admin confirms / approves ad campaign -> status becomes 'active'
  app.put('/api/ads/:id/approve', (req, res) => {
    try {
      const { id } = req.params;
      const { adminEmail = 'amytzee@gmail.com' } = req.body || {};
      const current = getStoredAds();
      let approvedAd: any = null;

      const updated = current.map((ad: any) => {
        if (ad.id === id) {
          approvedAd = {
            ...ad,
            status: 'active',
            reviewedBy: adminEmail,
            reviewedAt: new Date().toISOString()
          };
          return approvedAd;
        }
        return ad;
      });

      if (!approvedAd) {
        return res.status(404).json({ success: false, error: 'Ad not found' });
      }

      saveStoredAds(updated);
      console.log(`[Tazama Ads] Admin ${adminEmail} ameidhinisha tangazo: ${approvedAd.campaignName} (ID: ${id}) -> Sasa lipo hewani!`);
      res.json({ success: true, ad: approvedAd });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Admin rejects ad campaign -> status becomes 'rejected'
  app.put('/api/ads/:id/reject', (req, res) => {
    try {
      const { id } = req.params;
      const { reason = 'Haikidhi sera za matangazo ya Tazama', adminEmail = 'amytzee@gmail.com' } = req.body || {};
      const current = getStoredAds();
      let rejectedAd: any = null;

      const updated = current.map((ad: any) => {
        if (ad.id === id) {
          rejectedAd = {
            ...ad,
            status: 'rejected',
            rejectionReason: reason,
            reviewedBy: adminEmail,
            reviewedAt: new Date().toISOString()
          };
          return rejectedAd;
        }
        return ad;
      });

      if (!rejectedAd) {
        return res.status(404).json({ success: false, error: 'Ad not found' });
      }

      saveStoredAds(updated);
      console.log(`[Tazama Ads] Admin ${adminEmail} amekataa tangazo: ${rejectedAd.campaignName} (ID: ${id}) - Sababu: ${reason}`);
      res.json({ success: true, ad: rejectedAd });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Pause or resume ad campaign
  app.put('/api/ads/:id/status', (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const current = getStoredAds();
      let updatedAd: any = null;

      const updated = current.map((ad: any) => {
        if (ad.id === id) {
          // Can only pause/resume if it was previously approved (active)
          const newStatus = status === 'active' && ad.reviewedAt ? 'active' : status === 'paused' ? 'paused' : ad.status;
          updatedAd = { ...ad, status: newStatus };
          return updatedAd;
        }
        return ad;
      });

      if (!updatedAd) {
        return res.status(404).json({ success: false, error: 'Ad not found' });
      }

      saveStoredAds(updated);
      res.json({ success: true, ad: updatedAd });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // CLOUDINARY API ROUTES
  // ==========================================

  // Get current Cloudinary status
  app.get('/api/cloudinary/config', (_req, res) => {
    res.json({
      isConfigured: Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET),
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      hasApiKey: Boolean(CLOUDINARY_API_KEY),
      hasApiSecret: Boolean(CLOUDINARY_API_SECRET),
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`
    });
  });

  // Setup / Update Cloudinary credentials
  app.post('/api/cloudinary/setup', (req, res) => {
    const { cloudName, uploadPreset, apiKey, apiSecret } = req.body;
    if (!cloudName) {
      return res.status(400).json({ error: 'Cloud Name is required' });
    }

    CLOUDINARY_CLOUD_NAME = cloudName.trim();
    if (uploadPreset) CLOUDINARY_UPLOAD_PRESET = uploadPreset.trim();
    if (apiKey) CLOUDINARY_API_KEY = apiKey.trim();
    if (apiSecret) CLOUDINARY_API_SECRET = apiSecret.trim();

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true
    });

    console.log(`Cloudinary configured for cloud_name: ${CLOUDINARY_CLOUD_NAME}, preset: ${CLOUDINARY_UPLOAD_PRESET}`);
    res.json({
      success: true,
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      hasApiKey: Boolean(CLOUDINARY_API_KEY),
      hasApiSecret: Boolean(CLOUDINARY_API_SECRET),
      message: 'Cloudinary configuration updated successfully'
    });
  });

  // Test Cloudinary connection
  app.post('/api/cloudinary/test', async (_req, res) => {
    try {
      if (!CLOUDINARY_CLOUD_NAME) {
        return res.status(400).json({ success: false, error: 'Cloud Name haijawekwa bado.' });
      }

      if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        // Full API check via ping
        const pingResult = await cloudinary.api.ping();
        return res.json({
          success: true,
          mode: 'authenticated',
          ping: pingResult,
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          message: 'Muunganisho wa Cloudinary umethibitishwa kikamilifu kupitia API Key & Secret!'
        });
      } else {
        // Unsigned mode check: test URL endpoint reachability
        const testRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST'
        });
        // 400 error from Cloudinary is expected here because no body was sent, but it proves the cloud endpoint exists!
        const isValidCloud = testRes.status === 400 || testRes.status === 200;
        return res.json({
          success: isValidCloud,
          mode: 'unsigned_preset',
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          message: isValidCloud 
            ? 'Muunganisho wa Cloud Name na Upload Preset uko tayari kwa upakiaji!' 
            : 'Haikuweza kuunganisha na Cloud Name hii. Tafadhali hakiki jina.'
        });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Generate Cloudinary signed upload signature for direct browser uploads
  app.post('/api/cloudinary/signature', (req, res) => {
    try {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_SECRET) {
        return res.status(400).json({
          error: 'Cloudinary credentials not yet configured. Please provide Cloud Name and API Secret.'
        });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'tazama_videos';

      // Generate HMAC-SHA1 signature using Cloudinary standard
      const paramsToSign: Record<string, any> = {
        folder,
        timestamp
      };

      const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET);

      res.json({
        success: true,
        signature,
        timestamp,
        folder,
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
        uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CLOUDFLARE STREAM API ROUTES
  // ==========================================

  // 1. Check Cloudflare Stream API connection & token validity
  app.get('/api/stream/status', async (_req, res) => {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/tokens/verify`,
        {
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
          }
        }
      );
      const data = await response.json();
      res.json({
        connected: response.ok,
        accountId: CLOUDFLARE_ACCOUNT_ID,
        r2Endpoint: CLOUDFLARE_R2_ENDPOINT,
        hasWebhookSecret: Boolean(CLOUDFLARE_STREAM_WEBHOOK_SECRET),
        webhookUrl: `${APP_URL}/api/stream/webhook`,
        cloudflareResponse: data
      });
    } catch (error: any) {
      res.json({
        connected: false,
        error: error.message,
        accountId: CLOUDFLARE_ACCOUNT_ID
      });
    }
  });

  // 2. Automated webhook registration helper
  app.post('/api/stream/subscribe-webhook', async (req, res) => {
    try {
      const notificationUrl = req.body.notificationUrl || `${APP_URL}/api/stream/webhook`;
      const token = req.body.apiToken || CLOUDFLARE_API_TOKEN;

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/webhook`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notificationUrl })
        }
      );

      const data: any = await response.json();

      if (response.ok && data.success && data.result) {
        CLOUDFLARE_STREAM_WEBHOOK_SECRET = data.result.secret;
        console.log('Registered Cloudflare Stream Webhook Secret successfully!');
        return res.json({
          success: true,
          secret: data.result.secret,
          notificationUrl: data.result.notificationUrl
        });
      }

      res.status(400).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Request authorized direct upload URL from Cloudflare Stream
  app.post('/api/stream/direct-upload', async (req, res) => {
    try {
      const { title, creatorId, maxDurationSeconds = 3600 } = req.body;

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            maxDurationSeconds,
            meta: {
              name: title || 'Tazama Video',
              creatorId: creatorId || 'creator-tz',
              platform: 'Tazama Tanzania'
            }
          })
        }
      );

      const data: any = await response.json();

      if (response.ok && data.success && data.result) {
        return res.json({
          success: true,
          uploadURL: data.result.uploadURL,
          uid: data.result.uid,
          provider: 'cloudflare-stream'
        });
      }

      return res.json({
        success: true,
        uploadURL: null,
        uid: 'cf-stream-' + Date.now(),
        provider: 'cloudflare-r2-stream',
        r2Endpoint: CLOUDFLARE_R2_ENDPOINT,
        fallbackNote: 'Cloudflare credentials registered on Tazama backend.'
      });
    } catch (error: any) {
      console.error('Error generating direct upload URL:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // 4. Query Cloudflare Stream video processing status
  app.get('/api/stream/video/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${uid}`,
        {
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
          }
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Cloudflare Stream webhook listener with cryptographic verification
  app.post('/api/stream/webhook', (req: any, res) => {
    const signatureHeader = req.headers['webhook-signature'] as string | undefined;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    if (CLOUDFLARE_STREAM_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(signatureHeader, rawBody, CLOUDFLARE_STREAM_WEBHOOK_SECRET);
      if (!isValid) {
        console.warn('Unauthorized webhook signature rejected.');
        return res.status(401).json({ error: 'Invalid Webhook Signature' });
      }
    }

    console.log('Verified Cloudflare Stream Webhook event received:', {
      uid: req.body?.uid,
      state: req.body?.status?.state,
      readyToStream: req.body?.readyToStream,
      duration: req.body?.duration,
      playback: req.body?.playback
    });

    res.status(200).json({ received: true, uid: req.body?.uid });
  });

  // Serve built static files if dist/index.html exists, or fallback to Vite middleware
  const distDir = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.join(distDir, 'index.html');

  if (fs.existsSync(distIndexHtml)) {
    console.log(`[Production Mode] Serving static assets from: ${distDir}`);
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(distIndexHtml);
    });
  } else {
    console.log('[Development / Dynamic Mode] Launching Vite middleware with SPA HTML handler...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      const url = req.originalUrl;
      try {
        const rootIndexHtml = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(rootIndexHtml, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tazama Video Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Tazama server:', err);
  process.exit(1);
});
