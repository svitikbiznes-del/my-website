@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
    py make_admin.py %*
) else (
    python make_admin.py %*
)
