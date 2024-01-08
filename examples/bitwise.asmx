# Shift the value 0x05 to the left by 1 bit
@bitwise shl 0x05 1;
@call print($ret);

# Shift the value 0x05 to the right by 2 bits
@bitwise shr 0x05 2;
@call print($ret);

# Rotate the value 0x05 to the left by 1 bit
@bitwise rol 0x05 1;
@call print($ret);

# Rotate the value 0x05 to the right by 2 bits
@bitwise ror 0x05 2;
@call print($ret);

# Rotate the value 0x05 to the right by 2 bits (typo: should be 'ror' instead of 'rof')
@bitwise ror 0x05 2;
@call print($ret);

