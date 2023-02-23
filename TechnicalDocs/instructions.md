# Instructions
```js
    '@Invoke', // invoke method or function on address
    '@Route', // route with parameters (name or address)
    '@memory', // write to memory
    '@address', // write to address
    '@Stack', // stack: push or pop, read from memory or select items from bank memory
    '@Issue', // Issue: define issue status (of or on)
    '@set', // set variable value

    '@unit', // create function
    '@ref', // referal to model
    '@get', // read from memory
    '@Shift'// shift
```


____
```
@Issue status
```
 status: 'on' or 'off'
____

```m
@set $name, [<Type>], value
```
____
```
@Invoke Address
```
Address  - `0x01` and more
____
```
@memory $name Address  # write to memory
```
____
```
@address Address $name
```
____
```
@Ret [ SP | LP | $arg(0-5) | $name | default: $Stack[last] ]
```
>**SP** - Stack Pointer <br />
>**LP** - Link Registers <br />
> **deafault $Stack[last]** - Stack last value in stacktracer
____
```
@Route AddressName pointAddress
```
____
```
@Stack pointAddress
```
____
```
@Add $arg0 $arg1 $arg2? $arg3? $arg4? $arg5? # added ($arg0 + $arg1 ...)
```
____
```
@Sub $arg0 $arg1 $arg2? $arg3? $arg4? $arg5? # subbed ($arg0 - $arg1 ...)
```
____
> $arg - these are the parameters to which you have the right to access them. <br/>
> Address - `0x00` or more <br/>
> *Type* - the type `@set` instructions


| arch	| syscall NR | return | arg0 | arg1	| arg2 | arg3 | arg4 | arg5 |
|-------|------------|--------|------|------|------|------|------|------|
|  arm	|    r7	     |   r0	  |  r0	 |  r1	|  r2  |  r3  |	 r4	 |  r5  |
| arm64	|    x8	     |   x0	  |  x0	 |  x1	|  x2  |  x3  |  x4	 |  x5  |
|  x86  |    eax	 |   eax  |	 ebx |  ecx |  edx |  esi |  edi |	ebp |
|x86_64 |	 rax	 |   rax  |  rdi |	rsi |  rdx |  r10 |  r8	 |  r9  |
| AsmX  |	 @Invoke |   @Ret |  $arg0  |  $arg1  |  $arg2  |  $arg3  |  $arg4  |  $arg5  | 