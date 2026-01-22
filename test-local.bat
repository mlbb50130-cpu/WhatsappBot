@echo off
REM 🎮 Script de Test Local Complet - TetsuBot

setlocal enabledelayedexpansion

color 0B
title TetsuBot - Test Local Complet

cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🎮 TEST LOCAL COMPLET - TetsuBot        ║
echo ║   Préparez votre environnement de test    ║
echo ╚════════════════════════════════════════════╝
echo.

set STEP=0

REM ÉTAPE 1: Vérifier Node.js
set /a STEP+=1
echo [%STEP%/6] Vérification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js n'est pas installé
    echo 📥 Téléchargez depuis: https://nodejs.org/
    echo.
    echo Appuyez sur une touche pour quitter...
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% trouvé
echo.

REM ÉTAPE 2: Vérifier npm
set /a STEP+=1
echo [%STEP%/6] Vérification de npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ npm n'est pas installé
    echo Appuyez sur une touche pour quitter...
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% trouvé
echo.

REM ÉTAPE 3: Vérifier MongoDB
set /a STEP+=1
echo [%STEP%/6] Vérification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB n'est pas détecté
    echo.
    echo Options:
    echo  1. Installer MongoDB Community: https://www.mongodb.com/try/download/community
    echo  2. Utiliser MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
    echo  3. Utiliser Docker: docker run -d -p 27017:27017 mongo
    echo.
    set /p MONGO_CHOICE="Voulez-vous continuer sans MongoDB local? (y/n) "
    if /i not "%MONGO_CHOICE%"=="y" (
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('mongod --version ^| findstr version') do set MONGO_VERSION=%%i
    echo ✅ MongoDB trouvé: %MONGO_VERSION%
    echo.
)

REM ÉTAPE 4: Installer les dépendances
set /a STEP+=1
echo [%STEP%/6] Installation des dépendances...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erreur lors de l'installation des dépendances
    echo Appuyez sur une touche pour quitter...
    pause
    exit /b 1
)
echo ✅ Dépendances installées
echo.

REM ÉTAPE 5: Vérifier la configuration
set /a STEP+=1
echo [%STEP%/6] Vérification de la configuration...
if not exist .env (
    echo ❌ Fichier .env manquant
    echo.
    echo 📝 Création du fichier .env...
    copy .env.example.complete .env >nul
    echo ✅ Fichier .env créé
    echo.
    echo 📋 VEUILLEZ ÉDITER .env AVEC:
    echo    - PHONE_NUMBER: +33612345678
    echo    - MONGODB_URI: mongodb://localhost:27017/tetsubot
    echo    - PREFIX: !
    echo.
    pause
) else (
    echo ✅ Fichier .env trouvé
)
node verify-config.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erreur de configuration détectée
    echo Appuyez sur une touche pour quitter...
    pause
    exit /b 1
)
echo ✅ Configuration vérifiée
echo.

REM ÉTAPE 6: Démarrer le bot
set /a STEP+=1
echo [%STEP%/6] Démarrage du bot en mode test...
echo.
echo 🚀 Le bot démarre...
echo 📱 Instructions:
echo    1. Scannez le QR code avec WhatsApp Web
echo    2. Attendez la connexion (30-60 secondes)
echo    3. Invitez le bot à un groupe
echo    4. Testez: !ping (doit répondre "Pong!")
echo    5. Autres tests: !profil, !level, !quiz, etc.
echo.
echo ⏳ Appuyez sur Ctrl+C pour arrêter
echo.

npm start

if %errorlevel% neq 0 (
    echo.
    echo ❌ Le bot s'est arrêté avec une erreur
    echo Vérifiez les logs ci-dessus
    echo.
) else (
    echo.
    echo ✅ Test local terminé
)
echo.
echo Appuyez sur une touche pour quitter...
pause
