# Copyright (c) 2023
# GitHub (E5war5IT)
@Issue false; # issue on

@set age  14; 
@set name String "E5war5"; 
@set email String "E5war5@gmail.com" # sets
@set isAge Bool true  # declaration the age

@memory age  0x01  # write to memory
@memory name 0x03

@address 0x01 ageAddress # define address of the memory
@address 0x03 nameAddress

@Add 0x32, 0x23, 0x05
@Route $ret
@Invoke 0x04

# 80 / 10 / 8 -> 1
@Div 0x50, 0xA, 0x08
@Invoke 0x04

@Mod 0x32, 0x05
@Invoke 0x04

@Equ 0x32, 0x32
@Route $ret
@Invoke 0x04

@Route  ageAddress 0x05 # route
@Stack  0x05   # stack set point with address
@Invoke 0x04

@Invoke 0x03
@Add $out, $out
@Invoke 0x04

@Route  nameAddress 0x01
@Stack  0x01
@Invoke 0x04 # (0x04 - 4) system call write

@Invoke 0x80 # call kernel