## Sora² Script-to-Video Agent

A production-ready Next.js workspace that transforms long-form scripts into cinematic videos orchestrated through the fictional **Sora²** render pipeline. The UI guides users from script upload through beat planning, asset orchestration, and final render preview.

### Key Features
- Script beat detection and timeline synthesis in the browser
- Asset briefs for narration, music, B-roll, captions, and graphics
- Optional live hand-off to Sora² (via `SORA2_API_KEY`)
- Dynamic status telemetry and preview playback
- Tailwind-powered cinematic UI with framer-motion micro-interactions

### Quickstart

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and paste a multi-beat script to see the agent in action.

### Environment Variables

Create a `.env.local` file (optional) and provide real Sora² credentials to swap the mock preview with live renders:

```
SORA2_API_KEY=your_live_key
SORA2_API_URL=https://api.sora2.openai.com/v1/videos
```

Leave `SORA2_API_KEY` undefined to run with the bundled orchestration preview.

### Production Build

```bash
npm run build
npm start
```

### Deploy

This project is optimised for Vercel:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-4fe5552a
```

After the deploy completes, verify the production endpoint:

```bash
curl https://agentic-4fe5552a.vercel.app
```
