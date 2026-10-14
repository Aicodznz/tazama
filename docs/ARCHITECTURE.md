# TAZAMA — Tanzania's Video-Sharing Platform
**Tagline:** *“Tazama. Unda. Pata.” (Watch. Create. Earn.)*

---

## 1. Project Structure

```
├── firebase-applet-config.json    # Firebase project client configuration
├── firebase-blueprint.json        # Database Intermediate Representation (IR) schema
├── firestore.rules                # Hardened Attribute-Based Access Control rules
├── index.html                     # HTML entry point with Swahili meta, Inter font
├── metadata.json                  # AI Studio application metadata
├── package.json                   # Dependencies (Firebase, Tailwind CSS v4, Lucide)
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration
│
├── docs/
│   └── ARCHITECTURE.md            # Comprehensive system & architectural guide
│
└── src/
    ├── main.tsx                   # React root entry
    ├── App.tsx                    # Main routing, role switching, global modals
    ├── index.css                  # Tailored Tazama design tokens & custom themes
    │
    ├── __tests__/
    │   └── tazama.test.ts         # Automated unit test suite
    │
    ├── types/
    │   └── index.ts               # Complete TypeScript data model interfaces
    │
    ├── lib/
    │   ├── firebase.ts            # Firebase SDK setup, error handlers, connection checks
    │   └── i18n.ts                # Kiswahili Sanifu & English translations, TZS currency formatter
    │
    ├── data/
    │   └── mockData.ts            # High-fidelity Tanzanian initial video & gift datasets
    │
    ├── context/
    │   ├── AuthContext.tsx        # Firebase auth, user roles, mobile money wallet balance
    │   └── VideoContext.tsx       # Videos, shorts, subscriptions, comments, gifts, payouts
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx         # Original Tazama logo, search, wallet, role picker
    │   │   └── Sidebar.tsx        # Collapsible desktop navigation & mobile bottom bar
    │   ├── video/
    │   │   ├── VideoPlayer.tsx    # Adaptive player (HLS/CDN, seek, quality, speed, captions)
    │   │   └── VideoCard.tsx      # Video thumbnail card with views, duration, verified badge
    │   ├── gifts/
    │   │   └── GiftModal.tsx      # Tanzanian virtual gifts catalog (Simba, Tanzanite, etc.)
    │   ├── membership/
    │   │   └── MembershipModal.tsx# VIP Creator membership tiers (Shaba, Fedha, Dhahabu)
    │   ├── wallet/
    │   │   └── WalletModal.tsx    # Mobile Money top-up (Vodacom M-Pesa, Tigo, Airtel)
    │   ├── upload/
    │   │   └── UploadModal.tsx    # Cloudflare Stream direct-upload pipeline simulation
    │   └── modals/
    │       └── ReportModal.tsx    # COSOTA copyright & community guidelines reporting
    │
    └── pages/
        ├── HomePage.tsx           # Trending banner, category pills, shorts, recommended grid
        ├── WatchPage.tsx          # Video watch page, comments, gifts, channel membership
        ├── ShortsPage.tsx         # Vertical reels scrolling experience
        ├── CreatorStudioPage.tsx  # Analytics, watch time, finalized earnings in TZS, payouts
        ├── ChannelPage.tsx        # Creator channel page (Videos, Shorts, About)
        ├── LibraryPage.tsx        # Watch history, liked videos, subscriptions
        ├── AdminPage.tsx          # Moderation queue, COSOTA copyright actions, audit logs
        ├── SettingsPage.tsx       # Preferences, theme, language, account deletion workflow
        └── PoliciesPage.tsx       # Terms of Service, Privacy Policy, Community Guidelines
```

---

## 2. Firebase Configuration Instructions

1. **Authentication**:
   - Google Sign-In with popup is enabled by default.
   - Email/password authentication is supported in `src/lib/firebase.ts`.
   - Admin account is pre-linked to `amytzee@gmail.com`.

2. **Cloud Firestore Setup**:
   - Target Project ID: `tazama-9862d`
   - Database Mode: Native Firestore
   - Collections bootstrapped: `users`, `channels`, `videos`, `comments`, `likes`, `subscriptions`, `playlists`, `gifts`, `creatorMemberships`, `reports`, `payoutRequests`.

