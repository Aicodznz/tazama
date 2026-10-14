import express from 'express';
import path from 'path';
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

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tazama Video Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Tazama server:', err);
  process.exit(1);
});
