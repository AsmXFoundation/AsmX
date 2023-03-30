#----------------------------------------------------------------
@Equ 0x32, 0x32         #   $ret = true
@Route $ret             #   adding the result of the $ret register to the stack
@Invoke 0x04            #   write lis (last item stack)
#----------------------------------------------------------------