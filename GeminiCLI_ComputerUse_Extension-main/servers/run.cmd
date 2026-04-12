@echo off
setlocal enabledelayedexpansion

set EXT_DIR=%~dp0..
set SERVERS_DIR=%~dp0
set VENV=%SERVERS_DIR%computerusemcp

:: Try to find Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [computer_use] ERROR: Could not find Python. Please install Python 3.10+ and add it to PATH. 1>&2
    exit /b 1
)

echo [computer_use] EXT_DIR=%EXT_DIR% 1>&2
echo [computer_use] SERVERS_DIR=%SERVERS_DIR% 1>&2
echo [computer_use] VENV=%VENV% 1>&2

:: 1) Create venv if missing
if not exist "%VENV%\Scripts\python.exe" (
    echo [computer_use] creating venv... 1>&2
    python -m venv "%VENV%"
    "%VENV%\Scripts\python.exe" -m pip install -U pip wheel setuptools --disable-pip-version-check -q 1>&2
)

:: 2) Install deps
if exist "%SERVERS_DIR%requirements.txt" (
    echo [computer_use] installing Python dependencies... 1>&2
    "%VENV%\Scripts\python.exe" -m pip install -r "%SERVERS_DIR%requirements.txt" --disable-pip-version-check -q 1>&2
) else (
    echo [computer_use] WARNING: %SERVERS_DIR%requirements.txt not found; skipping. 1>&2
)

:: 3) Ensure Playwright Chromium is installed for THIS venv
echo [computer_use] ensuring Chromium is installed... 1>&2
"%VENV%\Scripts\playwright.exe" install chromium >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [computer_use] ERROR: playwright chromium install failed 1>&2
    exit /b 1
)

:: 4) Start MCP server (stdout must remain clean; logs go to stderr)
echo [computer_use] starting MCP server... 1>&2
"%VENV%\Scripts\python.exe" "%SERVERS_DIR%computer_use_mcp.py" %*
