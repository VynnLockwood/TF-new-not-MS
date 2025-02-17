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

gcloud-build:
	docker compose build backend
	docker compose build frontend

gcloud-push: gcloud-build
	docker tag backend-backend $(BACKEND_IMAGE_NAME)
	docker push $(BACKEND_IMAGE_NAME)
	docker tag frontend-container $(FRONTEND_IMAGE_NAME)
	docker push $(FRONTEND_IMAGE_NAME)

gcloud-deploy-backend: gcloud-push
	gcloud run deploy $(BACKEND_SERVICE_NAME) \
		--image $(BACKEND_IMAGE_NAME) \
		--region $(REGION) \
		--platform managed \
		--port 5000 \
		--set-env-vars FLASK_SECRET_KEY=25BC196631D5BABC8AFEFAAB8BEAD,GOOGLE_CLIENT_ID=915940246324-ngdnehtq3unlscmnog7uq0qua8g67bcd.apps.googleusercontent.com,GOOGLE_CLIENT_SECRET=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,DATABASE_URL=postgresql://postgres:postgres@postgres/db,REDIS_HOST=redis,REDIS_PORT=6379 \
		--allow-unauthenticated

gcloud-deploy-frontend: gcloud-push
	gcloud run deploy $(FRONTEND_SERVICE_NAME) \
		--image $(FRONTEND_IMAGE_NAME) \
		--region $(REGION) \
		--platform managed \
		--port 3000 \
		--set-env-vars GOOGLE_CLIENT_ID=915940246324-ngdnehtq3unlscmnog7uq0qua8g67bcd.apps.googleusercontent.com,GOOGLE_CLIENT_SECRET=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,NEXT_PUBLIC_API_URL=http://$(BACKEND_SERVICE_NAME)-default.$(REGION).run.app:5000,FLASK_GOOGLE_URL=http://$(BACKEND_SERVICE_NAME)-default.$(REGION).run.app:5000,NEXT_PUBLIC_BACK_END_URL=http://$(BACKEND_SERVICE_NAME)-default.$(REGION).run.app:5000,IMGUR_CLIENT_ID=de5cd6c5436730a,IMGUR_CLIENT_SECRET=a8e22188bc5c878a046327aaeee79b8bf75dd119,NEXT_PUBLIC_IMGUR_CLIENT_ID=de5cd6c5436730a \
		--allow-unauthenticated