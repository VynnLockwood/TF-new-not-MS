from flask import Blueprint, jsonify, current_app, request
from app.models.models import User, Recipe, db
import traceback
import json

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user_details(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_picture": user.picture,
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error in /users/{user_id}: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route("/users/<int:user_id>/recipes", methods=["GET"])
def get_user_recipes(user_id):
    try:
        # Fetch the user from the database
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch the user's recipes
        user_recipes = user.recipes.all()  # Load all recipes related to the user

        # Build the response
        response = []
        for recipe in user_recipes:
            # Count likes and comments explicitly
            likes_count = recipe.likes.count()  # Count likes
            comments_count = recipe.comments.count()  # Count comments

            response.append({
                "id": recipe.id,
                "name": recipe.name,
                "cover_image": recipe.cover_image,
                "likes": likes_count,
                "comments": comments_count,
                "created_at": recipe.created_at,
            })

        return jsonify(response), 200
    except Exception as e:
        current_app.logger.error(f"Error in /users/{user_id}/recipes: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

from app.utils.redis_utils import redis_client

@user_bp.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.json
        user.name = data.get("name", user.name)
        user.picture = data.get("picture", user.picture)

        db.session.commit()

        # Update session in Redis
        session_key = f"user:{user.id}"
        session_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture,
        }
        redis_client.set(session_key, json.dumps(session_data), ex=3600)  # Set expiry time as needed

        return jsonify(session_data), 200
    except Exception as e:
        print(f"Error updating user: {e}")
        return jsonify({"error": "Internal server error"}), 500

