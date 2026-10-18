@echo off
title Build Standalone Tamil_PDF_Tool.exe
cls
echo Building standalone Windows EXE...
pyinstaller --noconfirm --onedir --windowed --name "Tamil_PDF_Tool" --collect-all ocr_tamil --hidden-import fitz --hidden-import openpyxl --hidden-import docx --hidden-import spellchecker --hidden-import cv2 tamil_pdf_tool.py
echo.
echo Build finished! Your standalone EXE is at: dist\Tamil_PDF_Tool\Tamil_PDF_Tool.exe
explorer dist\Tamil_PDF_Tool
pause
