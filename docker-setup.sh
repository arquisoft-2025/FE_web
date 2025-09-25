#!/bin/bash

# Docker Environment Setup Script

echo "=== Docker Environment Configuration ==="

# Auto-detect WSL IP
WSL_IP=""
if command -v powershell.exe >/dev/null 2>&1; then
    echo "🔍 Detecting WSL network configuration..."
    WSL_IP=$(powershell.exe -c "ipconfig | findstr -A 4 'WSL.*firewall' | findstr 'IPv4' | ForEach-Object { ($_ -split ':')[1].Trim() }" 2>/dev/null | tr -d '\r')
    if [ ! -z "$WSL_IP" ]; then
        echo "✅ Detected WSL IP: $WSL_IP"
    else
        echo "⚠️  Could not auto-detect WSL IP, using default 172.24.32.1"
        WSL_IP="172.24.32.1"
    fi
else
    echo "⚠️  PowerShell not available, using default WSL IP: 172.24.32.1"
    WSL_IP="172.24.32.1"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    exit 1
fi

echo "✅ .env file found"

# Display current configuration
echo ""
echo "Current environment variables:"
echo "VITE_API_TOKEN=$(grep VITE_API_TOKEN .env | cut -d '=' -f2)"
echo "VITE_API_BASE_URL=$(grep VITE_API_BASE_URL .env | cut -d '=' -f2)"

echo ""
echo "=== Build Options ==="
echo "1. Build with local .env (development)"
echo "2. Build with WSL networking (recommended for Windows)"
echo "3. Build with host.docker.internal (Docker Desktop)"
echo "4. Build with custom environment variables"

read -p "Select option (1-4): " option

case $option in
    1)
        echo "Building with local .env configuration..."
        podman build -t mi-react-app .
        ;;
    2)
        echo "Building with WSL networking configuration (IP: $WSL_IP)..."
        podman build \
            --build-arg VITE_API_BASE_URL=http://$WSL_IP:5000 \
            --build-arg VITE_API_TOKEN=http://$WSL_IP:5002 \
            -t mi-react-app .
        ;;
    3)
        echo "Building with Docker Desktop networking configuration..."
        podman build \
            --build-arg VITE_API_BASE_URL=http://host.docker.internal:5000 \
            --build-arg VITE_API_TOKEN=http://host.docker.internal:5002 \
            -t mi-react-app .
        ;;
    4)
        read -p "Enter VITE_API_BASE_URL: " api_base_url
        read -p "Enter VITE_API_TOKEN: " api_token
        echo "Building with custom configuration..."
        podman build \
            --build-arg VITE_API_BASE_URL=$api_base_url \
            --build-arg VITE_API_TOKEN=$api_token \
            -t mi-react-app .
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo "✅ Build completed!"
echo ""
echo "To run the container:"
echo "podman run -p 80:80 mi-react-app"