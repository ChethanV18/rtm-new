@echo off
echo =======================================================
echo         RTM Tool - Automated Startup Script
echo =======================================================
echo.

echo [1/3] Checking Prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed! 
    echo Please download and install Node.js from https://nodejs.org/ first.
    pause
    exit /b
)

echo.
echo [2/3] Setting up Backend Server...
cd backend
if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm.cmd install
)
echo Starting backend server...
start cmd.exe /k "npm.cmd start"
cd ..

echo.
echo [3/3] Setting up Frontend Application...
cd frontend
if not exist "node_modules\" (
    echo Installing frontend dependencies... (This might take a minute)
    call npm.cmd install
)
echo Starting frontend application...
start cmd.exe /k "npm.cmd start"
cd ..

echo.
echo =======================================================
echo Setup Complete! 
echo The backend is running in one window, and the frontend 
echo should open automatically in your browser shortly.
echo.
echo IMPORTANT: Make sure MongoDB is running locally on your laptop!
echo =======================================================
pause
