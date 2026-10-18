import os
import zipfile

def create_offline_bundle():
    os.makedirs("./public", exist_ok=True)
    os.makedirs("./offline_bundle", exist_ok=True)

    # 1. run_offline.bat
    run_offline_bat = """@echo off
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
"""
    with open("./offline_bundle/run_offline.bat", "w", encoding="utf-8") as f:
        f.write(run_offline_bat)

    # 2. install_dependencies.bat
    install_deps_bat = """@echo off
title Install Offline Dependencies
cls
echo Installing dependencies for Tamil PDF Tool...
python -m pip install --upgrade pip
python -m pip install ocr_tamil pymupdf openpyxl python-docx pyspellchecker pyinstaller
echo.
echo All dependencies installed! You can now double-click 'run_offline.bat' or 'build_exe.bat'.
pause
"""
    with open("./offline_bundle/install_dependencies.bat", "w", encoding="utf-8") as f:
        f.write(install_deps_bat)

    # 3. build_exe.bat
    build_exe_bat = """@echo off
title Build Standalone Tamil_PDF_Tool.exe
cls
echo Building standalone Windows EXE...
pyinstaller --noconfirm --onedir --windowed --name "Tamil_PDF_Tool" --collect-all ocr_tamil --hidden-import fitz --hidden-import openpyxl --hidden-import docx --hidden-import spellchecker --hidden-import cv2 tamil_pdf_tool.py
echo.
echo Build finished! Your standalone EXE is at: dist\\Tamil_PDF_Tool\\Tamil_PDF_Tool.exe
explorer dist\\Tamil_PDF_Tool
pause
"""
    with open("./offline_bundle/build_exe.bat", "w", encoding="utf-8") as f:
        f.write(build_exe_bat)

    # 4. Copy tamil_pdf_tool.py
    with open("./public/tamil_pdf_tool.py", "r", encoding="utf-8") as src:
        py_content = src.read()
    with open("./offline_bundle/tamil_pdf_tool.py", "w", encoding="utf-8") as dst:
        dst.write(py_content)

    # 5. Copy Tamil_PDF_Tool.exe if exists
    if os.path.exists("./public/Tamil_PDF_Tool.exe"):
        with open("./public/Tamil_PDF_Tool.exe", "rb") as src:
            exe_bytes = src.read()
        with open("./offline_bundle/Tamil_PDF_Tool.exe", "wb") as dst:
            dst.write(exe_bytes)

    # 6. Sample question paper
    sample_text = """===== Page 1 =====
1. 'செந்தமிழே! உயிரே! நறுந்தேனே! செயலினை மூச்சினை உனக்களித்தேனே' - என்று பாடியவர் யார்?
(A) பாரதியார்
(B) பாரதிதாசன்
(C) நாமக்கல் கவிஞர்
(D) வாணிதாசன்
(E) விடை தெரியவில்லை

2. கீழ்க்கண்டவற்றுள் சரியான மரபுத் தொடரைத் தேர்க:
(A) காகம் கத்தும்
(B) ஆந்தை அலறும்
(C) குதிரை கத்தும்
(D) சிங்கம் கத்தும்
(E) விடை தெரியவில்லை

3. Which Article of the Indian Constitution deals with the Abolition of Untouchability?
இந்திய அரசியலமைப்பின் எந்த விதி தீண்டாமை ஒழிப்பைப் பற்றிக் குறிப்பிடுகிறது?
(A) Article 14 / விதி 14
(B) Article 17 / விதி 17
(C) Article 19 / விதி 19
(D) Article 21 / விதி 21
(E) விடை தெரியவில்லை

4. பொருத்துக:
(a) குறிஞ்சி    1. இந்திரன்
(b) முல்லை     2. வருணன்
(c) மருதம்     3. முருகன்
(d) நெய்தல்    4. திருமால்
(a) (b) (c) (d)
(A) 3  4  1  2
(B) 4  3  2  1
(C) 1  2  3  4
(D) 2  1  4  3
(E) விடை தெரியவில்லை

5. திருக்குறளில் உள்ள மொத்த அதிகாரங்கள் எத்தனை?
(A) 130
(B) 133
(C) 1330
(D) 100
(E) விடை தெரியவில்லை
"""
    with open("./offline_bundle/sample_question_paper.txt", "w", encoding="utf-8") as f:
        f.write(sample_text)

    # 7. requirements.txt
    requirements = """ocr_tamil>=0.1.0
pymupdf>=1.23.0
openpyxl>=3.1.0
python-docx>=1.1.0
pyspellchecker>=0.8.0
pyinstaller>=6.5.0
numpy>=1.24.0
opencv-python>=4.8.0
"""
    with open("./offline_bundle/requirements.txt", "w", encoding="utf-8") as f:
        f.write(requirements)

    # 8. Single-file standalone HTML offline app (runs offline in any web browser without server or internet!)
    offline_html = """<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tamil PDF Question Bank - Offline Portable App</title>
  <style>
    :root {
      --font-tamil: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body {
      font-family: var(--font-tamil);
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 20px;
    }
    .header {
      background: #0f172a;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    textarea {
      width: 100%;
      height: 220px;
      font-family: var(--font-tamil);
      font-size: 13px;
      padding: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-sizing: border-box;
      line-height: 1.6;
    }
    button {
      background: #0f172a;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover {
      background: #1e293b;
    }
    .btn-emerald {
      background: #047857;
    }
    .btn-emerald:hover {
      background: #065f46;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 15px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
    }
    .badge {
      background: #e2e8f0;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h2 style="margin:0; font-size:18px;">Tamil PDF Question Bank - Offline Portable App</h2>
        <div style="font-size:12px; color:#94a3b8; margin-top:4px;">Runs 100% offline in your browser · No internet needed</div>
      </div>
      <div>
        <span class="badge" style="background:#047857; color:white;">Offline Ready</span>
      </div>
    </div>

    <div class="card">
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
        <label>From #: <input type="number" id="qFrom" value="1" style="width:60px; padding:6px;"></label>
        <label>To #: <input type="number" id="qTo" value="100" style="width:60px; padding:6px;"></label>
        <label>Series: <input type="text" id="series" value="TNPSC" style="width:90px; padding:6px;"></label>
        <label>Bank ID: <input type="text" id="bank" value="20242" style="width:80px; padding:6px;"></label>
        <button onclick="extractQuestions()">Run Extraction</button>
        <button class="btn-emerald" onclick="downloadCSV()">Export CSV (Excel)</button>
        <button onclick="downloadTXT()">Export TXT</button>
      </div>

      <div class="grid">
        <div>
          <label style="font-size:13px; font-weight:bold; display:block; margin-bottom:6px;">Paste Scanned Exam Text / Lines:</label>
          <textarea id="rawText" placeholder="Paste exam questions here...">1. 'செந்தமிழே! உயிரே! நறுந்தேனே! செயலினை மூச்சினை உனக்களித்தேனே' - என்று பாடியவர் யார்?
(A) பாரதியார்
(B) பாரதிதாசன்
(C) நாமக்கல் கவிஞர்
(D) வாணிதாசன்
(E) விடை தெரியவில்லை

2. கீழ்க்கண்டவற்றுள் சரியான மரபுத் தொடரைத் தேர்க:
(A) காகம் கத்தும்
(B) ஆந்தை அலறும்
(C) குதிரை கத்தும்
(D) சிங்கம் கத்தும்
(E) விடை தெரியவில்லை

3. Which Article of the Indian Constitution deals with the Abolition of Untouchability?
இந்திய அரசியலமைப்பின் எந்த விதி தீண்டாமை ஒழிப்பைப் பற்றிக் குறிப்பிடுகிறது?
(A) Article 14 / விதி 14
(B) Article 17 / விதி 17
(C) Article 19 / விதி 19
(D) Article 21 / விதி 21
(E) விடை தெரியவில்லை
</textarea>
        </div>
        <div>
          <label style="font-size:13px; font-weight:bold; display:block; margin-bottom:6px;">Extraction Summary & Stats:</label>
          <div id="stats" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; height:220px; box-sizing:border-box; overflow-y:auto; font-size:13px;">
            Ready to extract. Click <strong>'Run Extraction'</strong> above to test!
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top:0; font-size:15px;">Extracted Questions Table</h3>
      <table id="questionsTable">
        <thead>
          <tr>
            <th style="width:40px;">No</th>
            <th style="width:120px;">QuestionNo (Key)</th>
            <th>Question</th>
            <th>Options (A)-(E)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="4" style="text-align:center; color:#64748b;">No questions extracted yet. Click 'Run Extraction'.</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    let extractedData = [];

    function extractQuestions() {
      const text = document.getElementById('rawText').value;
      const lo = parseInt(document.getElementById('qFrom').value) || 1;
      const hi = parseInt(document.getElementById('qTo').value) || 100;
      const series = document.getElementById('series').value || 'TNPSC';
      const bank = document.getElementById('bank').value || '20242';

      const lines = text.split('\\n');
      const qHead = /^\\s*(\\d{1,3})\\s*([.)]|,)\\s*(.*)$/;
      const optMark = /(?:(?<=\\s)|^)\\(\\s*([A-Ea-e])\\s*\\)/g;

      let cur = null;
      const found = {};

      for (let raw of lines) {
        let line = raw.trim();
        if (!line) continue;
        const m = line.match(qHead);
        if (m) {
          const n = parseInt(m[1]);
          if (n >= lo && n <= hi) {
            cur = { n, text: [], opts: {} };
            found[n] = cur;
            line = m[3].trim();
          }
        }
        if (!cur) continue;
        const marks = [...line.matchAll(optMark)];
        if (marks.length === 0) {
          cur.text.push(line);
        } else {
          for (let k = 0; k < marks.length; k++) {
            const label = marks[k][1].toUpperCase();
            const start = marks[k].index + marks[k][0].length;
            const end = k + 1 < marks.length ? marks[k+1].index : line.length;
            const body = line.slice(start, end).trim();
            cur.opts[label] = body;
          }
        }
      }

      extractedData = [];
      const tbody = document.querySelector('#questionsTable tbody');
      tbody.innerHTML = '';

      for (let n = lo; n <= hi; n++) {
        if (!found[n]) continue;
        const item = found[n];
        const qStem = item.text.join('\\n').trim();
        const optsList = [];
        for (let l of ['A','B','C','D','E']) {
          if (item.opts[l]) {
            let b = item.opts[l];
            if (l === 'E' && (b.includes('தெரிய') || b.length < 5)) b = 'விடை தெரியவில்லை';
            optsList.push(`(${l}) ${b}`);
          }
        }
        const answers = optsList.join('\\n');
        const key = `${series}-${bank}-${n}`;
        extractedData.push({ n, key, qStem, answers });

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${n}</strong></td>
          <td><code>${key}</code></td>
          <td style="white-space:pre-line;">${qStem}</td>
          <td style="white-space:pre-line;">${answers}</td>
        `;
        tbody.appendChild(tr);
      }

      document.getElementById('stats').innerHTML = `
        <div style="color:#047857; font-weight:bold; margin-bottom:8px;">Extraction Successful!</div>
        <div>Total Questions: <strong>${extractedData.length}</strong></div>
        <div>Key Formula: <code>${series}-${bank}-{Number}</code></div>
        <div style="margin-top:12px; font-size:12px; color:#475569;">You can now export directly to CSV (for Excel) or Text!</div>
      `;
    }

    function downloadCSV() {
      if (extractedData.length === 0) return alert('Extract questions first!');
      let csv = '\\uFEFFTestSeries,QuestionBank,QuestionNo,Number,Question,Anwers\\n';
      const series = document.getElementById('series').value;
      const bank = document.getElementById('bank').value;
      for (let q of extractedData) {
        const qText = `"${q.qStem.replace(/"/g, '""')}"`;
        const aText = `"${q.answers.replace(/"/g, '""')}"`;
        csv += `${series},${bank},${q.key},${q.n},${qText},${aText}\\n`;
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tamil_question_bank.csv';
      a.click();
    }

    function downloadTXT() {
      if (extractedData.length === 0) return alert('Extract questions first!');
      let txt = '';
      for (let q of extractedData) {
        txt += `${q.n}. ${q.qStem}\\n${q.answers}\\n\\n`;
      }
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tamil_question_bank.txt';
      a.click();
    }
  </script>
</body>
</html>
"""
    with open("./offline_bundle/Offline_Tamil_Extractor_Studio.html", "w", encoding="utf-8") as f:
        f.write(offline_html)

    # 9. README_OFFLINE.txt
    readme = """===============================================================================
TAMIL PDF QUESTION BANK STUDIO - COMPLETE OFFLINE RUNTIME PACKAGE
===============================================================================

This package contains everything you need to run this application 100% OFFLINE
on your computer without requiring an active internet connection.

CONTENTS OF THIS PACKAGE:
-------------------------------------------------------------------------------
1. Tamil_PDF_Tool.exe
   -> Standalone Windows Executable for direct launch.

2. run_offline.bat
   -> 1-click launcher for the Python desktop GUI tool.
   -> Simply double-click this file to launch.

3. Offline_Tamil_Extractor_Studio.html
   -> Self-contained single-file offline Web Studio!
   -> Double-click to open in Chrome, Edge, Firefox, or Safari completely offline.
   -> Runs the complete Tamil normalization, question parsing, and CSV/Excel exporter.

4. tamil_pdf_tool.py
   -> Full Python source code with CRAFT detector, PARSeq reader, 400-bin column
      gutter detection, token classifier (G/N/T/P/J), and openpyxl formula generator.

5. install_dependencies.bat
   -> Installs all Python libraries with one double-click if running from source.

6. build_exe.bat
   -> Re-compiles Tamil_PDF_Tool.exe locally anytime.

7. sample_question_paper.txt
   -> Ready-to-test sample Tamil exam question paper.
===============================================================================
"""
    with open("./offline_bundle/README_OFFLINE.txt", "w", encoding="utf-8") as f:
        f.write(readme)

    # Create the final ZIP archive
    zip_path = "./public/Tamil_PDF_Tool_Offline_Package.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("./offline_bundle"):
            for file in files:
                full_path = os.path.join(root, file)
                arc_name = os.path.relpath(full_path, "./offline_bundle")
                zipf.write(full_path, arc_name)

    print(f"Successfully generated {zip_path} ({os.path.getsize(zip_path)} bytes)")

if __name__ == "__main__":
    create_offline_bundle()
