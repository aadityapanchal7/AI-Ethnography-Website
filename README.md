# AI Ethnography Website

A global ethnographic study platform capturing how healthcare professionals experience artificial intelligence in their daily practice.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Visualization**: react-globe.gl + Three.js
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aadityapanchal7/AI-Ethnography-Website.git
   cd AI-Ethnography-Website
   ```

2. Install and run the app from `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Vercel / deploy

Set the project **Root Directory** to `frontend` so builds run from the Next.js app folder.

## Project Structure

```
frontend/                 # Next.js app (run npm install here)
├── public/
├── src/
backend/                  # AWS CDK + Lambdas (separate from the web app)
```

```
frontend/src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── share/            # Share experience flow
│   ├── explore/          # Explore global stories
│   └── contact/          # Contact page
├── components/           # React components
│   ├── AudioRecorder/    # Audio recording functionality
│   ├── ConsentModal/     # Consent form modal
│   ├── Globe/            # 3D globe visualization
│   ├── HighlightsFeed/   # Story highlights feed
│   ├── MetadataForm/     # User metadata collection
│   ├── Navbar/           # Navigation bar
│   ├── ReviewSubmit/     # Review and submit flow
│   └── ThemesPanel/      # Themes filtering panel
├── hooks/                # Custom React hooks
│   └── useAudioRecorder.ts
└── lib/                  # Utilities and types
    ├── api.ts            # API layer
    ├── types.ts          # TypeScript types
    └── mockData.ts       # Mock data for development
```

Place `.env.local` in `frontend/` (see `frontend/.env.example`).

## Scripts

Run these **inside `frontend/`** (after `cd frontend`):

| Command         | Description                |
|-----------------|----------------------------|
| `npm run dev`   | Start development server   |
| `npm run build` | Build for production       |
| `npm run start` | Start production server    |
| `npm run lint`  | Run ESLint                 |

### Cursor

Project-specific AI rules live in `frontend/.cursorrules`. Open the **`frontend`** folder as your workspace (or add it in a multi-root workspace) if you want Cursor to pick them up reliably.


## License

MIT
