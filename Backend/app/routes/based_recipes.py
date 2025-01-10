import os
import json
from flask import Blueprint, jsonify, request

# Create a Blueprint instance
based_recipes = Blueprint('based_recipes', __name__)

# Path to the JSON file
# Correct the file path to point to the same directory as based_recipes.py
JSON_FILE_PATH = os.path.join(os.path.dirname(__file__), 'thaifood_recipes.json')


# Utility function to load recipes
def load_recipes():
    try:
        print(f"Resolved JSON file path: {JSON_FILE_PATH}")
        with open(JSON_FILE_PATH, 'r', encoding='utf-8-sig') as file:  # Use utf-8-sig
            data = json.load(file)
        return data
    except FileNotFoundError:
        print("File not found. Ensure thaifood_recipes.json is in the same directory as based_recipes.py.")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        raise e


@based_recipes.route('/recipes', methods=['GET'])
def get_all_recipes():
    """Get all recipes."""
    print(f"Resolved JSON file path: {JSON_FILE_PATH}")

    try:
        data = load_recipes()
        if data:
            return jsonify(data['recipes']), 200
        else:
            return jsonify({"error": "Recipes file not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@based_recipes.route('/recipes/<recipe_name>', methods=['GET'])
def get_recipe_by_name(recipe_name):
    """Get a single recipe by name."""
    try:
        data = load_recipes()
        if data:
            recipes = data['recipes']
            # Find the recipe by name
            recipe = next((r for r in recipes if r['recipeName'] == recipe_name), None)
            if recipe:
                return jsonify(recipe), 200
            else:
                return jsonify({"error": f"Recipe '{recipe_name}' not found"}), 404
        else:
            return jsonify({"error": "Recipes file not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
