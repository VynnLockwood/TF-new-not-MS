from flask import Blueprint, request, jsonify
from app.utils.decorators import validate_session
import requests
import os

gemini_bp = Blueprint('gemini', __name__)

@gemini_bp.route('/generate', methods=['POST', 'OPTIONS'])
@validate_session
def generate_content():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({"message": "CORS preflight passed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    # Actual POST logic
    try:
        data = request.get_json()
        print("Payload received in /gemini/generate:", data)  # Debug payload

        # Extract the prompt
        prompt = data.get("contents", [{}])[0].get("parts", [{}])[0].get("text", "")
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        print("Extracted prompt:", prompt)  # Debug extracted prompt

        # Generate full prompt
        full_prompt = f"{prompt} ให้สูตรอาหาร, วิธีการทำ, โภชนาการทางอาหารที่ได้รับโดยประมาณ"
        payload = {
            "model": os.getenv('FINE_TUNED_MODEL_ID'),
            "contents": [{"parts": [{"text": full_prompt}]}]
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={os.getenv('API_KEY')}",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            print("Gemini API error:", response.text)  # Debug API response
            return jsonify({"error": "Gemini API error"}), 500

        content = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return jsonify({"response": content})
    except Exception as e:
        print(f"Error in /gemini/generate: {e}")  # Debugging
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
