@echo off
color A

echo ================================================================
echo 			Shell AsmX 
echo ================================================================

SET /p fileAsmX=Path to AsmX file (index.asmX):
node kernel.js  %* > %fileAsmX%