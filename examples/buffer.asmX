# Create a new buffer object
@set buf Buffer {};

# Allocate memory for the buffer with a size of 20 bytes
@call set::buf::alloc(20);

# Push the value 0x04 into the buffer
@call set::buf::push(0x04); # Buffer { 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }

# Push the string 'AsmX' into the buffer
@call set::buf::push('AsmX'); # Buffer { 0, 0, 0, 4, 27, 41, 73, 6d, 58, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }

# Push the character 'A' into the buffer
@call set::buf::push('A'); # Buffer { 0, 0, 0, 4, 27, 41, 73, 6d, 58, 27, 27, 41, 27, 0, 0, 0, 0, 0, 0, 0 }

# Print the contents of the buffer
@call tion::print(set::buf);

# View the contents of the buffer (in a human-readable format)
@call set::buf::view();

# Get the size of the buffer
@call set::buf::size();

# Print the size of the buffer
@call print($return); # 20
