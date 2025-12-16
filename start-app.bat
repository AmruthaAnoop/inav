@echo off
echo ======================================
echo Starting Payment Collection App
echo ======================================

echo.
echo [1/4] Checking backend server...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is running
) else (
    echo × Backend NOT running
    echo Starting backend server...
    start "Backend Server" cmd /k "cd C:\Users\Amrut\Documents\inav\payment-app-backend && npm run dev"
    timeout /t 5 /nobreak >nul
)

echo.
echo [2/4] Checking emulator...
adb devices | find "emulator" >nul
if %errorlevel% equ 0 (
    echo ✓ Emulator is running
) else (
    echo × Emulator NOT running
    echo Starting Android emulator...
    start "Android Emulator" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_8
    echo Waiting 60 seconds for emulator to boot...
    timeout /t 60 /nobreak
)

echo.
echo [3/4] Clearing Expo app data...
adb shell pm clear host.exp.exponent 2>nul
echo ✓ Cache cleared

echo.
echo [4/4] Starting Expo development server...
cd C:\Users\Amrut\Documents\inav\payment-app-frontend
start "Expo Server" cmd /k "npx expo start --clear --android"

echo.
echo ======================================
echo App Starting!
echo ======================================
echo Backend: http://localhost:5000
echo Emulator IP: http://10.0.2.2:5000/api
echo.
echo Wait for the app to load on the emulator screen...
echo Press any key to exit this window.
pause >nul
