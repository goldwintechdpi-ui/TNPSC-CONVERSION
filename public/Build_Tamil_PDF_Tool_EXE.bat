@echo off
title Build Tamil PDF Tool - Windows Standalone EXE Generator
color 0A
cls
echo ===============================================================================
echo        TAMIL PDF QUESTION BANK STUDIO - 1-CLICK WINDOWS .EXE BUILDER
echo ===============================================================================
echo.
echo This script will automatically:
echo   1. Verify your Python installation
echo   2. Install PyInstaller, ocr_tamil, PyMuPDF, openpyxl, python-docx
echo   3. Package 'tamil_pdf_tool.py' into a standalone 'Tamil_PDF_Tool.exe'
echo.
echo ===============================================================================

:: 1. Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found in your system PATH!
    echo.
    echo Please install Python 3.10 or 3.11 from https://www.python.org/downloads/
    echo IMPORTANT: Make sure to check the box "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo [OK] Python detected:
python --version
echo.

:: 2. Upgrade pip and install build dependencies
echo [*] Step 1/3: Installing required dependencies and PyInstaller...
python -m pip install --upgrade pip
python -m pip install pyinstaller ocr_tamil pymupdf openpyxl python-docx pyspellchecker
if errorlevel 1 (
    echo [WARNING] Some packages failed with standard pip. Retrying with basic wheels...
    python -m pip install pyinstaller pymupdf openpyxl python-docx
)

echo.
echo [*] Step 2/3: Compiling standalone Tamil_PDF_Tool.exe with PyInstaller...
echo This may take 2-4 minutes while PyTorch, CRAFT, and PARSeq models are packaged.
echo.

:: 3. Run PyInstaller
pyinstaller --noconfirm --onedir --windowed ^
    --name "Tamil_PDF_Tool" ^
    --collect-all ocr_tamil ^
    --hidden-import fitz ^
    --hidden-import openpyxl ^
    --hidden-import docx ^
    --hidden-import spellchecker ^
    --hidden-import cv2 ^
    --hidden-import PIL ^
    tamil_pdf_tool.py

if errorlevel 1 (
    echo.
    echo [INFO] Fallback to simple packaging without windowed console...
    pyinstaller --noconfirm --onedir --name "Tamil_PDF_Tool" --collect-all ocr_tamil tamil_pdf_tool.py
)

echo.
echo ===============================================================================
echo [SUCCESS] Build completed!
echo Your executable is ready at:
echo    dist\Tamil_PDF_Tool\Tamil_PDF_Tool.exe
echo ===============================================================================
echo.
echo Opening the output folder in Windows File Explorer...
if exist "dist\Tamil_PDF_Tool" (
    explorer "dist\Tamil_PDF_Tool"
) else if exist "dist" (
    explorer "dist"
)
pause
