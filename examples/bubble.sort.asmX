# Initialize an array
@set array Array [];

# Push the random values into the array
@execute rand 15 1;
@call set::array::push($ret);
@execute jmp 0x02 0x05;

# Define a label for swapping array elements
@label swap:
    @sub $count 0x01;
    @call set::array::swap($ret, set::nextItem);
    @call set::array::swap($count, set::item);

# Loop through array to compare and swap elements
@for minor:
    @sub $count 0x01;
    @call set::array::at($ret);
    @set item Int $return;
    @call set::array::at($count);
    @set nextItem Int $return;
    @execute cmp set::item set::nextItem;
    @execute jmp_great swap;

# Nested loop to iterate through the array
@for major:
    @execute for minor set::size;

# Get the size of the array
@call set::array::size();
@sub $return 0x01;
@set size Int $ret;

# Perform the sorting of the array using the defined loops
@execute for major set::size;

# View the sorted array
@call set::array::view();
