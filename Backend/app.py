from flask import Flask, redirect, url_for, session, request
from authlib.integrations.flask_client import OAuth
from authlib.integrations.base_client.errors import MismatchingStateError
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
import redis
import os
import random
import string
import requests
import json
from flask_cors import CORS
from functools import wraps
from flask_migrate import Migrate, upgrade


# Create Flask app
app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)  # Allow requests from the React app
# Set a secret key for session management
app.secret_key = os.getenv("FLASK_SECRET_KEY", "your-secret-key")

# Configure session parameters with Redis
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.StrictRedis(host='localhost', port=6379, db=0)
Session(app)

# Configure SQLAlchemy for PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:NolanRobinson@localhost/db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Constants
API_KEY = "AIzaSyA5WINnuzdq4-Oxb2rgEa7tQ_12JRQ5rSA"  # Replace with your actual API key
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
FINE_TUNED_MODEL_ID = "projects/gen-lang-client-0476669633/models/tunedModels/tffinetunemodel-zieqpz0zdi47"  # Replace with your fine-tuned model ID
EXTENDED_PROMPT = "ให้สูตรอาหาร, วิธีกการทำ, ให้บอกโภชนาการทางอาหารที่ได้รับโดยประมาณจากสูตรอาหารนี้ด้วย"

YOUTUBE_API_KEY = "AIzaSyBmSJ6Eq_WM3COnM9NBAQ0eM_AWMFDkOvo"  # Replace with your YouTube Data API key
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

# Initialize OAuth
oauth = OAuth(app)

# Initialize Redis connection (you may need to adjust the host and port depending on your setup)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

def run_migrations():
    with app.app_context():
        upgrade()

def validate_session(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            session_id = request.cookies.get('session_id')
            if not session_id:
                return jsonify({"error": "Session ID is missing"}), 401

            session_data = redis_client.get(session_id)
            if not session_data:
                return jsonify({"error": "Invalid or expired session"}), 401
        except Exception as e:
            return jsonify({"error": f"Session validation failed: {str(e)}"}), 500

        # Proceed to the wrapped function if session is valid
        return f(*args, **kwargs)

    return decorated_function


# Register Google OAuth
google = oauth.register(
    'google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    api_base_url='https://www.googleapis.com/oauth2/v1',
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
    client_kwargs={'scope': 'openid profile email'},
)

# Define User model for the database
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    picture = db.Column(db.String(200), nullable=True)

# Route for initiating OAuth authorization
@app.route('/login')
def login():
    state = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    session['state'] = state
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri, state=state)

@app.route('/authorize')
def authorize():
    try:
        # Get the OAuth token
        token = google.authorize_access_token()
        if not token or 'access_token' not in token:
            return "Error: No access token received.", 400

        # Fetch user info from Google
        user_info = google.get('https://www.googleapis.com/oauth2/v3/userinfo', token=token)
        if user_info.status_code != 200:
            return f"Error: Failed to fetch user info. Status code: {user_info.status_code}", 400

        user_info_data = user_info.json()

        # Add or update user in the database
        add_or_update_user(user_info_data)
        
        # Get the user ID from the database
        user = User.query.filter_by(email=user_info_data['email']).first()
        if not user:
            return "Error: User not found.", 400

        # Store the user session in Redis
        session_key = f"user:{user.id}"
        session_data = {
            'name': user_info_data['name'],
            'email': user_info_data['email'],
            'picture': user_info_data.get('picture', ''),
            'expires_in': token.get('expires_in', 3600),
        }

        # Store the session data in Redis with expiration time
        app.config['SESSION_REDIS'].setex(session_key, token.get('expires_in', 3600), str(session_data))

        # Store session in Flask's session (optional, if you want to keep in both places)
        session['user'] = session_data

        # Set the session cookie in the response
        response = redirect('http://localhost:3000/dashboard')
        response.set_cookie('session_id', session_key, max_age=token.get('expires_in', 3600), httponly=True, secure=True, samesite='Lax')

        return response  # Redirect to the dashboard after setting the cookie

    except MismatchingStateError:
        return "CSRF Error: State mismatch, please try again.", 400
    except Exception as e:
        print(f"Error during authorization: {e}")
        return f"An error occurred: {str(e)}", 500



