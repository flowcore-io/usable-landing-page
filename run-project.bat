@echo off
cd /d "C:\Users\HannaSundsteinØsterø\Documents\Landing Pages\Usable\usable-landing-page"
echo Starting Usable Landing Page...
echo Current directory: %CD%
echo.
echo Starting server on port 8000...
start /b npx http-server -p 8000
timeout /t 3 /nobreak >nul
echo Opening in browser...
start http://localhost:8000
echo.
echo Server is running! Press Ctrl+C to stop.
pause
