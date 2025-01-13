from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import traceback
import json
from app.models.models import Recipe, Like, Rating, Comment, Favorite, db, RelatedVideo
from app.models.user import User  # Adjust the path if needed
import random

recipe_bp = Blueprint("recipe_bp", __name__)

@recipe_bp.route("/recipes/submit", methods=["POST"])
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

        session_data = json.loads(current_app.extensions["redis_client"].get(session_id))
        user_email = session_data.get("email")
        if not user_email:
            return jsonify({"error": "User not authenticated"}), 401

        # Find user in the database
        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get recipe details from the request
        data = request.json
        required_fields = ["name", "ingredients", "instructions", "videos"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": "Missing required fields", "fields": missing_fields}), 400

        # Convert ingredients and instructions to plain text
        ingredients = "\n".join(data["ingredients"]) if isinstance(data["ingredients"], list) else data["ingredients"]
        instructions = "\n".join(data["instructions"]) if isinstance(data["instructions"], list) else data["instructions"]

        # Sanitize and handle category and tags
        category = data.get("category", "").strip()  # Use default empty string if not provided
        tags = data.get("tags", [])  # Default to an empty list if not provided
        if isinstance(tags, list):
            # Convert tags to a comma-separated string for storage
            tags = ",".join([tag.strip() for tag in tags])

        # Create and store the recipe
        recipe = Recipe(
            name=data["name"],
            cover_image=data.get("cover_image", ""),
            ingredients=ingredients,  # Store as plain text
            instructions=instructions,  # Store as plain text
            category=category,  # Store the category
            tags=tags,  # Store the tags as a string
            created_by=user.id,
            created_at=datetime.utcnow(),
        )
        db.session.add(recipe)
        db.session.flush()  # Flush to get the recipe ID

        # Add related videos
        for video in data["videos"]:
            related_video = RelatedVideo(
                recipe_id=recipe.id,
                title=video["title"],
                url=video["url"],
            )
            db.session.add(related_video)

        # Commit the transaction
        db.session.commit()

        current_app.logger.info(f"Recipe and videos successfully saved: {recipe}")
        return jsonify({"message": "Recipe submitted successfully", "recipe_id": recipe.id}), 201
    except Exception as e:
        current_app.logger.error(f"Error in /submit: {e}")
        current_app.logger.error(traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500




@recipe_bp.route("/<recipe_id>/like", methods=["POST"])
def toggle_like_recipe(recipe_id):
    try:
        current_app.logger.info(f"Incoming request to /{recipe_id}/like")

        session_id = request.cookies.get("session_id")
        if not session_id:
            return jsonify({"error": "Invalid or missing session_id cookie"}), 401

        session_data = json.loads(current_app.extensions["redis_client"].get(session_id))
        user_email = session_data.get("email")
        if not user_email:
            return jsonify({"error": "User not authenticated"}), 401

        # Fetch the user from the database using the email
        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if the recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Check if the user already liked the recipe
        existing_like = Like.query.filter_by(recipe_id=recipe_id, user_id=user.id).first()

        if existing_like:
            # If the like exists, remove it (unlike)
            db.session.delete(existing_like)
            db.session.commit()

            # Query the updated like count
            likes_count = Like.query.filter_by(recipe_id=recipe_id).count()

            return jsonify({"message": "Recipe unliked successfully", "likes": likes_count}), 200
        else:
            # If the like does not exist, add it
            like = Like(
                recipe_id=recipe_id,
                user_id=user.id,  # Use the user's numeric ID
                created_at=datetime.utcnow(),
            )
            db.session.add(like)
            db.session.commit()

            # Query the updated like count
            likes_count = Like.query.filter_by(recipe_id=recipe_id).count()

            return jsonify({"message": "Recipe liked successfully", "likes": likes_count}), 200
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

        # Fetch the user from the database using the email
        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        comment_text = data.get("comment")
        if not comment_text:
            return jsonify({"error": "Comment text is required"}), 400

        # Check if the recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Add a comment
        comment = Comment(
            recipe_id=recipe_id,
            user_id=user.id,  # Use the user's numeric ID
            content=comment_text,
            created_at=datetime.utcnow(),
        )
        db.session.add(comment)
        db.session.commit()

        return jsonify({"message": "Comment added successfully"}), 201
    except Exception as e:
        current_app.logger.error(f"Error in /{recipe_id}/comment: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500



@recipe_bp.route("/recipes", methods=["GET"])
def get_recipes():
    """
    Fetch all recipes or filter by tag and/or category.
    """
    try:
        def decode_or_split(data):
            if not data:  # If data is None or empty
                return []  # Return an empty list for None or empty values
            try:
                # Attempt to decode as JSON
                return json.loads(data)
            except json.JSONDecodeError:
                # If not JSON, treat it as plain text and split by commas
                return [tag.strip() for tag in data.split(",") if tag.strip()]

        # Get optional query parameters
        tag = request.args.get("tag")
        category = request.args.get("category")

        # Build query based on filters
        query = Recipe.query
        if category:
            query = query.filter(Recipe.category.ilike(f"%{category}%"))  # Case-insensitive match
        if tag:
            query = query.filter(Recipe.tags.contains(tag))  # Assuming `tags` is a JSON or text column

        # Fetch filtered recipes
        recipes = query.all()

        response = [
            {
                "id": recipe.id,
                "name": recipe.name,
                "cover_image": recipe.cover_image,
                "ingredients": decode_or_split(recipe.ingredients),  # Decode or split
                "instructions": decode_or_split(recipe.instructions),  # Decode or split
                "category": recipe.category or "Uncategorized",  # Default to 'Uncategorized' if None
                "tags": decode_or_split(recipe.tags) or ["No Tags"],  # Default to ['No Tags'] if None
                "created_by": recipe.created_by,
                "created_at": recipe.created_at,
                "creator_name": recipe.user.name if recipe.user else "Anonymous",  # Fetch creator's name
            }
            for recipe in recipes
        ]

        return jsonify({"recipes": response, "tags": list(set(tag for recipe in recipes for tag in decode_or_split(recipe.tags))), "categories": list(set(recipe.category or "Uncategorized" for recipe in recipes))}), 200
    except Exception as e:
        current_app.logger.error(f"Error in /recipes: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@recipe_bp.route("/recipes/<int:recipe_id>", methods=["GET"])
def get_recipe_by_id(recipe_id):
    """
    Fetch a specific recipe by its ID along with related videos, likes, comments, ratings, tags, and category.
    """
    try:
        def decode_or_split(data):
            try:
                # Attempt to decode as JSON
                return json.loads(data)
            except json.JSONDecodeError:
                # If not JSON, treat it as plain text and split by newline
                return data.split("\n")

        # Fetch the recipe from the database
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Fetch related videos
        related_videos = [
            {"title": video.title, "url": video.url}
            for video in recipe.related_videos
        ]

        # Fetch likes count
        likes_count = recipe.likes.count()

        # Fetch comments with user details
        comments = [
            {
                "id": comment.id,
                "user": {
                    "name": comment.user.name,
                    "profile_picture": comment.user.picture,  # Updated to use `picture`
                },
                "content": comment.content,
                "created_at": comment.created_at,
            }
            for comment in recipe.comments
        ]

        # Fetch ratings
        ratings = [rating.score for rating in recipe.ratings]
        average_rating = sum(ratings) / len(ratings) if ratings else 0

        # Decode or split tags
        tags = decode_or_split(recipe.tags) if recipe.tags else []

        # Prepare the response
        response = {
            "id": recipe.id,
            "name": recipe.name,
            "cover_image": recipe.cover_image,
            "ingredients": decode_or_split(recipe.ingredients),  # Decode or split
            "instructions": decode_or_split(recipe.instructions),  # Decode or split
            "created_by": recipe.created_by,
            "created_by_name": recipe.user.name if recipe.user else "Anonymous",  # Assuming a relationship exists
            "created_at": recipe.created_at,
            "category": recipe.category or "Uncategorized",  # Add category field
            "tags": tags,  # Add tags field
            "related_videos": related_videos,
            "likes": likes_count,
            "comments": comments,
            "average_rating": round(average_rating, 2),
        }

        return jsonify(response), 200
    except Exception as e:
        current_app.logger.error(f"Error in /recipes/{recipe_id}: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500



@recipe_bp.route("/recipes/<int:recipe_id>/related_videos", methods=["GET"])
def get_related_videos(recipe_id):
    """
    Fetch related videos for a specific recipe.
    """
    try:
        # Check if the recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Fetch related videos
        related_videos = [
            {"title": video.title, "url": video.url}
            for video in recipe.related_videos
        ]

        return jsonify({"related_videos": related_videos}), 200
    except Exception as e:
        current_app.logger.error(f"Error in /recipes/{recipe_id}/related_videos: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@recipe_bp.route("/recipes/<int:recipe_id>/suggested_recipes", methods=["GET"])
def get_suggested_recipes(recipe_id):
    """
    Fetch suggested recipes based on the current recipe's attributes (e.g., ingredients, category, popularity),
    with a fallback to random recipes if no similar recipes are found.
    """
    try:
        # Fetch the current recipe
        current_recipe = Recipe.query.get(recipe_id)
        if not current_recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Decode the ingredients for matching
        current_ingredients = set(current_recipe.ingredients.split("\n"))
        current_cuisine = getattr(current_recipe, "cuisine", None)
        current_taste_profile = getattr(current_recipe, "taste_profile", None)

        # Find other recipes
        other_recipes = Recipe.query.filter(Recipe.id != recipe_id).all()

        # Calculate similarity and filter suggestions
        suggestions = []
        for recipe in other_recipes:
            recipe_ingredients = set(recipe.ingredients.split("\n"))
            ingredient_overlap = len(current_ingredients.intersection(recipe_ingredients))

            # Check cuisine match
            cuisine_match = 1 if current_cuisine and recipe.cuisine == current_cuisine else 0

            # Check taste profile match
            taste_profile_match = 1 if current_taste_profile and recipe.taste_profile == current_taste_profile else 0

            # Calculate popularity score
            likes_count = recipe.likes.count()  # Count likes
            ratings_sum = sum(rating.score for rating in recipe.ratings)  # Sum of rating scores
            ratings_count = recipe.ratings.count()  # Count of ratings
            popularity_score = likes_count + (ratings_sum / ratings_count if ratings_count > 0 else 0)

            # Only suggest recipes with some overlap or matching attributes
            if ingredient_overlap > 0 or cuisine_match or taste_profile_match:
                suggestions.append({
                    "id": recipe.id,
                    "name": recipe.name,
                    "cover_image": recipe.cover_image,
                    "creator_name": recipe.user.name if recipe.user else "Anonymous",
                    "ingredient_overlap": ingredient_overlap,
                    "cuisine_match": cuisine_match,
                    "taste_profile_match": taste_profile_match,
                    "popularity_score": popularity_score,
                    "total_score": ingredient_overlap + cuisine_match * 2 + taste_profile_match * 2 + popularity_score,
                })

        # Sort suggestions by total score
        sorted_suggestions = sorted(suggestions, key=lambda x: x["total_score"], reverse=True)

        # Fallback: Random recipes if no suggestions are found
        if not sorted_suggestions:
            random_recipes = random.sample(other_recipes, min(len(other_recipes), 5))  # Randomly select up to 5 recipes
            sorted_suggestions = [
                {
                    "id": recipe.id,
                    "name": recipe.name,
                    "cover_image": recipe.cover_image,
                    "creator_name": recipe.user.name if recipe.user else "Anonymous",
                    "ingredient_overlap": 0,
                    "cuisine_match": 0,
                    "taste_profile_match": 0,
                    "popularity_score": 0,
                    "total_score": 0,
                }
                for recipe in random_recipes
            ]

        # Return top 5 suggestions or random fallback
        return jsonify({"suggested_recipes": sorted_suggestions[:5]}), 200
    except Exception as e:
        current_app.logger.error(f"Error in /recipes/{recipe_id}/suggested_recipes: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

@recipe_bp.route("/recipes/search", methods=["GET"])
def search_recipes():
    """
    Search for recipes by query.
    """
    try:
        # Retrieve the search query from the request
        query = request.args.get("query", "").strip().lower()

        if not query:
            return jsonify({"error": "Search query is required"}), 400

        # Perform the search (use ilike for case-insensitive partial matching)
        recipes_query = Recipe.query.filter(Recipe.name.ilike(f"%{query}%"))
        recipes = recipes_query.all()  # Resolve the query into a list

        if not recipes:
            return jsonify([]), 200  # Return an empty list if no recipes are found

        # Helper function to safely parse JSON or return default
        def safe_json_load(data, default):
            if not data or not isinstance(data, str):
                return default
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return default

        # Format the response
        response = []
        for recipe in recipes:
            # Resolve dynamic relationships like ratings, likes, comments, and favorites
            resolved_likes = recipe.likes.count()
            resolved_comments = recipe.comments.count()
            resolved_ratings = recipe.ratings.all()
            resolved_favorites = recipe.favorites.count()

            # Calculate average rating if ratings are available
            average_rating = (
                sum(rating.value for rating in resolved_ratings) / len(resolved_ratings)
                if resolved_ratings else 0
            )

            # Append the recipe details
            response.append({
                "id": recipe.id,
                "name": recipe.name,
                "cover_image": recipe.cover_image,
                "ingredients": safe_json_load(recipe.ingredients, []),  # Safely parse JSON
                "instructions": safe_json_load(recipe.instructions, []),  # Safely parse JSON
                "category": recipe.category,
                "tags": safe_json_load(recipe.tags, []),  # Safely parse JSON
                "likes": resolved_likes,
                "comments": resolved_comments,
                "average_rating": average_rating,
                "favorites": resolved_favorites,
            })

        return jsonify(response), 200

    except Exception as e:
        current_app.logger.error(f"Error in search_recipes: {e}")
        return jsonify({"error": "Internal server error"}), 500
