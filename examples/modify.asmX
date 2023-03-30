#----------------------------------------------------------------
@Modify $mov 0x05       #   $mov = 0x05
@Route $mov             #   adding the result of the $mov register to the stack
@Invoke 0x04            #   write lis (last item stack)
#----------------------------------------------------------------