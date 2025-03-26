

# Use an official Python runtime as the base image
FROM python:3.9-slim

# Update package lists and install netcat (nc) and dependencies for Pillow
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code, including migrations and entrypoint script
COPY . .

# Add a custom entrypoint script to run migrations and start the app
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the port the app runs on
EXPOSE 5000

# Set the entrypoint to the script
ENTRYPOINT ["/entrypoint.sh"]

# Command to start the Flask application (matches entrypoint.sh for clarity)
CMD ["python3", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000", "--reload"]