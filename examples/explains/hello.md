 ## AsmX Hello World Program

This program demonstrates the basics of the AsmX assembly language by writing the string "Hello AsmX!" to the console.

### Step-by-Step Explanation

The program begins by setting the string "Hello AsmX!" to the variable `hello` using the `@set` directive. This directive assigns a string value to a variable.

```asmX
@set hello String "Hello AsmX!";
```

Next, the program writes the value of `hello` to memory address `0x01` using the `@memory` directive. This directive writes a value to a specified memory address.

```asmX
@memory hello 0x01;
```

The program then defines the address of the memory as `txt` using the `@address` directive. This directive assigns a name to a memory address.

```asmX
@address 0x01 txt;
```

The program then routes the value of `txt` to memory address `0x01` using the `@Route` directive. This directive routes the value of a variable or memory address to a specified memory address.

```asmX
@Route txt 0x01;
```

The program then sets the stack pointer to the address `0x01` using the `@Stack` directive. This directive sets the stack pointer to a specified memory address.

```asmX
@Stack 0x01;
```

Finally, the program invokes system call 4 to write the value of `hello` to the console using the `@Invoke` directive. System call 4 is a built-in function that writes a string to the console.

```asmX
@Invoke 0x04;
```

When the program is executed, it will write the string "Hello AsmX!" to the console.
