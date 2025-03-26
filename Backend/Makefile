.PHONY: up down logs migrate start stop gcloud-build gcloud-push gcloud-deploy-backend gcloud-deploy-frontend

PROJECT_ID := thaifoodapp
REGION := asia-southeast1
BACKEND_IMAGE_NAME := asia-southeast1-docker.pkg.dev/$(PROJECT_ID)/thaifood-backend:latest
FRONTEND_IMAGE_NAME := asia-southeast1-docker.pkg.dev/$(PROJECT_ID)/thaifood-frontend:latest
BACKEND_SERVICE_NAME := thaifood-backend-service
FRONTEND_SERVICE_NAME := thaifood-frontend-service

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec backend flask db upgrade

start: up migrate
	docker compose up -d

stop: down
