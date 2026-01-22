@echo off
REM 🗄️ Vérifier MongoDB et démarrer le serveur

setlocal enabledelayedexpansion
color 0A
title 🗄️ MongoDB Check & Bot Start

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   🗄️  Vérification MongoDB                                    ║
echo ║   Avant de démarrer le serveur TetsuBot                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Vérifier si MongoDB est installé
echo Vérification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB n'est pas installé
    echo.
    echo 📥 Installation:
    echo   1. Allez sur: https://www.mongodb.com/try/download/community
    echo   2. Téléchargez MongoDB Community Server (Windows x64)
    echo   3. Lancez l'installateur et cochez "Run as Windows Service"
    echo.
    echo 🌐 Alternative (MongoDB Atlas Cloud):
    echo   1. Créez un compte sur: https://www.mongodb.com/cloud/atlas
    echo   2. Créez un cluster gratuit
    echo   3. Récupérez la connection string
    echo   4. Mettez-la dans .env comme MONGODB_URI
    echo.
    pause
    exit /b 1
)

echo ✅ MongoDB installé
echo.

REM Créer le dossier de données
if not exist "c:\data\db" (
    echo 📁 Création du répertoire: c:\data\db
    mkdir c:\data\db
)

echo.
echo 🚀 Démarrage de MongoDB...
echo.
echo ════════════════════════════════════════════════════════════════
echo 📌 MongoDB tourne sur: mongodb://localhost:27017
echo ⏸️  Appuyez sur Ctrl+C pour arrêter MongoDB
echo ════════════════════════════════════════════════════════════════
echo.

REM Démarrer MongoDB
mongod --dbpath c:\data\db

echo.
echo ⏹️  MongoDB arrêté
echo.
pause
