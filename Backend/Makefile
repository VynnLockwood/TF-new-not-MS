.PHONY: up down logs

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec backend python app.py db upgrade

start: up migrate
	docker compose up -d

stop: down