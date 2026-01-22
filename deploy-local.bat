@echo off
REM 🚀 Script de Déploiement Local Complet - TetsuBot

setlocal enabledelayedexpansion
color 0B
title 🚀 TetsuBot - Déploiement Local

cls
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   🚀 DÉPLOIEMENT LOCAL - TetsuBot                ║
echo ║   Préparation pour test des commandes            ║
echo ╚═══════════════════════════════════════════════════╝
echo.

REM Étape 1: Vérifier Node.js
echo [1/5] Vérification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé
    echo 📥 Téléchargez depuis: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%
echo.

REM Étape 2: Installer node_modules si absent
echo [2/5] Vérification des dépendances npm...
if not exist "node_modules\" (
    echo 📥 Installation des dépendances npm...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de npm install
        pause
        exit /b 1
    )
    echo ✅ npm install complété
) else (
    echo ✅ Dépendances déjà installées
)
echo.

REM Étape 3: Vérifier MongoDB
echo [3/5] Vérification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB local non détecté
    echo.
    echo 📋 Options:
    echo   1. Installer MongoDB: https://www.mongodb.com/try/download/community
    echo   2. Utiliser MongoDB Atlas (cloud):
    echo      - Aller sur https://www.mongodb.com/cloud/atlas
    echo      - Créer un cluster gratuit
    echo      - Modifier MONGODB_URI dans .env
    echo.
    set /p CONTINUE="Continuer sans MongoDB local? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        pause
        exit /b 1
    )
) else (
    echo ✅ MongoDB détecté
    echo 💡 Conseil: Lancez start-mongodb.bat dans un autre terminal
)
echo.

REM Étape 4: Vérifier .env
echo [4/5] Vérification de la configuration...
if not exist ".env" (
    echo ❌ Fichier .env manquant
    pause
    exit /b 1
)
echo ✅ Fichier .env trouvé
echo.

REM Étape 5: Démarrage du bot
echo [5/5] Démarrage du bot...
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   ✨ BOT EN COURS DE DÉMARRAGE                   ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo 📱 INSTRUCTIONS:
echo   1. Un QR code doit apparaître
echo   2. Scannez-le avec WhatsApp (menu > Appareils liés)
echo   3. Attendez "Bot prêt!" (30-60 sec)
echo   4. Invitez le bot à un groupe WhatsApp
echo   5. Testez une commande: !ping
echo.
echo 📖 Commandes de test:
echo   - !ping              (tester la connexion)
echo   - !help              (lister les commandes)
echo   - !profil            (voir votre profil)
echo   - !level             (voir votre niveau)
echo   - !quiz              (jouer un quiz)
echo   - !loot              (obtenir un butin)
echo   - !duel @user        (défier quelqu'un)
echo.
echo ⏹️  Pour arrêter: Ctrl + C
echo.
echo ════════════════════════════════════════════════════
echo.

npm start

if %errorlevel% neq 0 (
    echo.
    echo ❌ Le bot s'est arrêté avec une erreur
) else (
    echo.
    echo ✅ Bot arrêté normalement
)
echo.
echo Appuyez sur une touche pour fermer...
pause
