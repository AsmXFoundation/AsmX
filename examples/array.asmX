@set a2 Array [];  # Create an empty array called a2
@set a1 Array [];  # Create an empty array called a1

@call set::a1::push(2);  # Add the value 2 to the array a1
@call set::a1::push(4);  # Add the value 4 to the array a1

@call set::a2::push(4);  # Add the value 4 to the array a2
@call set::a2::push(2);  # Add the value 2 to the array a2

@call tion::print(set::a1);  # Print the contents of the array a1
@call tion::print(set::a2);  # Print the contents of the array a2

@call set::a1::size();  # Get the size of the array a1
@call print($return);  # Print the size of the array a1

@call set::a2::size();  # Get the size of the array a2
@call print($return);  # Print the size of the array a2

@call set::a1::at(-1);  # Get the value at the last index of the array a1
@call print($return);  # Print the value at the last index of the array a1

@call set::a1::view();  # View the contents of the array a1
