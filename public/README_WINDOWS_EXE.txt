===============================================================================
TAMIL PDF QUESTION BANK STUDIO - WINDOWS STANDALONE EXECUTABLE (.EXE) SETUP
===============================================================================

HOW TO GET & RUN 'Tamil_PDF_Tool.exe' ON YOUR WINDOWS SYSTEM:
-------------------------------------------------------------------------------

METHOD 1: THE 1-CLICK AUTOMATIC BUILDER (RECOMMENDED)
1. Ensure Python 3.10 or 3.11 is installed on your Windows PC.
   (Download free from: https://www.python.org/downloads/ - tick "Add to PATH")
2. Place both 'tamil_pdf_tool.py' and 'Build_Tamil_PDF_Tool_EXE.bat' in the same folder.
3. Simply double-click 'Build_Tamil_PDF_Tool_EXE.bat'.
4. The script will automatically install dependencies and compile 'Tamil_PDF_Tool.exe'.
5. When complete, your Windows File Explorer will open displaying your ready-to-run:
   dist\Tamil_PDF_Tool\Tamil_PDF_Tool.exe

-------------------------------------------------------------------------------
METHOD 2: RUNNING VIA TERMINAL / COMMAND PROMPT
1. Open Command Prompt (cmd) in this folder.
2. Run:
   pip install -r requirements.txt
3. Run the application directly with Python:
   python tamil_pdf_tool.py
4. OR generate the single-file .exe manually:
   pyinstaller --onedir --windowed --name "Tamil_PDF_Tool" --collect-all ocr_tamil tamil_pdf_tool.py

-------------------------------------------------------------------------------
WHY IS AN EXE GENERATED LOCALLY ON YOUR SYSTEM?
Because Windows .EXE binaries containing native PyTorch C++ kernels and NVIDIA CUDA
bindings must be compiled directly on Windows so that the binary matches your system's
exact graphics card, DirectX/CUDA version, and Windows libraries.
The included 'Build_Tamil_PDF_Tool_EXE.bat' does this 100% automatically for you!
===============================================================================
