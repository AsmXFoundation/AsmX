@echo off

@rem ================================================================
@rem			Shell AsmX 
@rem ================================================================

SET /p fileAsmX=Path to AsmX file (index.asmX):
node kernel.js  %* > %fileAsmX%