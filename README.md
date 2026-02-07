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

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
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

## Scripts

| Command         | Description                |
|-----------------|----------------------------|
| `npm run dev`   | Start development server   |
| `npm run build` | Build for production       |
| `npm run start` | Start production server    |
| `npm run lint`  | Run ESLint                 |

## License

MIT
