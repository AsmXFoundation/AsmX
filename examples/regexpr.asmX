# Set the regular expression pattern
@set regex RegExpr '/[a-zA-Z][a-zA-Z0-9_]+/g';

# Test if the given string matches the pattern
@call set::regex::test('asm');
@call print($return);   # Output: true

@call set::regex::test('43');
@call print($return);   # Output: false

# Find all matches of the pattern in the given string
@call set::regex::match('first second');
@call print($return); # Output: [ 'first', 'second' ]

# Find all matches of the pattern in the given string and return as an array
@call set::regex::matchAll('first second');

# Check if the returned value from matchAll is an instance of an object
@execute instanceof list::$return Object;
@call print($ret); # Output: true