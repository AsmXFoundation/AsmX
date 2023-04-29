#----------------------------------------------------------------
@Invoke 0x03            #   user readline
@Add $input, $input         #   $ret = $input + $input
@Invoke 0x04            #   write lis (last item stack)
#----------------------------------------------------------------