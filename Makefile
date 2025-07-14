# Makefile for GitHub Notes Backend

# Variables
APP_NAME = github-notes-backend
DOCKER_COMPOSE = docker-compose
GO_CMD = go
GO_BUILD = $(GO_CMD) build
GO_RUN = $(GO_CMD) run
GO_TEST = $(GO_CMD) test
GO_MOD = $(GO_CMD) mod

# Build the application
build:
	$(GO_BUILD) -o bin/$(APP_NAME) cmd/main.go

# Run the application locally
run:
	$(GO_RUN) cmd/main.go

# Run tests
test:
	$(GO_TEST) -v ./...

# Clean build artifacts
clean:
	rm -f bin/$(APP_NAME)
	rm -rf tmp/

# Download dependencies
deps:
	$(GO_MOD) download
	$(GO_MOD) tidy

# Update dependencies
update:
	$(GO_MOD) get -u
	$(GO_MOD) tidy

# Docker commands
docker-build:
	docker build -t $(APP_NAME) .

docker-run:
	$(DOCKER_COMPOSE) up -d

docker-stop:
	$(DOCKER_COMPOSE) down

docker-logs:
	$(DOCKER_COMPOSE) logs -f

docker-rebuild:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

# Database commands
db-up:
	docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=github_notes -p 5432:5432 -d postgres:15-alpine

db-down:
	docker stop postgres
	docker rm postgres

# Development commands
dev:
	air

# Format code
fmt:
	$(GO_CMD) fmt ./...

# Lint code (requires golangci-lint)
lint:
	golangci-lint run

# Generate documentation
docs:
	swag init -g cmd/main.go

# Install development tools
install-tools:
	$(GO_CMD) install github.com/cosmtrek/air@latest
	$(GO_CMD) install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	$(GO_CMD) install github.com/swaggo/swag/cmd/swag@latest

# Show help
help:
	@echo "Available commands:"
	@echo "  build          - Build the application"
	@echo "  run            - Run the application locally"
	@echo "  test           - Run tests"
	@echo "  clean          - Clean build artifacts"
	@echo "  deps           - Download dependencies"
	@echo "  update         - Update dependencies"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run with Docker Compose"
	@echo "  docker-stop    - Stop Docker containers"
	@echo "  docker-logs    - View Docker logs"
	@echo "  docker-rebuild - Rebuild and restart Docker containers"
	@echo "  db-up          - Start PostgreSQL container"
	@echo "  db-down        - Stop PostgreSQL container"
	@echo "  dev            - Run with air (hot reload)"
	@echo "  fmt            - Format code"
	@echo "  lint           - Lint code"
	@echo "  install-tools  - Install development tools"
	@echo "  help           - Show this help message"

.PHONY: build run test clean deps update docker-build docker-run docker-stop docker-logs docker-rebuild db-up db-down dev fmt lint docs install-tools help
