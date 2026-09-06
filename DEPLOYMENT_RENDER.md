# 🚀 Deploying Veritas on Render (Step-by-Step Guide)

This guide walks you through deploying **Veritas** to [Render](https://render.com) using either the **1-Click Render Blueprint** (fastest) or manual dashboard configuration.

---

## ⚡ Method 1: 1-Click Blueprint Deployment (Recommended)

Render includes native Infrastructure-as-Code support. Veritas includes a pre-configured [render.yaml](render.yaml) file that automatically provisions the entire stack.

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare Veritas for Render deployment"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click the **"New +"** button in the top navigation and select **"Blueprint"**.
4. Connect your GitHub repository (`Veritas`).
5. Render will detect `render.yaml` and configure:
   - **Service Name**: `veritas-platform`
   - **Runtime**: Python 3.11 with Node 20
   - **Build Command**: `cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. Click **"Apply"**.
7. Render will build the React frontend, install backend dependencies, and launch your live URL (e.g., `https://veritas-platform.onrender.com`).

---

## 🛠️ Method 2: Manual Dashboard Configuration

If you prefer to configure the service manually via Render's web dashboard:

### Option A: Unified Full-Stack Service (Single Free Service)
*This is the easiest approach on the Render Free Tier because it hosts both frontend and backend on one URL without CORS.*

1. In the Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Select your GitHub repository.
3. Configure the settings:
   - **Name**: `veritas-platform`
   - **Region**: Any (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free`
4. Click **Advanced** $\rightarrow$ **Add Environment Variable**:
   - `PYTHON_VERSION`: `3.11.9`
   - `NODE_VERSION`: `20.11.0`
5. Click **Create Web Service**.

---

### Option B: Decoupled Services (Separate Backend & Frontend)
*Best if you want to deploy the frontend as a global CDN Static Site and the backend as a Web Service.*

#### 1. Backend Web Service:
- **Type**: Web Service
- **Runtime**: Python 3
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Note the URL**: e.g., `https://veritas-backend.onrender.com`

#### 2. Frontend Static Site:
- **Type**: Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE`: `https://veritas-backend.onrender.com` (your backend URL from step 1)
- **Redirects / Rewrites**:
  - Go to **Redirects/Rewrites** tab in Render:
  - Add Rule: `/*` $\rightarrow$ `/index.html` (Type: `Rewrite`) to ensure React client-side routing works on page refreshes.

---

## 🔑 Optional Environment Variables

Veritas is **fully functional out-of-the-box** without any mandatory API keys (using built-in web search scraping and heuristic analysis). 

You can optionally add API keys in the Render **Environment** tab:

| Variable | Provider | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | Enables Google Gemini 2.0 Flash reasoning |
| `OPENAI_API_KEY` | OpenAI | Enables GPT-4o Mini multi-agent synthesis |
| `GROQ_API_KEY` | GroqCloud | Enables ultra-fast LLaMA 3.3 (800+ tokens/sec) |
| `TAVILY_API_KEY` | Tavily Research | Supplementary academic deep-search fallback |

*(Note: Users can also input their personal API keys directly in the frontend Settings modal at any time).*

---

## 🔍 Verification & Healthcheck

Once deployed, you can verify your service status:
- Health check: `https://your-service.onrender.com/api/health`
- Presets catalog: `https://your-service.onrender.com/api/presets`
- Frontend UI: `https://your-service.onrender.com/`

---

## 💡 Render Free Tier Tips

1. **Free Tier Sleep**: On Render's free tier, web services spin down after 15 minutes of inactivity. When a request arrives, Render wakes up the service in ~30–50 seconds.
2. **Keep-Alive (Optional)**: If presenting at a live hackathon or demo, you can use a free ping tool like [UptimeRobot](https://uptimerobot.com) to ping `https://your-service.onrender.com/api/health` every 5 minutes to prevent sleep during your presentation.
