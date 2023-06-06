@echo off

setlocal enableextensions
set "asmx=%USERPROFILE%/AsmX/installer/windows/asmx.bat"

if not exist "%asmx%" (
    echo "asmx" command not found!
    exit /b 1
)

set "PATH=%path%;%asmx%"

echo asmx has been added to Global System