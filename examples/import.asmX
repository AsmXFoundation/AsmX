# ./examples/import.asmX
@import stream;     #   import stream.asmX

#----------------------------------------------------------------
@call read();       #   call read function
@Route $urt         #   adding the result of the $urt register to the stack
@Add $urt, 0x05     #   $ret = $urt + 0x05
@Invoke WRITE       #   WRITE = 0x03 (stream.asmX)
#----------------------------------------------------------------