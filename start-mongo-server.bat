@echo off
REM Démarrer MongoDB Server directement depuis l'installation

setlocal enabledelayedexpansion
color 0A
title MongoDB Server - TetsuBot

cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🗄️  MongoDB Server - TetsuBot            ║
echo ║   Gardez ce terminal OUVERT                ║
echo ╚════════════════════════════════════════════╝
echo.

REM Créer le dossier de données s'il n'existe pas
if not exist "c:\data\db" (
    echo 📁 Création du dossier de données...
    mkdir c:\data\db
    echo ✅ Dossier créé: c:\data\db
    echo.
)

REM Créer le dossier logs s'il n'existe pas
if not exist "c:\data\logs" (
    echo 📁 Création du dossier logs...
    mkdir c:\data\logs
    echo ✅ Dossier créé: c:\data\logs
    echo.
)

echo 🚀 Démarrage de MongoDB Server v8.2...
echo ✅ MongoDB écoute sur: mongodb://localhost:27017
echo 📊 Dossier de données: c:\data\db
echo 📝 Logs: c:\data\logs\mongod.log
echo.
echo ⏸️  Appuyez sur Ctrl+C pour arrêter MongoDB
echo.

REM Démarrer MongoDB avec les options recommandées
cd /d "C:\Program Files\MongoDB\Server\8.2\bin"
mongod.exe --dbpath "c:\data\db" --logpath "c:\data\logs\mongod.log" --logappend --journal

echo.
echo ⏹️  MongoDB arrêté
pause
