@echo off
cd /d "%~dp0"

echo Initializing Git...
git init
if errorlevel 1 (
    echo.
    echo Git is not installed or not in PATH. Install from https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Adding all files...
git add .

echo Creating first commit...
git commit -m "Initial commit: Intelligent Real emotion detection app"

echo.
echo Next steps:
echo 1. Go to https://github.com/new and create a NEW empty repository (no README).
echo 2. Copy the repo URL (e.g. https://github.com/YOUR_USERNAME/YOUR_REPO.git)
echo 3. Run these in this folder (replace with your URL):
echo.
echo    git remote add origin https://github.com/Yashwanth-Programmer/Intelligent-Real-Time-Human-Emotion-Recognition-Using-Computer-Vision.git
echo