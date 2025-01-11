from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import traceback
import json
from app.models.models import Recipe, Like, Rating, Comment, Favorite, db
from app.models.user import User  # Adjust the path if needed


recipe_bp = Blueprint("recipe_bp", __name__)

@recipe_bp.route("/submit", methods=["POST"])
def submit_recipe():
    try:
        # Log incoming request data
        current_app.logger.info("Incoming request to /submit")
        current_app.logger.info(f"Request JSON: {request.json}")

        # Fetch user data from the session
        session_id = request.cookies.get("session_id")
        if not session_id:
            current_app.logger.error("Missing session_id cookie")
            return jsonify({"error": "Invalid or missing session_id cookie"}), 401

        # Retrieve session data from Redis
        session_data = current_app.extensions["redis_client"].get(session_id)
        if not session_data:
            current_app.logger.error("Session not found or expired")
            return jsonify({"error": "Session not found or expired"}), 401

        # Decode session data (Redis client now returns a string, no need to decode)
        session_data = json.loads(session_data)
        user_email = session_data.get("email")  # Assuming user email is the identifier

        if not user_email:
            current_app.logger.error("User email not found in session")
            return jsonify({"error": "User email not found in session"}), 401

        # Get user ID from the database
        user = db.session.query(User).filter_by(email=user_email).first()
        if not user:
            current_app.logger.error("User not found in the database")
            return jsonify({"error": "User not found"}), 404

        # Access the incoming JSON data
        data = request.json
        required_fields = ["name", "ingredients", "instructions"]
        missing_fields = [key for key in required_fields if key not in data]
        if missing_fields:
            current_app.logger.error(f"Missing required fields: {missing_fields}")
            return jsonify({
                "error": "Missing required fields",
                "missing_fields": missing_fields,
                "received_data": data
            }), 400

        # Create the recipe object
        recipe = Recipe(
            name=data["name"],
            cover_image=data.get("cover_image", ""),
            ingredients=json.dumps(data["ingredients"]),  # Convert to JSON string
            instructions=json.dumps(data["instructions"]),  # Convert to JSON string
            created_by=user.id,  # Use the user ID from the database
            created_at=datetime.utcnow(),
        )

        # Add the recipe to the database
        db.session.add(recipe)
        db.session.commit()

        # Log success and return response
        current_app.logger.info(f"Recipe successfully saved: {recipe}")
        return jsonify({"message": "Recipe submitted successfully", "recipe_id": recipe.id}), 201
    except Exception as e:
        current_app.logger.error(f"Error in /submit: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500



@recipe_bp.route("/<recipe_id>/like", methods=["POST"])
def like_recipe(recipe_id):
    try:
        current_app.logger.info(f"Incoming request to /{recipe_id}/like")

        session_id = request.cookies.get("session_id")
        if not session_id:
            return jsonify({"error": "Invalid or missing session_id cookie"}), 401

        session_data = json.loads(current_app.extensions["redis_client"].get(session_id))
        user_email = session_data.get("email")
        if not user_email:
            return jsonify({"error": "User not authenticated"}), 401

        # Check if the recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Check if the user already liked the recipe
        existing_like = Like.query.filter_by(recipe_id=recipe_id, user_id=user_email).first()
        if existing_like:
            return jsonify({"error": "User already liked this recipe"}), 400

        # Add a like
        like = Like(recipe_id=recipe_id, user_id=user_email)
        db.session.add(like)
        db.session.commit()

        return jsonify({"message": "Recipe liked successfully", "likes": len(recipe.likes)}), 200
    except Exception as e:
        current_app.logger.error(f"Error in /{recipe_id}/like: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@recipe_bp.route("/<recipe_id>/rate", methods=["POST"])
def rate_recipe(recipe_id):
    try:
        current_app.logger.info(f"Incoming request to /{recipe_id}/rate")
        data = request.json

        session_id = request.cookies.get("session_id")
        if not session_id:
            return jsonify({"error": "Invalid or missing session_id cookie"}), 401

        session_data = json.loads(current_app.extensions["redis_client"].get(session_id))
        user_email = session_data.get("email")
        if not user_email:
            return jsonify({"error": "User not authenticated"}), 401

        rating_score = data.get("rating")
        if not rating_score or not (1 <= rating_score <= 5):
            return jsonify({"error": "Invalid rating value"}), 400

        # Check if the recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Update or add the user's rating
        existing_rating = Rating.query.filter_by(recipe_id=recipe_id, user_id=user_email).first()
        if existing_rating:
            existing_rating.score = rating_score
        else:
            new_rating = Rating(recipe_id=recipe_id, user_id=user_email, score=rating_score)
            db.session.add(new_rating)

        db.session.commit()

        # Calculate the new average rating
        avg_rating = db.session.query(db.func.avg(Rating.score)).filter_by(recipe_id=recipe_id).scalar()

        return jsonify({"message": "Recipe rated successfully", "average_rating": avg_rating}), 200
    except Exception as e:
        current_app.logger.error(f"Error in /{recipe_id}/rate: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@recipe_bp.route("/<recipe_id>/comment", methods=["POST"])
def comment_recipe(recipe_id):
    try:
        current_app.logger.info(f"Incoming request to /{recipe_id}/comment")
        data = request.json

        session_id = request.cookies.get("session_id")
        if not session_id:
            return jsonify({"error": "Invalid or missing session_id cookie"}), 401

        session_data = json.loads(current_app.extensions["redis_client"].get(session_id))
        user_email = session_data.get("email")
        if not user_email:
            return jsonify({"error": "User not authenticated"}), 401

        comment_text = data.get("comment")
        if not comment_text:
            return jsonify({"error": "Comment text is required"}), 400

        # Check if the recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Add a comment
        comment = Comment(recipe_id=recipe_id, user_id=user_email, content=comment_text)
        db.session.add(comment)
        db.session.commit()

        return jsonify({"message": "Comment added successfully"}), 201
    except Exception as e:
        current_app.logger.error(f"Error in /{recipe_id}/comment: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@recipe_bp.route("/recipes", methods=["GET"])
def get_recipes():
    try:
        recipes = Recipe.query.all()
        response = [
            {
                "id": recipe.id,
                "name": recipe.name,
                "cover_image": recipe.cover_image,
                "ingredients": json.loads(recipe.ingredients),
                "instructions": json.loads(recipe.instructions),
                "created_by": recipe.created_by,
                "created_at": recipe.created_at,
            }
            for recipe in recipes
        ]
        return jsonify(response), 200
    except Exception as e:
        current_app.logger.error(f"Error in /recipes: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500
