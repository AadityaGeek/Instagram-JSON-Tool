# Instagram GraphQL JSON Extractor

A full-stack, professional web application to extract hidden Instagram GraphQL JSON data from Reels and Posts. Optimized for both public and private content with automated workflows.

## Project Structure

```text
/
├── index.html          # UI Structure (Root for GitHub Pages)
├── style.css           # Clean, modern, responsive styling
├── script.js           # Advanced frontend logic & automation
├── .gitignore          # Git exclusion rules
└── backend/            # Python Flask API (Render)
    ├── app.py          # Flask logic with auto doc_id discovery
    ├── requirements.txt # Python dependencies
    └── Procfile        # Render deployment config
```

## Features

- **Automated Public Fetch**: Instant extraction of public Reel/Post data via backend.
- **Private Post Bridge**: Specialized workflow for private content using your own browser session.
- **Auto doc_id Discovery**: Backend automatically scrapes the latest Instagram GraphQL IDs to ensure the tool never breaks.
- **Instant Auto-Copy**: GraphQL links and final JSON are automatically copied to your clipboard.
- **Cross-Device Ready**: Designed to work seamlessly across PC, Mac, and Mobile.
- **Direct Media Download**: Automatically extracts and provides high-quality `.mp4` and `.jpg` download buttons.

## Setup & Local Development

### 1. Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask app:
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`.

### 2. Frontend
1. Open `index.html` (in the root folder) directly in your browser.
2. The tool automatically detects if it's running on `localhost` and connects to your local backend.

## Deployment Instructions (Free)

### 1. Backend (Render)
1. Push your project to a GitHub repository.
2. Create a new **Web Service** on [Render.com](https://render.com/).
3. Connect your repository.
4. Settings:
   - **Name**: `instagram-json-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Copy the provided URL (e.g., `https://instagram-json-backend.onrender.com`).

### 2. Connect & Deploy Frontend (GitHub Pages)
1. In `script.js`, update `API_ENDPOINT` with your Render URL.
2. Push the change to GitHub.
3. Go to Repository **Settings > Pages**.
4. Select **Branch: main** and **Folder: /(root)**.
5. Click **Save**. Your tool is now live!

## Disclaimer
This tool is for educational and personal use only. Please respect Instagram's Terms of Service and user privacy.

