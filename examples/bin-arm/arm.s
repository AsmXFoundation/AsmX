.global _start

.data
	name: .ascii "Mask"
	isAge: db 1
	rating: .float 10.0
	age: .word 51
	isOnline: db 0

.rodata
	INVOKE_LOG: .word 5
	INVOKE_WRITE: .word 4
	INVOKE_READ: .word 3
	INVOKE_EXIT: .word 1
	LOG: .word 5
	WRITE: .word 4
	READ: .word 3
	EXIT: .word 1
	FALSE: db 0
	TRUE: db 1
	RATING: .float 56.24

.text
_start:
	mov $arg0 #0
	mov $arg1 #0
	mov $arg2 #0
	mov $arg3 #0
	mov $arg4 #0
	mov $arg5 #0
	mov $offset #0
	mov $name #0
	mov $math #0
	mov $eq #0
	mov $seq #0
	mov $cmp #0
	mov $xor #0
	mov $and #0
	add $ret #10 #0
	sub $ret #-10 #0
	mul $ret #0.2 #1
	div $ret #0.2 #1
	orr $ret, #13, #43

stop: b start