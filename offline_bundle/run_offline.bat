@echo off
title Tamil PDF Question Bank Tool (Offline)
cls
echo ===============================================================================
echo        TAMIL PDF QUESTION BANK TOOL - OFFLINE DESKTOP RUNNER
echo ===============================================================================
echo.
echo Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    echo Make sure to tick 'Add Python to PATH' during installation.
    pause
    exit /b 1
)

echo Starting Tamil PDF Question Bank Extractor...
python tamil_pdf_tool.py
if errorlevel 1 (
    echo.
    echo If missing dependencies, run 'install_dependencies.bat' first.
    pause
)
