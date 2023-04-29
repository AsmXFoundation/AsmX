##########################################################
#            EXAMPLES USE EXECUTE INSTRUCTION
#                    Copyright (c) 2023
#               ./examples/execute.asmX
##########################################################

#----------------------------------------------------------------
@Execute inc 0x23           #   $ret = 0x23 + 0x01
@Route $ret                 #   adding the result of the $ret register to the stack
@Invoke 0x04                #   write lis (last item stack)
#----------------------------------------------------------------


#----------------------------------------------------------------
@Unit pow(x: Int, n: Int):  # create unit from x and n and return the result of the $ret register
    @Execute mov 0x01       # $mov = 0x01 AND $ret = 0x01
    @Imul $ret [x]          # $ret = $ret * [x] -> $ret *= [x]
    @Execute jmp 0x01 [n]   # jmp 0x01 (top) [n] (count)
    @Ret $ret               # return $ret
#----------------------------------------------------------------


#----------------------------------------------------------------
@call pow(4, 3);            #   call pow unit
@Route $urt                 #   adding the result of the $urt register to the stack
@Invoke 0x04                #   write $urt (The return value from the function)
#----------------------------------------------------------------


#----------------------------------------------------------------
@Unit factorial(x: Int):    # factorial of the result of the $urt register to the stack
    @Execute mov 0x01       # $mov = 0x01 AND $ret = 0x01
    @Imul $count $ret       # $ret = $count * $ret
    @Execute jmp 0x01 [x]   # jmp 0x01 (top) [x] (count)
    @Ret $ret               # return $ret
#----------------------------------------------------------------


#----------------------------------------------------------------
@call factorial(4);         # call factorial
@Route $urt                 # write to the stack
@Invoke 0x04                # write lis (last item stack)
#----------------------------------------------------------------


#----------------------------------------------------------------
@Execute mov 0x01           #   $mov = 0x01 AND $ret = 0x01
@Imul $ret 0x03             #   $ret = 0x03 * $ret
@Execute jmp 0x01 0x03      #   jmp 0x01 (top) 0x03 (count)
@Route $ret                 #   write $ret in stack
@Invoke 0x04                #   write lis (last item stack)
#----------------------------------------------------------------


#----------------------------------------------------------------
@Execute mov 0x01           #   $mov = 0x01 AND $ret = 0x01
@Invoke 0x03                #   user readline ($input)
@Add $input, $ret             #   $ret = $input + $ret
@Modify $mov $ret           #   $mov = $ret
@Route $ret                 #   write $ret in stack
@Invoke 0x04                #   write lis (last item stack)
@Execute jmp 0x05 0x02      #   jmp 0x05 (top) 0x02 (count)
#----------------------------------------------------------------