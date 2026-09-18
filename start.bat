@echo off
setlocal
cd /d "%~dp0"

echo Starting AnonCheat server...
where py >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON_CMD=py"
) else (
    set "PYTHON_CMD=python"
)

start "AnonCheat Browser" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:5000'"
%PYTHON_CMD% server.py

if %errorlevel% neq 0 (
    echo.
    echo Не удалось запустить Python. Установи Python 3.10+ и повтори запуск.
    pause
)
endlocal
