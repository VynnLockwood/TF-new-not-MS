#!/bin/bash

# Wait for the database to be ready (optional, if using a separate DB container)
until nc -z localhost 5432; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 1
done

# Run database migrations
flask db migrate
flask db upgrade

# Start the Flask application
exec flask run --host=0.0.0.0