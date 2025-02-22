.PHONY: up down logs migrate start stop gcloud-build gcloud-push gcloud-deploy-backend gcloud-deploy-frontend


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

