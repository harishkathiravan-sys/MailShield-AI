# MailShield AI - Start Script

Write-Host "🛡️  Starting MailShield AI..." -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python main.py"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "✅ MailShield AI is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in the terminal windows to stop the servers." -ForegroundColor Yellow
