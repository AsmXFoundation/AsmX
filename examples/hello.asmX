# Copyright (c) 2023
# GitHub (E5war5IT)
# ./examples/hello.asmX

# Set the string "Hello AsmX!" to the variable hello
@set hello String "Hello AsmX!";

# Write the value of hello to memory address 0x01
@memory hello  0x01

# Define the address of the memory as txt
@address 0x01 txt

# Route the value of txt to memory address 0x01
@Route  txt 0x01

# Set the stack pointer to the address 0x01
@Stack  0x01 

# Invoke system call 4 to write the value of hello
@Invoke 0x04
