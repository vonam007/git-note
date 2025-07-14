# Makefile for GitHub Notes Full-Stack Application

# Variables
APP_NAME = github-notes-backend
DOCKER_COMPOSE_FILE = docker-compose.fullstack.yml
DOCKER_COMPOSE_CMD = docker compose
GO_CMD = go
GO_BUILD = $(GO_CMD) build
GO_RUN = $(GO_CMD) run
GO_TEST = $(GO_CMD) test
GO_MOD = $(GO_CMD) mod

# =============================================================================
# MAIN COMMANDS
# =============================================================================

# Stop all Docker containers
down:
	@echo "🛑 Stopping all Docker containers..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) down
	@echo "✅ All containers stopped"

# Start all Docker containers
up:
	@echo "🚀 Starting full-stack application..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) up -d
	@echo "✅ Application started at:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8080"

# Build full-stack application (rebuild images)
build:
	@echo "🔨 Building full-stack application..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) build --no-cache
	@echo "✅ Build completed"

# Rebuild full-stack application (down -> build -> up)
rebuild:
	@echo "🔄 Rebuilding full-stack application..."
	$(MAKE) down
	$(MAKE) build
	$(MAKE) up
	@echo "🎉 Full-stack application rebuilt and started!"

# =============================================================================
# DEVELOPMENT COMMANDS
# =============================================================================

# Build backend only
build-backend:
	@echo "🔨 Building backend..."
	$(GO_BUILD) -o bin/$(APP_NAME) cmd/main.go
	@echo "✅ Backend built successfully"

# Run backend locally (development)
run-backend:
	@echo "🚀 Running backend locally..."
	$(GO_RUN) cmd/main.go

# Setup and run frontend locally (development)
setup-frontend:
	@echo "⚙️  Setting up frontend..."
	cd frontend && chmod +x setup.sh && ./setup.sh
	@echo "✅ Frontend setup completed"

run-frontend:
	@echo "🚀 Running frontend locally..."
	cd frontend && npm start

# Run tests
test:
	@echo "🧪 Running tests..."
	$(GO_TEST) -v ./...

# =============================================================================
# DOCKER COMMANDS
# =============================================================================

# View Docker logs
logs:
	@echo "📋 Showing Docker logs..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) logs -f

# Check Docker containers status
status:
	@echo "📊 Docker containers status:"
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) ps

# Remove all Docker volumes (clean slate)
clean-volumes:
	@echo "🧹 Cleaning Docker volumes..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) down -v
	docker volume prune -f
	@echo "✅ Volumes cleaned"

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

# Start only database
db-up:
	@echo "🗄️  Starting database..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) up -d postgres
	@echo "✅ Database started"

# Stop only database
db-down:
	@echo "🗄️  Stopping database..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) stop postgres
	@echo "✅ Database stopped"

# Access database shell
db-shell:
	@echo "🗄️  Accessing database shell..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) exec postgres psql -U postgres -d github_notes

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

# Download and tidy Go dependencies
deps:
	@echo "📦 Managing dependencies..."
	$(GO_MOD) download
	$(GO_MOD) tidy
	@echo "✅ Dependencies updated"

# Format Go code
fmt:
	@echo "🎨 Formatting code..."
	$(GO_CMD) fmt ./...
	@echo "✅ Code formatted"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -f bin/$(APP_NAME)
	rm -rf tmp/
	@echo "✅ Build artifacts cleaned"

# Show application status
info:
	@echo "📋 GitHub Notes Application Info:"
	@echo "================================="
	@echo "Application Name: $(APP_NAME)"
	@echo "Docker Compose:   $(DOCKER_COMPOSE_FILE)"
	@echo ""
	@echo "URLs:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Database: localhost:5432"
	@echo ""
	@echo "Main Commands:"
	@echo "  make up       - Start full-stack"
	@echo "  make down     - Stop all containers"
	@echo "  make build    - Build all images"
	@echo "  make rebuild  - Full rebuild (down->build->up)"

# Show help
help:
	@echo "GitHub Notes Full-Stack Application"
	@echo "=================================="
	@echo ""
	@echo "🚀 MAIN COMMANDS:"
	@echo "  up           - Start full-stack application"
	@echo "  down         - Stop all Docker containers"
	@echo "  build        - Build full-stack application"
	@echo "  rebuild      - Rebuild full-stack (down->build->up)"
	@echo ""
	@echo "🔧 DEVELOPMENT:"
	@echo "  build-backend    - Build backend binary"
	@echo "  run-backend      - Run backend locally"
	@echo "  setup-frontend   - Setup frontend dependencies"
	@echo "  run-frontend     - Run frontend locally"
	@echo "  test             - Run tests"
	@echo ""
	@echo "🐳 DOCKER:"
	@echo "  logs         - View Docker logs"
	@echo "  status       - Check containers status"
	@echo "  clean-volumes - Clean Docker volumes"
	@echo ""
	@echo "🗄️  DATABASE:"
	@echo "  db-up        - Start database only"
	@echo "  db-down      - Stop database only"
	@echo "  db-shell     - Access database shell"
	@echo ""
	@echo "🛠️  UTILITIES:"
	@echo "  deps         - Manage Go dependencies"
	@echo "  fmt          - Format Go code"
	@echo "  clean        - Clean build artifacts"
	@echo "  info         - Show application info"
	@echo "  help         - Show this help"

.PHONY: down up build rebuild build-backend run-backend setup-frontend run-frontend test logs status clean-volumes db-up db-down db-shell deps fmt clean info help
