.PHONY: install run run-backend run-frontend build docker docker-down

install:
	npm install

# API on :8787 plus the Vite dev server, which proxies /api to it.
run:
	$(MAKE) -j2 run-backend run-frontend

run-backend:
	npm run backend

run-frontend:
	npm run dev -- --host 0.0.0.0

# Rebuilds the image and serves the app on :8787 in the background.
docker:
	docker compose up -d --build
