@echo off
REM 🚀 Script d'Installation Rapide pour TetsuBot - Windows

setlocal enabledelayedexpansion

color 0A
title TetsuBot - Installation Rapide

cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🤖 TetsuBot - Installation Rapide       ║
echo ║   Otaku RPG WhatsApp Bot                   ║
echo ╚════════════════════════════════════════════╝
echo.

REM Vérifier Node.js
echo 📋 Vérification des prérequis...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé
    echo 📥 Téléchargez depuis: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% détecté

REM Vérifier npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% détecté

REM Installation des dépendances
echo.
echo 📦 Installation des dépendances...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation
    pause
    exit /b 1
)
echo ✅ Dépendances installées

REM Configuration .env
echo.
echo ⚙️  Configuration .env...
if not exist .env (
    echo 📝 Création du fichier .env...
    copy .env.example.complete .env >nul
    echo ✅ Fichier .env créé
    echo.
    echo 📋 Veuillez éditer le fichier .env avec:
    echo    - PHONE_NUMBER: Votre numéro WhatsApp
    echo    - MONGODB_URI: URL de votre MongoDB
    echo    - ADMIN_JIDS: Votre JID (obtenu après première connexion)
    echo.
    pause /prompt "Appuyez sur une touche après avoir édité .env..."
) else (
    echo ℹ️  Fichier .env déjà existant
)

REM Créer les répertoires
echo.
echo 📁 Création des répertoires...
if not exist sessions mkdir sessions
if not exist logs mkdir logs
if not exist backups mkdir backups
echo ✅ Répertoires créés

REM Vérification complète
echo.
echo 🔍 Vérification complète...
node verify-config.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Des corrections sont nécessaires
    echo 📝 Consultez les messages d'erreur ci-dessus
    pause
    exit /b 1
)

echo.
echo ✅ Configuration parfaite!
echo.

REM Proposer de démarrer
set /p START="Démarrer le bot maintenant? (y/n) "
if /i "%START%"=="y" (
    echo.
    echo 🚀 Démarrage du bot...
    echo 📱 Scannez le QR code dans le terminal avec WhatsApp Web
    echo.
    call npm start
) else (
    echo.
    echo 📝 Pour démarrer le bot plus tard, exécutez:
    echo    npm start
)

pause
