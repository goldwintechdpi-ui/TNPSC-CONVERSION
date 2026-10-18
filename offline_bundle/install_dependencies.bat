@echo off
title Install Offline Dependencies
cls
echo Installing dependencies for Tamil PDF Tool...
python -m pip install --upgrade pip
python -m pip install ocr_tamil pymupdf openpyxl python-docx pyspellchecker pyinstaller
echo.
echo All dependencies installed! You can now double-click 'run_offline.bat' or 'build_exe.bat'.
pause
