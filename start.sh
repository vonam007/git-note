#!/bin/bash

# GitHub Notes Full-Stack Application Quick Start Script

set -e

echo "🚀 GitHub Notes Full-Stack Quick Start"
echo "======================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
fi

# Check if frontend .env exists
if [ ! -f frontend/.env ]; then
    echo "⚙️  Creating frontend .env file..."
    cd frontend
    cp .env.example .env
    cd ..
    echo "✅ Frontend .env file created"
fi

echo ""
echo "🎯 Available options:"
echo "1. Start full-stack application (recommended)"
echo "2. Development mode (backend only)"
echo "3. Build and start"
echo "4. Stop all services"
echo "5. View logs"
echo "6. Clean and rebuild"

read -p "Choose an option (1-6): " choice

case $choice in
    1)
        echo "🚀 Starting full-stack application..."
        make up
        ;;
    2)
        echo "🔧 Starting development mode (backend only)..."
        make db-up
        echo "Waiting for database to be ready..."
        sleep 5
        make run-backend
        ;;
    3)
        echo "🔨 Building and starting..."
        make rebuild
        ;;
    4)
        echo "🛑 Stopping all services..."
        make down
        ;;
    5)
        echo "📋 Viewing logs..."
        make logs
        ;;
    6)
        echo "🧹 Clean and rebuild..."
        make clean-volumes
        make rebuild
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Operation completed!"
echo ""
echo "📋 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo ""
echo "💡 Useful commands:"
echo "   make help     - Show all available commands"
echo "   make status   - Check containers status"
echo "   make logs     - View application logs"
echo "   make down     - Stop all services"
