#----------------------------------------------------------------
@Add 0x32, 0x23, 0x05       #   $ret 0x32 + 0x23 + 0x05 = 90
@Route $ret                 #   adding the result of the $ret register to the stack
@Invoke 0x04                #   write lis (last item stack)
#----------------------------------------------------------------