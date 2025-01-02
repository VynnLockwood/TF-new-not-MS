from app import redis_client
import json

def store_session_in_redis(user_id, session_data, ttl=3600):
    session_key = f"user:{user_id}"
    redis_client.setex(session_key, ttl, json.dumps(session_data))

def get_session_from_redis(session_id):
    data = redis_client.get(session_id)
    if data:
        return json.loads(data)
    return None
