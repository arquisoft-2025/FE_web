# Docker Environment Setup Script for Windows
# PowerShell version

Write-Host "=== Docker Environment Configuration ===" -ForegroundColor Green

# Auto-detect WSL IP
Write-Host "🔍 Detecting WSL network configuration..." -ForegroundColor Yellow
$wslAdapter = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*WSL*"}
if ($wslAdapter) {
    $WSL_IP = $wslAdapter.IPAddress
    Write-Host "✅ Detected WSL IP: $WSL_IP" -ForegroundColor Green
} else {
    # Fallback method
    $ipOutput = ipconfig | Select-String -Pattern "WSL.*firewall" -Context 0,4
    if ($ipOutput) {
        $ipLine = $ipOutput.Context.PostContext | Select-String -Pattern "IPv4"
        if ($ipLine) {
            $WSL_IP = ($ipLine -split ':')[1].Trim()
            Write-Host "✅ Detected WSL IP: $WSL_IP" -ForegroundColor Green
        } else {
            $WSL_IP = "172.24.32.1"
            Write-Host "⚠️  Could not auto-detect WSL IP, using default: $WSL_IP" -ForegroundColor Yellow
        }
    } else {
        $WSL_IP = "172.24.32.1"
        Write-Host "⚠️  Could not find WSL adapter, using default: $WSL_IP" -ForegroundColor Yellow
    }
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please edit it with your configuration." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found. Please create .env manually." -ForegroundColor Red
    }
    return
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Display current configuration
Write-Host ""
Write-Host "Current environment variables:" -ForegroundColor Cyan
$envContent = Get-Content ".env"
$apiToken = ($envContent | Select-String -Pattern "VITE_API_TOKEN=").ToString().Split('=')[1]
$apiBaseUrl = ($envContent | Select-String -Pattern "VITE_API_BASE_URL=").ToString().Split('=')[1]
Write-Host "VITE_API_TOKEN=$apiToken"
Write-Host "VITE_API_BASE_URL=$apiBaseUrl"

Write-Host ""
Write-Host "=== Build Options ===" -ForegroundColor Cyan
Write-Host "1. Build with local .env (development)"
Write-Host "2. Build with WSL networking (recommended for Windows)"
Write-Host "3. Build with host.docker.internal (Docker Desktop)"
Write-Host "4. Build with custom environment variables"

$option = Read-Host "Select option (1-4)"

switch ($option) {
    1 {
        Write-Host "Building with local .env configuration..." -ForegroundColor Yellow
        podman build -t mi-react-app .
    }
    2 {
        Write-Host "Building with WSL networking configuration (IP: $WSL_IP)..." -ForegroundColor Yellow
        podman build --build-arg VITE_API_BASE_URL=http://$WSL_IP`:5000 --build-arg VITE_API_TOKEN=http://$WSL_IP`:5002 -t mi-react-app .
    }
    3 {
        Write-Host "Building with Docker Desktop networking configuration..." -ForegroundColor Yellow
        podman build --build-arg VITE_API_BASE_URL=http://host.docker.internal:5000 --build-arg VITE_API_TOKEN=http://host.docker.internal:5002 -t mi-react-app .
    }
    4 {
        $apiBaseUrl = Read-Host "Enter VITE_API_BASE_URL"
        $apiToken = Read-Host "Enter VITE_API_TOKEN"
        Write-Host "Building with custom configuration..." -ForegroundColor Yellow
        podman build --build-arg VITE_API_BASE_URL=$apiBaseUrl --build-arg VITE_API_TOKEN=$apiToken -t mi-react-app .
    }
    default {
        Write-Host "Invalid option" -ForegroundColor Red
        return
    }
}

Write-Host "✅ Build completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the container:" -ForegroundColor Cyan
Write-Host "podman run -p 80:80 mi-react-app"