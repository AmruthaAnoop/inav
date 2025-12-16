# Payment Collection App - Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Payment Collection App Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Android SDK path
$env:ANDROID_HOME = "C:\Users\Amrut\AppData\Local\Android\Sdk"
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"
$emulator = "$env:ANDROID_HOME\emulator\emulator.exe"

# Step 1: Check Backend
Write-Host "[1/4] Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod "http://localhost:5000/api/health" -TimeoutSec 2
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "× Backend NOT running - Starting it..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\Amrut\Documents\inav\payment-app-backend; npm run dev"
    Write-Host "  Waiting 5 seconds for backend to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# Step 2: Check Emulator
Write-Host ""
Write-Host "[2/4] Checking Android emulator..." -ForegroundColor Yellow
$devices = & $adb devices 2>&1 | Select-String "emulator"
if ($devices) {
    Write-Host "✓ Emulator is running" -ForegroundColor Green
} else {
    Write-Host "× Emulator NOT running - Starting it..." -ForegroundColor Red
    Start-Process -FilePath $emulator -ArgumentList "-avd", "Pixel_8" -WindowStyle Normal
    Write-Host "  Waiting 60 seconds for emulator to boot..." -ForegroundColor Gray
    Start-Sleep -Seconds 60
}

# Step 3: Clear Expo cache
Write-Host ""
Write-Host "[3/4] Clearing Expo app cache..." -ForegroundColor Yellow
& $adb shell pm clear host.exp.exponent 2>$null
Write-Host "✓ Cache cleared" -ForegroundColor Green

# Step 4: Start Expo
Write-Host ""
Write-Host "[4/4] Starting Expo development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\Amrut\Documents\inav\payment-app-frontend; npx expo start --clear --android"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ App Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:      http://localhost:5000" -ForegroundColor White
Write-Host "Emulator API: http://10.0.2.2:5000/api" -ForegroundColor White
Write-Host ""
Write-Host "Wait 1-2 minutes for the app to load on emulator..." -ForegroundColor Yellow
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
