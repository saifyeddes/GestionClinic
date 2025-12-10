@echo off
echo ========================================
echo GestionClinic - Backend Launcher
echo ========================================
echo.
echo Verifying Node.js installation...
node --version
echo.
echo Checking npm installation...
npm --version
echo.
echo Installing dependencies...
call npm install
echo.
echo Building the project...
call npm run build
echo.
echo Starting the backend server...
echo API will be available at: http://localhost:4000
echo.
call npm run start:dev
pause
