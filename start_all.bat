@echo off
title UrbanHive Launcher
echo ===================================================
echo               Starting UrbanHive OS                
echo ===================================================

:: 1. Start Python Backend (using route conda env uvicorn)
echo [1/3] Starting Backend (Port 8000)...
start "UrbanHive Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: 2. Start Relay Server
echo [2/3] Starting Relay Server (Port 3001)...
start "UrbanHive Relay" cmd /k "cd /d %~dp0relay && npm run dev"

:: 3. Start React Frontend
echo [3/3] Starting React Frontend...
start "UrbanHive Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ===================================================
echo All services launched in separate windows!
echo Close this window or press any key to exit launcher.
echo ===================================================