3. **Deploying Security Rules**:
   - Rules are defined in `firestore.rules`.
   - Deploy using the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```

---

## 3. Database Schema and Security Rules

- **Default-Deny**: The catch-all `match /{document=**} { allow read, write: if false; }` prevents unauthorized access.
- **Role Isolation**: Only authenticated admins (`amytzee@gmail.com` or admins collection) can perform moderation takedowns or view sensitive audit logs.
- **Creator Ownership**: Creators can only edit and delete their own channels and videos.
- **Strict Key Immutability**: Critical fields like `role`, `uid`, and `createdAt` cannot be modified by arbitrary client updates.

---

## 4. Cloudflare Stream & R2 Integration Instructions

Tazama employs **Cloudflare Stream & R2** for video ingestion, transcoding, and global CDN delivery:

- **Configured Account ID:** `abba19ca4804e07fb1bad6979e8a2bfd`
- **S3 / R2 Endpoint:** `https://abba19ca4804e07fb1bad6979e8a2bfd.r2.cloudflarestorage.com`
- **Backend API Routes:**
  - `GET /api/stream/status`: Verifies Cloudflare token and account status.
  - `POST /api/stream/direct-upload`: Backend authorization endpoint that generates Cloudflare Stream direct-upload sessions.
  - `GET /api/stream/video/:uid`: Inquires about Cloudflare video transcoding status.
  - `POST /api/stream/webhook`: Webhook endpoint for `video.ready` events.

1. **Direct Upload Workflow**:
   - Step 1: Frontend requests an authorized upload session from the backend (`POST /api/stream/direct-upload`).
   - Step 2: The backend issues an authenticated Cloudflare direct-upload URL:
     ```
     POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/stream/direct_upload
     Headers: Authorization: Bearer {CLOUDFLARE_STREAM_API_TOKEN}
     Body: { "maxDurationSeconds": 3600, "meta": { "creatorId": "{userId}" } }
     ```
   - Step 3: Browser uploads the video binary directly via `Tus` or standard `FormData` without passing through our web servers.
   - Step 4: Cloudflare fires a webhook (`video.ready`) to our server when adaptive bitrate encoding (1080p, 720p, 480p, 360p) completes.
   - Step 5: The video status updates to `ready` in Firestore.

---

## 5. Mobile Money & Financial Architecture

- **Currency**: Tanzanian Shillings (TZS) using integer representation. No floating-point math is used for currency balances.
- **70/30 Revenue Sharing**:
  - Eligible creators receive **70%** of net ad, membership, and gift revenues.
  - Platform retains **30%** for server maintenance, CDN streaming costs, and operational overhead.
- **Mobile Money Providers**:
  - Vodacom M-Pesa (074x, 075x, 076x)
  - Tigo Pesa (065x, 067x, 071x)
  - Airtel Money (068x, 069x, 078x)
  - Halopesa (062x)
  - Tanzanian Commercial Banks (NMB Bank, CRDB Bank) for large payouts.

---

## 6. Estimated Infrastructure Costs & Free-Tier Limits

| Resource | Service | Free Tier / Unit Cost |
| :--- | :--- | :--- |
| **Authentication** | Firebase Auth | Free (Up to 50k monthly active users) |
| **Database** | Firestore Enterprise | 50,000 daily reads, 20,000 writes free on Spark plan |
| **Video Storage** | Cloudflare Stream | $5.00 / 1,000 minutes of stored video per month |
| **Video Delivery** | Cloudflare Stream CDN | $1.00 / 1,000 minutes of delivered playback |
| **Mobile Money Fees** | Tanzanian Gateways | ~1.5% - 2.5% per incoming transaction |

---

## 7. Production-Readiness Checklist

- [x] Kiswahili Sanifu as default language with instant English switcher.
- [x] TZS currency formatting across all screens.
- [x] Inter font with Tazama brand colors (#FF3040 coral red, #10131B dark, #16C784 creator green).
- [x] Responsive video player with speed, quality selector, seeking, and captions.
- [x] Deduplicated view count tracking.
- [x] Creator Studio with real-time views, watch time, and earnings breakdown.
- [x] Mobile Money wallet top-up and creator payout request flow.
- [x] Virtual gifts catalog (Simba, Kilimanjaro Coffee, Tanzanite, etc.).
- [x] COSOTA copyright claim reporting and admin moderation queue.
- [x] Hardened `firestore.rules` and `firebase-blueprint.json`.
- [x] Automated unit test suite in `src/__tests__/tazama.test.ts`.
- [ ] Connect production Cloudflare Stream API credentials in Cloudflare dashboard.
- [ ] Sign Tanzanian Payment Aggregator agreement (e.g. Selcom / AzamPay) for live M-Pesa STK push.
