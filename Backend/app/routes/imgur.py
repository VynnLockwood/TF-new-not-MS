from flask import Blueprint, request, jsonify
from imgurpython import ImgurClient
import os
import tempfile
import traceback
import time

# Create a Flask blueprint
imgur_bp = Blueprint('imgur_bp', __name__)

# Imgur API credentials
IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")
IMGUR_CLIENT_SECRET = os.getenv("IMGUR_CLIENT_SECRET")

client = ImgurClient(IMGUR_CLIENT_ID, IMGUR_CLIENT_SECRET)

@imgur_bp.route('/upload', methods=['POST'])
def upload_image():
    """Handles image uploads to Imgur"""
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']

    try:
        # Save the file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            image_file.save(temp_file.name)
            temp_file_name = temp_file.name # store the name for later.

        # Upload to Imgur
        response = client.upload_from_path(temp_file_name, config=None, anon=True)

        # Remove the temporary file after upload
        try:
            os.unlink(temp_file_name)
        except PermissionError:
            print("PermissionError encountered. Trying again after a short delay.")
            time.sleep(0.5) # Add a small delay.
            os.unlink(temp_file_name) # Try again after delay.

        # Return the Imgur link
        return jsonify({"link": response['link']}), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
