.PHONY: install run run-backend run-frontend build

install:
	npm install

# API on :8787 plus the Vite dev server, which proxies /api to it.
run:
	$(MAKE) -j2 run-backend run-frontend

run-backend:
	npm run backend

run-frontend:
	npm run dev

