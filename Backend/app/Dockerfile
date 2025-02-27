FROM python:3.9-slim

# Update package lists and install netcat (nc) for checking database readiness
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application code, including migrations and entrypoint script
COPY . .

# Add a custom entrypoint script to run migrations and start the app
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the entrypoint to the script
ENTRYPOINT ["/entrypoint.sh"]

# Command to start the Flask application (can be overridden if needed)
CMD ["flask", "run", "--host=0.0.0.0"]