# Makefile for Game Server

.PHONY: help build up down logs test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

up-dev: ## Start in development mode
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs
	docker-compose logs -f app

logs-all: ## Show all logs
	docker-compose logs -f

test: ## Run load tests
	docker-compose exec app npm run test:load

test-report: ## Run load tests with report
	docker-compose exec app npm run test:load:report

scale: ## Scale app instances (usage: make scale N=5)
	docker-compose up -d --scale app=$(N)

clean: ## Clean up containers and volumes
	docker-compose down -v
	docker system prune -f

dev: ## Start development server locally
	npm run dev

install: ## Install dependencies
	npm install

db-init: ## Initialize database
	docker-compose exec postgres psql -U gameuser -d gamehub -f /docker-entrypoint-initdb.d/init.sql

redis-cli: ## Connect to Redis CLI
	docker-compose exec redis redis-cli

psql: ## Connect to PostgreSQL
	docker-compose exec postgres psql -U gameuser -d gamehub