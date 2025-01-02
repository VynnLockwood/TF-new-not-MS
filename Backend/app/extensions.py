from flask_sqlalchemy import SQLAlchemy
from authlib.integrations.flask_client import OAuth
import redis
import os

# Initialize extensions
db = SQLAlchemy()
oauth = OAuth()  # Initialize OAuth here
redis_client = redis.StrictRedis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0))
)
