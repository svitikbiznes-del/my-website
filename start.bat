@echo off
chcp 65001 >nul
cd /d "%~dp0"
title AnonCheat Server (http://127.0.0.1:5000)

echo ========================================================
echo   AnonCheat Server - http://127.0.0.1:5000
echo ========================================================
echo.

start "" "http://127.0.0.1:5000"

where py >nul 2>&1
if %errorlevel%==0 (
    py -u server.py
) else (
    python -u server.py
)

pause
