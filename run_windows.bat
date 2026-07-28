@echo off
color 0A
echo ==================================================
echo         SILENT CHURN - HACKATHON DEMO
echo ==================================================
echo.
echo [*] Starting Backend Server (FastAPI)...
start "Silent Churn Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn app.main:app --port 8000"

echo [*] Starting Frontend Server (React/Vite)...
start "Silent Churn Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [*] Waiting for Browser to open...
timeout /t 3 /nobreak >nul

start http://localhost:5173

echo.
echo [OK] All systems ready! Window opened in your browser.
echo [NOTE] You can close this window (The application continues to run in the other two background windows).
echo ==================================================
pause
