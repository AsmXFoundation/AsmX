# Set the value of `str` variable to 'Hello World!'
@set str String 'Hello World!';

# Call the `print` function and pass `str` variable as an argument
@call print(set::str);

# Call the `slice` method of `str` variable, slice the string from index 0 to -1
@call set::str::slice(0, -1);
# Store the return value in the `$return` variable
@call print($return);

# Call the `size` method of `str` variable
@call set::str::size();
@call print($return);

# Set the value of `str2` variable to 'hello world!'
@set str2 String 'hello world!';

# Call the `title` method of `str2` variable
@call set::str2::title();
@call print($return);

# Call the `repeat` method of `str2` variable, repeat the string 2 times
@call set::str2::repeat(2);
@call print($return);

# Call the `reverse` method of `str2` variable
@call set::str2::reverse();
@call print($return);

# Call the `has` method of `str2` variable, check if it has the substring 'hello'
@call set::str2::has('hello');
@call print($return);

# Call the `index` method of `str2` variable, get the index of the character '!'
@call set::str2::index('!');
@call print($return);

# Call the `get` method of `str2` variable, get the character at index 11
@call set::str2::get(11);
@call print($return);

# Call the `hasSpace` method of `str2` variable, check if it has any whitespace
@call set::str2::hasSpace();
@call print($return);

# Call the `hasInt` method of `str2` variable, check if it has any integers
@call set::str2::hasInt();
@call print($return);

# Call the `hasChar` method of `str2` variable, check if it has any characters
@call set::str2::hasChar();
@call print($return);

# Call the `hasSymbol` method of `str2` variable, check if it has any symbols
@call set::str2::hasSymbol();
@call print($return);
