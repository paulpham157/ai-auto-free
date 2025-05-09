@echo off

tasklist /fi "imagename eq windsurf.exe" 2>NUL | find /i /n "windsurf.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo WARNING: windsurf.exe is not running. Please run it before running this script.
    pause
) else (
    python token_processor.py
)
