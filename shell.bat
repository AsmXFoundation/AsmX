@echo off
color A

echo ================================================================
echo 			Shell AsmX 
echo ================================================================

set include="C:/MarsX/transpiler/core.js"
set lib="../compilers/asmX/common/@1.0/syscalls.marsX"

SET /p confMarsX=Path to MarsX? [y/n]:

if %confMarsX%=='y' (
 	SET /p confMarsX=Path to MarsX:
 	SET %include%=%confMarsX%
)

node %include% %* > %lib%
node kernel.js
