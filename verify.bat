@echo off
REM 🔍 Lancer les vérifications complètes

color 0E
title TetsuBot - Verification Complète

cls

echo.
echo ╔════════════════════════════════════════════╗
echo ║   🔍 VÉRIFICATION COMPLÈTE - TetsuBot    ║
echo ║   Configuration pour Groupes WhatsApp      ║
echo ╚════════════════════════════════════════════╝
echo.

echo 📊 Exécution des vérifications...
echo.

REM Vérifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé
    pause
    exit /b 1
)

REM Exécuter la vérification
echo ⏳ Vérification en cours...
node verify-config.js

if %errorlevel% equ 0 (
    echo.
    echo 📋 Exécution de la checklist interactive...
    echo.
    node checklist.js
) else (
    echo.
    echo ❌ Vérification échouée
)

pause
