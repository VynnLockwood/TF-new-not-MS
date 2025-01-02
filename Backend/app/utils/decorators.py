from functools import wraps
from flask import request, jsonify
from app.extensions import redis_client

def validate_session(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify({"message": "CORS preflight passed"}), 200

        try:
            session_id = request.cookies.get('session_id')
            print(f"Session ID from cookies: {session_id}")

            if not session_id:
                print("Error: Session ID missing in cookies")
                return jsonify({"error": "Session ID is missing"}), 401

            session_data = redis_client.get(session_id)
            print(f"Session data from Redis: {session_data}")

            if not session_data:
                print("Error: Session not found in Redis or expired")
                return jsonify({"error": "Invalid or expired session"}), 401

        except Exception as e:
            print(f"Exception in session validation: {e}")
            return jsonify({"error": f"Session validation failed: {str(e)}"}), 500

        return f(*args, **kwargs)
    return decorated_function

