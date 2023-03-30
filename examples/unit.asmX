# ./examples/unit.asmX
@import stream;                         # import stream.asmX

#----------------------------------------------------------------
@Unit  matchCoords(x, y: Int, z):
    @Add [x] , [y],[z]                  #   $ret = x + y + z
    @Ret $ret                           #   return $ret
#----------------------------------------------------------------


#----------------------------------------------------------------
@call matchCoords(4, 5, 4)              #   call function matchCoords(4, 5, 4) 
@Route $urt                             #   adding the result of the $urt register to the stack
@Invoke 0x04                            #   write $urt (The return value from the function)
#----------------------------------------------------------------

#----------------------------------------------------------------
@call read()                            #   call function read()
#----------------------------------------------------------------