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



# Create Flask app
app = Flask(__name__)
CORS(app, origins="http://localhost:3000", supports_credentials=True)  # Allow requests from the React app
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

# Initialize OAuth
oauth = OAuth(app)

# Initialize Redis connection (you may need to adjust the host and port depending on your setup)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)


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


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
