# 🚀 Deployment Guide

This application can be deployed on multiple free platforms. Choose based on your needs:

## Option 1: Vercel (Recommended - Serverless)

**Best for:** Serverless deployment with automatic scaling and global CDN

### Setup Steps:

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts and it will deploy automatically!

3. **Or Deploy via GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects the configuration
   - Click "Deploy"

### Configuration:
- ✅ Already configured with `vercel.json`
- ✅ Serverless functions in `/api` directory
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ No cold starts for frequently accessed functions

### Limits (Free Tier):
- 100 GB bandwidth/month
- 100 GB-hours compute/month
- 10 second function timeout (sufficient for image generation)

---

## Option 2: Render (Traditional Server)

**Best for:** Traditional Express server deployment (always running)

### Setup Steps:

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Click "Create Web Service"

### Limits (Free Tier):
- Service sleeps after 15 min inactivity
- Slower cold starts (~30 seconds)
- 750 hours/month of running time
- No custom domains on free tier

---

## Option 3: Railway

**Best for:** Easy deployment with good free tier

### Setup Steps:

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects Node.js and deploys

### Configuration:
No configuration needed! Railway auto-detects `package.json`.

### Limits (Free Tier):
- $5 free credit/month
- ~500 hours of usage
- No sleep on inactivity

---

## Option 4: Fly.io

**Best for:** Containerized deployment with good performance

### Setup Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Launch**:
   ```bash
   fly launch
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

### Limits (Free Tier):
- 3 shared-cpu-1x VMs
- 3GB persistent volume storage
- 160GB outbound data transfer

---

## Option 5: Netlify (with Serverless Functions)

**Note:** Requires some adaptation as Netlify functions have stricter limits

### Setup Steps:

1. Create `netlify.toml`:
   ```toml
   [build]
     functions = "netlify/functions"

   [[redirects]]
     from = "/calendar/generate"
     to = "/.netlify/functions/generate"
     status = 200

   [[redirects]]
     from = "/*"
     to = "/.netlify/functions/index"
     status = 200
   ```

2. Move functions to `netlify/functions/` directory

3. Deploy via:
   - Drag & drop on Netlify dashboard
   - Or connect GitHub repo

### Limits (Free Tier):
- 125,000 function requests/month
- 100 GB bandwidth/month
- **10 second timeout** (might be tight for 4K images)

---

## 🎯 Recommendation by Use Case

| Use Case | Platform | Why |
|----------|----------|-----|
| **Production API** | Vercel | Best performance, CDN, no cold starts |
| **Always-on server** | Railway | No sleep, good free tier |
| **Simple deployment** | Render | Easy setup, familiar Express deployment |
| **Container-based** | Fly.io | Full control, good for Docker fans |
| **Static + API** | Netlify | If you have a static frontend too |

---

## 🔧 Environment Variables

For all platforms, you can set these optional environment variables:

```bash
PORT=3000                    # Server port (auto-set on most platforms)
NODE_ENV=production          # Environment mode
```

---

## 📊 Performance Comparison

| Platform | Cold Start | Latency | Uptime | Free Tier |
|----------|-----------|---------|--------|-----------|
| Vercel | ~100ms | Excellent | 99.9% | Generous |
| Render | ~30s | Good | 99% (sleeps) | Limited |
| Railway | ~500ms | Excellent | 99.9% | Good |
| Fly.io | ~200ms | Excellent | 99.9% | Good |
| Netlify | ~200ms | Excellent | 99.9% | Generous |

---

## 🚦 Quick Start (Vercel)

The fastest way to deploy:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from project directory)
vercel

# Follow prompts and you're live in 30 seconds!
```

Your API will be available at: `https://your-project.vercel.app`

---

## 📝 Post-Deployment

After deploying, test your API:

```bash
# Replace with your deployed URL
curl "https://your-api.vercel.app/calendar/generate?year=2024&device=laptop" -o test.png
```

---

## 💡 Tips

1. **Vercel/Netlify**: Best for high traffic, automatic scaling
2. **Railway/Render**: Best for traditional server deployment
3. **Caching**: All platforms support CDN caching - add cache headers
4. **Monitoring**: Enable platform monitoring to track usage
5. **Custom Domains**: Available on all platforms (usually free)

---

## 🆘 Troubleshooting

### Timeout Issues
- Vercel/Netlify: 10s limit should be fine for 4K generation (~1-2s)
- If timeouts occur, consider reducing image quality or size

### Memory Issues
- Sharp is efficient, but 4K images need ~500MB memory
- All platforms provide sufficient memory on free tiers

### Cold Starts
- Vercel: Minimal cold starts
- Render: ~30s on free tier
- Use paid tier or Railway for zero cold starts

---

## 📞 Support

For deployment issues, check:
- Platform documentation
- Platform community forums
- This project's GitHub issues
