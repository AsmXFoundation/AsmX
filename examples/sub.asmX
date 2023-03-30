#----------------------------------------------------------------
@Sub 0x32, 0x05,0x05        #   $ret = 50 - 5 - 5 = 40
@Route $ret                 #   adding the result of the $urt register to the stack
@Invoke 0x04                #   write lis (last item stack)
#----------------------------------------------------------------