import re
import json
import requests
import urllib.parse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes to allow static frontend to communicate with this backend
CORS(app)

# Global cache for discovered tokens
# Uses the user-provided doc_id as the primary fallback
cached_tokens = {
    "doc_id": "8845758582119845", 
    "app_id": "936619743392459"
}

def discover_insta_tokens():
    """
    Scrapes Instagram's public pages to find the latest GraphQL doc_id and App ID.
    This ensures the tool remains functional even after Instagram updates.
    """
    global cached_tokens
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        # Scrape public configuration from a generic reels page
        response = requests.get("https://www.instagram.com/reels/videos/", headers=headers, timeout=10)
        if response.status_code == 200:
            # Look for App ID in the JS configuration
            app_id_match = re.search(r'\"appId\":\"(\d+)\"', response.text) or re.search(r'\"app_id\":\"(\d+)\"', response.text)
            if app_id_match:
                cached_tokens["app_id"] = app_id_match.group(1)
            
            # Look for document_id (GraphQL query ID)
            # Multiple IDs exist; we prioritize the one used for media detail queries
            doc_ids = re.findall(r'\"document_id\":\"(\d+)\"', response.text)
            if doc_ids:
                # We update the cache with the first found ID
                cached_tokens["doc_id"] = doc_ids[0]
    except Exception as e:
        print(f"Token discovery failed: {e}")

def extract_shortcode(url):
    """
    Extracts the unique shortcode from an Instagram URL.
    Supports /p/, /reel/, /reels/, and /tv/ formats.
    """
    pattern = r'(?:https?://)?(?:www\.)?instagram\.com/(?:p|reel|reels|tv)/([^/?#&]+)'
    match = re.search(pattern, url)
    return match.group(1) if match else None

@app.route('/get-data', methods=['POST'])
def get_instagram_data():
    """
    Primary endpoint for fetching Instagram JSON data.
    Automatically discovers tokens and uses the GraphQL API.
    """
    try:
        # Refresh tokens to stay up to date with Instagram's changes
        discover_insta_tokens()
        
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({"error": "No URL provided"}), 400

        instagram_url = data['url']
        shortcode = extract_shortcode(instagram_url)

        if not shortcode:
            return jsonify({"error": "Invalid Instagram URL format."}), 400

        api_url = "https://www.instagram.com/graphql/query"
        doc_id = cached_tokens["doc_id"]
        
        variables = {
            "shortcode": shortcode,
            "fetch_tagged_user_count": None,
            "hoisted_comment_id": None,
            "hoisted_reply_id": None
        }
        
        # Headers optimized for Instagram's GraphQL API
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "X-IG-App-ID": cached_tokens["app_id"],
            "X-FB-LSD": "AVpHpGZJ",
            "X-ASBD-ID": "129477",
            "Origin": "https://www.instagram.com",
            "Referer": f"https://www.instagram.com/p/{shortcode}/",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        payload = {
            "doc_id": doc_id,
            "variables": json.dumps(variables)
        }

        # Attempt standard GraphQL fetch
        response = requests.post(api_url, data=payload, headers=headers)
        
        # Fallback to secondary GraphQL endpoint if necessary
        if response.status_code != 200:
            api_url = "https://www.instagram.com/api/v1/ads/graphql/"
            response = requests.post(api_url, data=payload, headers=headers)

        response_json = {}
        if response.status_code == 200:
            response_json = response.json()
        
        # Construct the manual URL for use in Private Mode
        manual_graphql_url = f"https://www.instagram.com/graphql/query/?doc_id={doc_id}&variables={urllib.parse.quote(json.dumps(variables))}"

        return jsonify({
            "shortcode": shortcode,
            "graphql_url": manual_graphql_url,
            "doc_id": doc_id,
            "app_id": cached_tokens["app_id"],
            "data": response_json,
            "status_code": response.status_code
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return "Instagram GraphQL Extractor API is operational."

if __name__ == '__main__':
    # Initial token discovery on startup
    discover_insta_tokens()
    # Run server (default port 5000)
    app.run(debug=True, port=5000)
