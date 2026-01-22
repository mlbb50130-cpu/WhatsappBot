@echo off
REM Démarrer MongoDB en local pour Windows

setlocal enabledelayedexpansion
color 0A
title MongoDB - TetsuBot

cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🗄️  MongoDB Local - TetsuBot             ║
echo ║   Gardez ce terminal OUVERT                ║
echo ╚════════════════════════════════════════════╝
echo.

REM Vérifier si MongoDB est installé
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB n'est pas installé
    echo.
    echo 📥 Installation:
    echo   1. Allez sur: https://www.mongodb.com/try/download/community
    echo   2. Téléchargez MongoDB Community Server (Windows x64)
    echo   3. Lancez l'installateur et suivez les étapes
    echo   4. Choisissez "Run as Windows Service"
    echo.
    echo ⏭️  Ensuite, relancez ce script
    echo.
    pause
    exit /b 1
)

REM Créer le dossier de données s'il n'existe pas
if not exist "c:\data\db" (
    echo 📁 Création du dossier de données...
    mkdir c:\data\db
    echo ✅ Dossier créé: c:\data\db
)

echo.
echo 🚀 Démarrage de MongoDB...
echo.
echo ✅ MongoDB est actif
echo 📌 URL locale: mongodb://localhost:27017
echo.
echo 💡 Gardez ce terminal ouvert pendant vos tests
echo ⏸️  Appuyez sur Ctrl+C pour arrêter MongoDB
echo.
echo ════════════════════════════════════════════
echo.

REM Démarrer MongoDB
mongod --dbpath c:\data\db

echo.
echo ⏹️  MongoDB arrêté
pause
