from flask import Blueprint, redirect, url_for, session, current_app, jsonify, request
from app.models.user import User
from app.utils.redis_utils import store_session_in_redis
from app.utils.redis_utils import redis_client  # Assuming this provides access to Redis
from app import db
import os
import json


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login')
def login():
    oauth = current_app.extensions['oauth']  # Access OAuth from the app context
    google_client = oauth.create_client('google')  # Create the Google client
    redirect_uri = url_for('auth.authorize', _external=True)
    return google_client.authorize_redirect(redirect_uri)

@auth_bp.route('/authorize')
def authorize():
    try:
        oauth = current_app.extensions['oauth']  # Access OAuth from the app context
        google_client = oauth.create_client('google')  # Create the Google client
        token = google_client.authorize_access_token()
        session_id = request.cookies.get('session_id')
        print(f"Session ID received in /auth/check: {session_id}")

        if not token:
            return "Error: Failed to retrieve access token", 400

        response = google_client.get('https://www.googleapis.com/oauth2/v3/userinfo', token=token)

        print("Response status code:", response.status_code)
        print("Response text:", response.text)

        if response.status_code != 200:
            return f"Error: Failed to fetch user info. Status code: {response.status_code}", 400

        user_info = response.json()

        # Process user info (e.g., save to the database)
        user = User.query.filter_by(email=user_info['email']).first()
        if not user:
            user = User(name=user_info['name'], email=user_info['email'], picture=user_info.get('picture', ''))
            db.session.add(user)
            db.session.commit()

        session_data = {'name': user.name, 'email': user.email, 'picture': user.picture}
        store_session_in_redis(user.id, session_data)

        response = redirect('http://localhost:3000/dashboard')
        response.set_cookie(
            'session_id',
            value=f"user:{user.id}",
            max_age=3600,
            httponly=True,
            secure=False,  # Ensure this is False for localhost
            samesite='Lax'
        )

        print(f"Cookie set: session_id=user:{user.id}")


        return response
    except Exception as e:
        print(f"Error in authorization: {e}")
        return f"An error occurred: {str(e)}", 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"message": "Logged out successfully."})

@auth_bp.route('/check', methods=['GET'])
def check_session():
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
