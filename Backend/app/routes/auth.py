from flask import Blueprint, redirect, url_for, session, current_app, jsonify, request
from app.models.user import User
from app.utils.redis_utils import store_session_in_redis, redis_client
from app import db
import os
import json

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login')
def login():
    """Handle user login via Google OAuth."""
    oauth = current_app.extensions['oauth']  # Access OAuth from the app context
    google_client = oauth.create_client('google')  # Create the Google client
    redirect_uri = url_for('auth.authorize', _external=True, _scheme='https')
    #redirect_uri = url_for('auth.authorize', _external=True)
    return google_client.authorize_redirect(redirect_uri)

@auth_bp.route('/authorize')
def authorize():
    """Handle Google OAuth authorization."""
    try:
        print("Starting authorization process...")

        oauth = current_app.extensions['oauth']
        google_client = oauth.create_client('google')

        token = google_client.authorize_access_token()
        print(f"Token received: {token}")

        if not token:
            print("Error: Failed to retrieve access token")
            return "Error: Failed to retrieve access token", 400

        response = google_client.get('https://www.googleapis.com/oauth2/v3/userinfo', token=token)
        print(f"Google API response status: {response.status_code}")

        if response.status_code != 200:
            print(f"Error: Failed to fetch user info. Status code: {response.status_code}")
            return f"Error: Failed to fetch user info. Status code: {response.status_code}", 400

        user_info = response.json()
        print(f"User info received: {user_info}")

        # Process user info (e.g., save to the database)
        user = User.query.filter_by(email=user_info['email']).first()
        if not user:
            print("New user detected, creating user...")
            user = User(
                name=user_info['name'],
                email=user_info['email'],
                picture=user_info.get('picture', '')
            )
            db.session.add(user)
            db.session.commit()
        else:
            print("User already exists in the database.")

        # Create session data and store it in Redis
        session_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'picture': user.picture
        }
        session_id = f"user:{user.id}"  # Use user ID as part of the Redis key

        redis_client.set(session_id, json.dumps(session_data), ex=3600)  # Expire in 1 hour
        print(f"Session stored in Redis: {session_id} -> {session_data}")

        # Set session cookie
        #response = redirect('https://thaifood-xi.vercel.app/dashboard')
        response = redirect('https://ab27-202-12-97-159.ngrok-free.app//dashboard')
        response.set_cookie(
            'session_id',
            value=session_id,
            max_age=3600,
            httponly=True,
            secure=True,  # Secure should be True in production with HTTPS
            samesite='None'
        )
        print(f"Session cookie set: {session_id}")

        return response
    except Exception as e:
        print(f"Error in authorization: {e}")
        return f"An error occurred: {str(e)}", 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Handle user logout."""
    try:
        # Extract session_id from cookies
        session_id = request.cookies.get('session_id')
        if session_id:
            # Delete session data from Redis
            redis_client.delete(session_id)

        # Clear session cookie
        response = jsonify({"message": "Logged out successfully."})
        response.set_cookie('session_id', '', max_age=0, httponly=True, secure=False, samesite='Lax')
        return response
    except Exception as e:
        print(f"Error during logout: {e}")
        return jsonify({"error": "Failed to logout."}), 500

@auth_bp.route('/check', methods=['GET'])
def check_session():
    """Check if the user session is valid."""
    try:
        # Extract the session cookie from the request
        session_id = request.cookies.get('session_id')
        if not session_id:
            return jsonify({'valid': False, 'error': 'Missing session ID'}), 401

        # Fetch the session data from Redis
        session_data = redis_client.get(session_id)
        if not session_data:
            return jsonify({'valid': False, 'error': 'Invalid or expired session'}), 401

        # Decode session data (assuming it was stored as JSON)
        session_data = json.loads(session_data.decode('utf-8'))

        # Return the session data
        return jsonify({'valid': True, 'user': session_data}), 200
    except Exception as e:
        print(f"Error during session check: {e}")
        return jsonify({'valid': False, 'error': 'Server error'}), 500
