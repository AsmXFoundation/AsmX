# Copyright (c) 2023
# GitHub (E5war5IT)
# ./examples/hello.asmX
@set hello String "Hello-AsmX!";

@memory hello  0x01     #   swrite to memory
@address 0x01 txt       #   define address of the memory

@Route  txt 0x01        #   route
@Stack  0x01            #   stack set point with address
@Invoke 0x04            #   write lis (last item stack)

@Invoke 0x80            #   call kernel