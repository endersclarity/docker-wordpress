#!/bin/bash

echo "Setting up Docker WordPress Development Environment..."

# Create wp-content directory if it doesn't exist
if [ ! -d "wp-content" ]; then
    echo "Creating wp-content directory..."
    mkdir -p wp-content/{themes,plugins,uploads}
fi

# Start the containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check if containers are running
echo "Checking container status..."
docker-compose ps

echo ""
echo "Setup complete!"
echo ""
echo "Access your services:"
echo "WordPress: http://localhost:8090"
echo "VS Code: http://localhost:8080 (password: password)"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f"