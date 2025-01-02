from flask import Blueprint, request, jsonify
from app.utils.decorators import validate_session
import requests
import os

youtube_bp = Blueprint('youtube', __name__)

@youtube_bp.route('/search', methods=['POST'])
@validate_session
def youtube_search():
    data = request.get_json()
    keyword = data.get("keyword", "")
    if not keyword:
        return jsonify({"error": "Keyword is required"}), 400

    params = {
        "part": "snippet",
        "q": keyword,
        "type": "video",
        "maxResults": 5,
        "key": os.getenv('YOUTUBE_API_KEY'),
    }

    response = requests.get("https://www.googleapis.com/youtube/v3/search", params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch YouTube data"}), 500

    videos = [{"id": item["id"]["videoId"], "title": item["snippet"]["title"]} for item in response.json().get("items", [])]

    return jsonify({"videos": videos})
