# Road to 100K

A simple, modern static site to track a YouTube channel’s progress to 100,000 subscribers and drive subscriptions.

## Quick Start

- Open `index.html` directly in a browser, or serve the folder with any static server.
- All assets are plain HTML/CSS/JS. No build step.

## Configure (optional)

Edit `script.js` → `CONFIG` or use a local `env.js` (recommended for local dev):

```javascript
const CONFIG = {
  YOUTUBE_API_KEY: "YOUR_API_KEY", // optional for live data
  CHANNEL_ID: "UCxxxxxxxxxxxxxxxxxxxxxx", // your channel ID
  FEATURED_VIDEO_ID: "VIDEO_ID", // video to feature
  TARGET_SUBSCRIBERS: 100000,
};
```

If you skip the API key, the site runs in demo mode with simulated data.

### Local env.js (gitignored)

Create `env.js` in project root:

```html
window.ENV = { YOUTUBE_API_KEY: "YOUR_API_KEY" };
```

## Deploy (Vercel)

- New Project → Import repo → Framework: Other
- Build Command: empty
- Output Directory: empty (serves from repository root)
- Or CLI: `vercel --prod --yes`

## Custom Domain (GoDaddy → Vercel)

Add both `roadto100k.live` and `www.roadto100k.live` in Vercel → Project → Settings → Domains, set the apex as Primary.

Keep GoDaddy as DNS (simple):

- A: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

SSL is issued automatically by Vercel after DNS propagates.

## Tech

- HTML + CSS (responsive, animated)
- Vanilla JS (fetch YouTube data, progress updates)

## License

MIT. Do whatever helps you reach 100K faster. 🚀
