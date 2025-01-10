from flask import Flask
from flask_session import Session
from flask_cors import CORS
from dotenv import load_dotenv
from app.extensions import db, oauth, redis_client  # Import initialized extensions
import os

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configure CORS
    CORS(
        app,
        origins=["http://localhost:3000"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "OPTIONS"]
    )

    # Load configurations
    app.config.from_object('config.Config')

    # Initialize extensions
    db.init_app(app)
    Session(app)
    oauth.init_app(app)  # Bind OAuth to the app

    # Explicitly add OAuth to app.extensions for debugging
    app.extensions['oauth'] = oauth
    print("OAuth initialized:", app.extensions.get('oauth'))

    # Register OAuth provider
    oauth.register(
        'google',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        authorize_url='https://accounts.google.com/o/oauth2/auth',
        access_token_url='https://accounts.google.com/o/oauth2/token',
        api_base_url='https://www.googleapis.com/oauth2/v1',
        jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
        client_kwargs={'scope': 'openid profile email'},
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.routes.gemini import gemini_bp
    app.register_blueprint(gemini_bp, url_prefix='/gemini')

    from app.routes.youtube import youtube_bp
    app.register_blueprint(youtube_bp, url_prefix='/youtube')

    from app.routes.based_recipes import based_recipes
    app.register_blueprint(based_recipes, url_prefix='/based')

    return app
