@echo off
REM 🚀 Script de Lancement Complet - TetsuBot
REM Lance MongoDB et le Bot dans une même fenêtre

setlocal enabledelayedexpansion
color 0B
title 🚀 TetsuBot - Serveur en cours de démarrage

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   🚀 LANCEMENT DU SERVEUR TetsuBot                           ║
echo ║   Démarrage complet (MongoDB + Bot)                           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Étape 1: Vérifier Node.js
echo [1/4] Vérification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo ✅ %%i
echo.

REM Étape 2: Vérifier npm
echo [2/4] Vérification de npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé
    pause
    exit /b 1
)
echo ✅ npm trouvé
echo.

REM Étape 3: Vérifier MongoDB
echo [3/4] Vérification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB n'est pas trouvé localement
    echo.
    echo 📋 Vous avez 2 options:
    echo   1. Installer MongoDB Community
    echo      → https://www.mongodb.com/try/download/community
    echo      → Assurez-vous de cocher "Run as Windows Service"
    echo.
    echo   2. Utiliser MongoDB Atlas (cloud)
    echo      → Modifier MONGODB_URI dans .env
    echo      → mongodb+srv://user:pass@cluster...
    echo.
    set /p CONTINUE="Continuer sans MongoDB local? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo.
        echo ❌ Démarrage annulé
        pause
        exit /b 1
    )
) else (
    echo ✅ MongoDB trouvé
    echo 💡 Conseil: MongoDB doit être en cours d'exécution
)
echo.

REM Étape 4: Démarrer le bot
echo [4/4] Démarrage du bot...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   ⏳ INITIALISATION EN COURS...                               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Vérifier si node_modules existe
if not exist "node_modules\" (
    echo 📥 Installation des dépendances npm...
    call npm install
    echo.
)

echo 🚀 Démarrage du bot...
echo.
echo ════════════════════════════════════════════════════════════════
echo.

npm start

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo 🛑 Bot arrêté
echo.
pause
