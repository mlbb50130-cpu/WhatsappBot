@echo off
REM 🚀 Installation & Démarrage MongoDB Local

setlocal enabledelayedexpansion

color 0A
title Setup MongoDB Local - TetsuBot

cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🗄️  MongoDB Installation Local           ║
echo ║   Pour tester TetsuBot en local           ║
echo ╚════════════════════════════════════════════╝
echo.

REM Vérifier si mongod est installé
echo 🔍 Vérification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('mongod --version') do set MONGO_VERSION=%%i
    echo ✅ MongoDB trouvé: %MONGO_VERSION%
    echo.
    
    REM Créer le dossier de données
    if not exist "%HOMEDRIVE%%HOMEPATH%\data\db" (
        echo 📁 Création du dossier de données...
        mkdir "%HOMEDRIVE%%HOMEPATH%\data\db"
    )
    
    echo.
    echo 🚀 Démarrage de MongoDB...
    echo    Écoute sur: localhost:27017
    echo    Base de données: %HOMEDRIVE%%HOMEPATH%\data\db
    echo.
    echo ⏳ MongoDB démarre... (cette console doit rester ouverte)
    echo    Ouvrez une autre console pour le bot
    echo.
    
    mongod --dbpath "%HOMEDRIVE%%HOMEPATH%\data\db"
) else (
    echo ❌ MongoDB n'est pas installé
    echo.
    echo 📥 Installation:
    echo    1. Télécharger: https://www.mongodb.com/try/download/community
    echo    2. Installer MongoDB Community Edition
    echo    3. Relancer ce script
    echo.
    pause
    exit /b 1
)

pause
