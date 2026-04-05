#IMPORTANT

Create .env in frontend folder, and paste this in (otherwise app will not run)
NEXT_PUBLIC_API_BASE_URL=https://a9e5jfse8i.execute-api.us-east-1.amazonaws.com

# AI Ethnography Website

A global ethnographic study platform capturing how healthcare professionals experience artificial intelligence in their daily practice. The **Next.js** UI lives under `frontend/`; **AWS** (CDK + Lambda) for uploads, transcription, moderation, and discussion API lives under `backend/`.

## Tech stack

| Area | Stack |
|------|--------|
| Web app | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Globe | react-globe.gl, Three.js |
| PWA | @ducanh2912/next-pwa |
| Backend (optional) | AWS CDK, API Gateway, Lambda, S3, DynamoDB, Transcribe, Bedrock — see `backend/README.md` |

The browser calls your deployed HTTP API when `NEXT_PUBLIC_API_BASE_URL` is set in `frontend/.env.local`; without it, the app can still run with local/mock behavior for parts of the UI.

## Getting started

### Prerequisites

- Node.js 18+ (Node 20+ for `backend/` CDK deploy)
- npm

### Frontend (local)

1. Clone the repository:
   ```bash
   git clone https://github.com/aadityapanchal7/AI-Ethnography-Website.git
   cd AI-Ethnography-Website
   ```

2. Install and run from **`frontend/`**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

### Environment

- Copy `frontend/.env.example` → `frontend/.env.local`.
- Set `NEXT_PUBLIC_API_BASE_URL` to your API base URL (no trailing slash), e.g. from CDK output `HttpApiUrl` after `backend` deploy.
- Restart `npm run dev` after changing env vars.

### Backend (AWS)

See **`backend/README.md`** for `npm install`, `npm run deploy`, stack outputs, and destroy/retention notes.

## Deploy on Vercel

1. Import the GitHub repo into Vercel.
2. **Project → Settings → General → Root Directory** → set to **`frontend`** and save.
3. Add the same env vars (e.g. `NEXT_PUBLIC_API_BASE_URL`) under **Settings → Environment Variables**.
4. Deploy; default Next.js build command applies inside `frontend/`.

## Repository layout

```
AI-Ethnography-Website/
├── frontend/                 # Next.js app — npm install & npm run dev here
│   ├── public/               # Static assets, PWA artifacts (sw.js, manifest, …)
│   ├── src/
│   │   ├── app/              # App Router routes (see below)
│   │   ├── components/       # React components
│   │   ├── hooks/
│   │   ├── lib/              # API client, types, mock data, helpers
│   │   └── types/
│   ├── next.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── backend/                  # AWS CDK app + Lambda handlers (`backend/README.md`)
├── .gitignore
└── README.md
```

### App routes (`frontend/src/app/`)

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/map` | Map of submissions / discussion handoff |
| `/discussion` | Discussion thread list |
| `/discussion/[postId]` | Single thread + comments |
| `/share` | Voice submission flow (metadata, record, review) |
| `/explore` | Explore stories |
| `/contact` | Contact |

### Components (`frontend/src/components/`)

Includes **Navbar** (desktop links + mobile hamburger menu), **BackgroundGlobe** / **HomeBackgroundGlobe**, **Globe**, **AudioRecorder**, **ConsentModal**, **MetadataForm**, **ReviewSubmit**, **StoryPromptGuide**, **HighlightsFeed**, **ThemesPanel**, **DiscussionForum**, **DiscussionSubmissionMeta**, and related UI.

### Library (`frontend/src/lib/`)

| File | Role |
|------|------|
| `api.ts` | HTTP client for posts, comments, uploads |
| `types.ts` | Shared TypeScript types |
| `mockData.ts` | Development fixtures |
| `audioUpload.ts` | Presigned upload helpers |
| `backgroundGlobeData.ts` | Globe background points/arcs |
| `metadataDisplay.ts` | Labels for metadata (e.g. practice setting) |

## Scripts (run inside `frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Webpack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## Cursor / IDE

If you use Cursor rules, you can add **`frontend/.cursorrules`** and open the **`frontend`** folder as the workspace (or add it in a multi-root workspace) so paths line up with `src/`.

## License

MIT