def add_or_update_user(user_info):
    try:
        user = User.query.filter_by(email=user_info['email']).first()
        if user:
            # Update the user if they already exist
            user.name = user_info['name']
            user.picture = user_info.get('picture', '')
        else:
            # Create a new user if they don't exist
            user = User(
                name=user_info['name'],
                email=user_info['email'],
                picture=user_info.get('picture', ''),
            )
            db.session.add(user)
        
        db.session.commit()

        # Return the user object so we can store the user ID in the session
        return user
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Database error: {e}")

@app.route('/profile')
def profile():
    user = session.get('user')
    if user:
        return f"Welcome, {user['name']}! Your email is {user['email']}."
    else:
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))


from flask import jsonify, make_response

# API route to fetch user session
@app.route('/api/auth/session', methods=['GET'])
def get_user_session():
    """
    Retrieve the current user's session information.
    """
    user = session.get('user')
    if not user:
        return make_response(jsonify({"error": "No active session"}), 404)

    return jsonify({
        "name": user.get("name"),
        "email": user.get("email"),
        "picture": user.get("picture"),
    })

# API route to check session validity
import json

@app.route('/api/auth/check', methods=['GET'])
def check_session():
    try:
        session_data = session.get('user')
        if not session_data:
            return jsonify({'valid': False}), 401

        # Ensure session data is a valid JSON string
        session_data_json = json.dumps(session_data)  # Convert the session data to a valid JSON string
        
        return jsonify({'valid': True, 'user': json.loads(session_data_json)}), 200
    except Exception as e:
        print(f"Error during session check: {e}")
        return jsonify({'valid': False, 'error': 'Server error'}), 500



# API route to logout and clear session
@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    """
    Log out the user and clear their session.
    """
    session.pop('user', None)
    return jsonify({"message": "Logged out successfully."})


@app.route('/generate', methods=['POST'])
@validate_session
def generate_content():
    try:
        # Parse the request body
        data = request.get_json()
        if not data or "contents" not in data or not data["contents"]:
            return jsonify({"error": "Prompt is required"}), 400

        prompt = data["contents"][0]["parts"][0]["text"]
        full_prompt = prompt + EXTENDED_PROMPT

        # Create the request payload for the Gemini API
        payload = {
            "model": FINE_TUNED_MODEL_ID,
            "contents": [
                {
                    "parts": [{"text": full_prompt}]
                }
            ]
        }

        # Make the request to the Gemini API
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{GEMINI_API_URL}?key={API_KEY}",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            return jsonify({"error": f"Gemini API error: {response.text}"}), 500

        # Extract the generated content
        response_data = response.json()
        if "candidates" in response_data and response_data["candidates"]:
            generated_content = response_data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({"response": generated_content}), 200
        else:
            return jsonify({"error": "No content generated"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def call_gemini_api(request_payload):
    headers = {"Content-Type": "application/json"}
    url = f"{GEMINI_API_URL}?key={API_KEY}"

    response = requests.post(url, headers=headers, data=json.dumps(request_payload))

    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.text}")

    # Parse response
    response_json = response.json()
    if "candidates" in response_json and response_json["candidates"]:
        return response_json["candidates"][0]["content"]["parts"][0]["text"]

    raise Exception("No candidates returned from Gemini API")

@app.route("/youtube", methods=["POST"])
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
        "maxResults": 5,  # Adjust the number of results as needed
        "key": YOUTUBE_API_KEY,
    }

    response = requests.get(YOUTUBE_SEARCH_URL, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch YouTube data"}), 500

    youtube_data = response.json()
    videos = [
        {"id": item["id"]["videoId"], "title": item["snippet"]["title"]}
        for item in youtube_data.get("items", [])
    ]

    return jsonify({"videos": videos})



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)

