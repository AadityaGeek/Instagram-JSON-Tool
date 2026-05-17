# Instagram GraphQL JSON Extractor

A full-stack web application to extract hidden Instagram GraphQL JSON data from Reels and Posts.

## Project Structure

```
/
├── frontend/           # Static frontend files (GitHub Pages)
│   ├── index.html      # UI structure
│   ├── style.css       # Dark modern styling
│   └── script.js       # Frontend logic & API calls
└── backend/            # Python Flask API (Render)
    ├── app.py          # Flask application logic
    ├── requirements.txt # Python dependencies
    └── Procfile        # Deployment configuration for Render
```

## Setup & Local Development

### Backend
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
   The backend will be available at `http://localhost:5000`.

### Frontend
1. Open `frontend/index.html` in your browser.
2. The frontend is configured to automatically detect if it's running on `localhost` and will connect to the local backend.

## Deployment Instructions

### 1. Backend (Render)
1. Create a new GitHub repository and push the entire project.
2. Log in to [Render](https://render.com/).
3. Create a new **Web Service**.
4. Connect your GitHub repository.
5. Set the following configurations:
   - **Name**: `instagram-json-extractor-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Once deployed, copy the provided URL (e.g., `https://your-app.onrender.com`).

### 2. Frontend (GitHub Pages)
1. Update the `API_ENDPOINT` in `frontend/script.js` with your Render backend URL:
   ```javascript
   const API_ENDPOINT = 'https://your-app.onrender.com/get-data';
   ```
2. Go to your GitHub repository **Settings** > **Pages**.
3. Under **Build and deployment**, select:
   - **Source**: Deploy from a branch
   - **Branch**: `main` / `(root)` / `frontend` folder (or just keep everything in the root if preferred, but usually GitHub Pages works best if `index.html` is at the root or you use a specific branch/folder).
   *Note: If you keep the current structure, you might want to move `frontend` contents to a `gh-pages` branch or use a GitHub Action to deploy the `frontend` folder.*

## Future Upgrades
- **Video URL Extraction**: Parse the JSON to find the direct `.mp4` link.
- **Thumbnail Preview**: Display the image/video thumbnail before showing JSON.
- **Download Button**: Add a button to download the JSON as a `.json` file.
- **Login Cookie Support**: Allow users to provide their session cookies for private post extraction.
- **Playwright Automation**: Use headless browsers for more robust extraction if GraphQL IDs change.
- **API Change Detection**: Implement alerts if Instagram changes their internal API structure.
- **Dark/Light Mode**: Add a toggle for user preference.

## Disclaimer
This tool is for educational purposes only. Please respect Instagram's Terms of Service and use responsibly.
