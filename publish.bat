@echo off
cd /d "C:\Users\HannaSundsteinØsterø\Documents\Landing Pages\Usable\usable-landing-page"
echo.
echo ========================================
echo   Usable Landing Page - GitHub Pages
echo ========================================
echo.
echo Current directory: %CD%
echo.

echo Staging all changes...
git add .
echo.

echo Committing changes...
git commit -m "Update landing page - FAQ improvements and design fixes"
echo.

echo Pushing to GitHub Pages...
git push origin main
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your site will be live at: www.usable.dev
echo (GitHub Pages may take 1-2 minutes to update)
echo.
pause

