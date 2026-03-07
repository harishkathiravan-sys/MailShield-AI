# MailShield AI - Setup and Run Script

Write-Host "🛡️  MailShield AI - Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonCmd = $null
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} else {
    Write-Host "❌ Python not found. Please install Python 3.11 or higher." -ForegroundColor Red
    exit 1
}

$pythonVersion = & $pythonCmd --version 2>&1
Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Found: Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow
Write-Host ""

# Setup Backend
Set-Location backend

# Create virtual environment
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists." -ForegroundColor Green
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    & $pythonCmd -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
. .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt

# Install Playwright browsers
Write-Host "Installing Playwright browsers..." -ForegroundColor Yellow
playwright install chromium
playwright install-deps chromium

Write-Host "✅ Backend setup complete!" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Yellow
Write-Host ""

# Setup Frontend
Set-Location frontend

if (Test-Path "node_modules") {
    Write-Host "Node modules already installed." -ForegroundColor Green
} else {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. Start Backend:  cd backend; .\venv\Scripts\Activate.ps1; python main.py" -ForegroundColor White
Write-Host "2. Start Frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use:" -ForegroundColor Cyan
Write-Host "  .\start.ps1" -ForegroundColor White
Write-Host ""
