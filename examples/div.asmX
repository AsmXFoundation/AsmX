#----------------------------------------------------------------
@Div 0x50, 0xA, 0x08        #   $ret = 0x50 / 0xA / 0x8 = 1
@Route $ret                 #   adding the result of the $ret register to the stack
@Invoke 0x04                #   write lis (last item stack)
#----------------------------------------------------------------