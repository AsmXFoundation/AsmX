# Define an iterator object
@set iterator Iterator {};

# Define two string variables
@set str string "Hello World!";
@set str2 string "Hello World";

# Call the 'slot' method of the 'set::iterator' object and pass 'set::str' as an argument
# This will set the 'slot' attribute of the 'set::iterator' object to 'set::str'
@call set::iterator::slot(set::str); # Iterator { swap: void, slot: set::str, type: (Iterator), next: 0 }

# Call the 'print' method of the 'tion' object and pass the 'set::iterator' object as an argument
# This will print the value of the 'set::iterator' object
@call tion::print(set::iterator);

# Call the 'size' method of the 'set::str' object
# This will return the size of the 'set::str' object
@call set::str::size();
@set size i8 $return;

# Call the 'tile' method of the 'set::iterator' object
# This will update the 'next' attribute of the 'set::iterator' object
@call set::iterator::tile();
@call tion::print(set::iterator);

# Execute a jump instruction to the address '0x02' if the value of 'set::size' is true
@execute jmp 0x02 set::size;

# Call the 'tile' method of the 'set::iterator' object
# This will update the 'next' attribute of the 'set::iterator' object
@call set::iterator::tile();
@call tion::print(set::iterator);

# Call the 'swap' method of the 'set::iterator' object and pass 'set::str2' as an argument
# This will swap the 'slot' attribute of the 'set::iterator' object with 'set::str2'
@call set::iterator::swap(set::str2); # Iterator { swap: set::str, slot: set::str, type: (Iterator), next: 0 }
@call tion::print(set::iterator);

# Call the 'view' method of the 'set::iterator' object
# This will return the current view of the 'set::iterator' object
@call set::iterator::view();