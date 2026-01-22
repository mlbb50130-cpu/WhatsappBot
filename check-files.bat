@echo off
REM 🔍 Script de Vérification Complète - TetsuBot

setlocal enabledelayedexpansion
color 0F
title 🔍 Vérification des Fichiers

cls
echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   🔍 VÉRIFICATION COMPLÈTE DES FICHIERS            ║
echo ║   Contrôle de tous les fichiers manquants         ║
echo ╚════════════════════════════════════════════════════╝
echo.

node check-files.js

set CHECK_RESULT=%errorlevel%

if %CHECK_RESULT% equ 0 (
    echo.
    echo ✅ Vérification réussie!
    echo Vous pouvez maintenant lancer: deploy-local.bat
) else (
    echo.
    echo ❌ Il y a des fichiers manquants
    echo Veuillez les créer ou contacter l'administrateur
)

echo.
echo Appuyez sur une touche pour quitter...
pause
