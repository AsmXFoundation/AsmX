.text
.global start

start:
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

stop: b start