@echo off
REM 🔍 Vérification pré-déploiement - TetsuBot

setlocal enabledelayedexpansion
color 0F
title 🔍 Vérification Pré-Déploiement

cls
echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   🔍 VÉRIFICATION PRÉ-DÉPLOIEMENT                  ║
echo ║   Contrôlez que tout est prêt                      ║
echo ╚════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion
set ERRORS=0

REM 1. Vérifier Node.js
echo [1/6] Vérification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non trouvé
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ %%i
)
echo.

REM 2. Vérifier npm
echo [2/6] Vérification de npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm non trouvé
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm %%i
)
echo.

REM 3. Vérifier .env
echo [3/6] Vérification de .env...
if exist ".env" (
    echo ✅ .env trouvé
    for /f "tokens=1,2 delims==" %%A in (.env) do (
        if "%%A"=="PHONE_NUMBER" (
            echo   - PHONE_NUMBER: %%B
        )
        if "%%A"=="PREFIX" (
            echo   - PREFIX: %%B
        )
        if "%%A"=="MONGODB_URI" (
            echo   - MONGODB_URI: %%B
        )
    )
) else (
    echo ❌ .env non trouvé
    set /a ERRORS+=1
)
echo.

REM 4. Vérifier package.json
echo [4/6] Vérification de package.json...
if exist "package.json" (
    echo ✅ package.json trouvé
) else (
    echo ❌ package.json manquant
    set /a ERRORS+=1
)
echo.

REM 5. Vérifier node_modules
echo [5/6] Vérification des dépendances npm...
if exist "node_modules\" (
    echo ✅ node_modules trouvé (dépendances installées)
) else (
    echo ⚠️  node_modules manquant
    echo   → Sera installé automatiquement par deploy-local.bat
)
echo.

REM 6. Vérifier MongoDB (optionnel)
echo [6/6] Vérification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB local non trouvé
    echo   → Vous pouvez utiliser MongoDB Atlas (cloud)
    echo   → Ou installer MongoDB Community
) else (
    for /f "tokens=1,2" %%i in ('mongod --version') do (
        echo ✅ MongoDB trouvé
    )
)
echo.

REM Résumé
echo ════════════════════════════════════════════════════
echo.

if %ERRORS% equ 0 (
    echo ✅ TOUS LES VÉRIFICATIONS RÉUSSIES!
    echo.
    echo 🚀 Vous pouvez maintenant lancer:
    echo   1. run-mongodb.bat (Terminal A)
    echo   2. deploy-local.bat (Terminal B)
    echo.
    echo 📖 Guide complet: DEPLOY_LOCAL_QUICK.md
) else (
    echo ❌ %ERRORS% ERREUR(S) DÉTECTÉE(S)
    echo.
    echo 📋 Résolution:
    if not exist "node_modules" (
        echo   - Lancez deploy-local.bat pour installer les dépendances
    )
    if not exist ".env" (
        echo   - Le fichier .env sera créé automatiquement
    )
)

echo.
echo Appuyez sur une touche pour quitter...
pause
