from flask import Flask
from flask_session import Session
from flask_cors import CORS
from dotenv import load_dotenv
from app.extensions import db, oauth, redis_client  # Import initialized extensions
from flask_migrate import Migrate
import os


# Load environment variables
load_dotenv()

# Initialize Flask-Migrate
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Configure CORS
    CORS(
        app,
        origins=["*"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "OPTIONS", "PUT"]
    )

    # Load configurations
    app.config.from_object('config.Config')

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)  # Bind Flask-Migrate to the app and SQLAlchemy instance
    Session(app)
    oauth.init_app(app)  # Bind OAuth to the app

    # Register Redis client in app extensions
    app.extensions["redis_client"] = redis_client

    # Explicitly add OAuth to app.extensions for debugging
    app.extensions["oauth"] = oauth
    app.logger.info("OAuth initialized")

    # Register OAuth provider
    oauth.register(
        "google",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        authorize_url="https://accounts.google.com/o/oauth2/auth",
        access_token_url="https://accounts.google.com/o/oauth2/token",
        api_base_url="https://www.googleapis.com/oauth2/v1",
        jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
        client_kwargs={"scope": "openid profile email"},
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")

    from app.routes.aiapi import gemini_bp
    app.register_blueprint(gemini_bp, url_prefix="/gemini")

    from app.routes.youtube import youtube_bp
    app.register_blueprint(youtube_bp, url_prefix="/youtube")

    from app.routes.based_recipes import based_recipes
    app.register_blueprint(based_recipes, url_prefix="/based")

    from app.routes.imgur import imgur_bp
    app.register_blueprint(imgur_bp, url_prefix="/api/imgur")

    from app.routes.recipe import recipe_bp  # Import the recipe blueprint
    app.register_blueprint(recipe_bp, url_prefix="/api")

    from app.routes.users import user_bp  # Import the recipe blueprint
    app.register_blueprint(user_bp, url_prefix="/api")

    return app
