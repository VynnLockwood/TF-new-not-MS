from flask import Blueprint, request, jsonify
from imgurpython import ImgurClient
import os
import tempfile
import traceback
from PIL import Image  # For image conversion

# Create a Flask blueprint
imgur_bp = Blueprint('imgur_bp', __name__)

# Imgur API credentials
IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")
IMGUR_CLIENT_SECRET = os.getenv("IMGUR_CLIENT_SECRET")

client = ImgurClient(IMGUR_CLIENT_ID, IMGUR_CLIENT_SECRET)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_png(image_path):
    """Converts any allowed image format to PNG and returns the new file path."""
    png_path = image_path + ".png"
    with Image.open(image_path) as img:
        img = img.convert("RGBA")  # Ensures transparency is handled properly
        img.save(png_path, format="PNG")
    return png_path

@imgur_bp.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']

    # Validate file extension
    if not allowed_file(image_file.filename):
        return jsonify({"error": "Unsupported file format"}), 400

    try:
        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{image_file.filename.rsplit('.', 1)[1].lower()}") as temp_file:
            image_file.save(temp_file.name)
            temp_file_name = temp_file.name

        # Convert the image to PNG
        png_file_name = convert_to_png(temp_file_name)

        # Upload the PNG file to Imgur
        response = client.upload_from_path(png_file_name, config=None, anon=True)

        # Remove the temporary files
        os.unlink(temp_file_name)
        os.unlink(png_file_name)

        return jsonify({"link": response['link']}), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
