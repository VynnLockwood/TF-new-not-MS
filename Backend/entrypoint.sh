#!/bin/bash

# Wait for the PostgreSQL container to be ready
until nc -z postgres-container 5432; do
    echo "Waiting for PostgreSQL at postgres-container:5432 to be ready..."
    sleep 1
done

# Run database migrations
flask db migrate
flask db upgrade

# Start the Flask application
exec flask run --host=0.0.0.0