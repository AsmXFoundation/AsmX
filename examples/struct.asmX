# Define a struct for a person
@struct person:
    @property name string;  # Name of the person
    @property age int;  # Age of the person

# Define a struct for a position
@struct position:
    @property x int;  # x-coordinate
    @property y int;  # y-coordinate
    @property z int;  # z-coordinate

# Create a struct instance of position called Point
@create struct position Point;

@property struct::Point y 6;  # Set the y-coordinate of Point to 6

# Create a struct instance of person called tom
@create struct person tom;

@property struct::tom age 24;  # Set the age of tom to 24
@property struct::tom name "Tom";  # Set the name of tom to "Tom"

# Block for loop
@for name:
    @call print(struct::tom::age);  # Print the age of tom

@execute for name 0x03;  # Execute the for loop 3 times
@call print(struct::tom::name);  # Print the name of tom

@call print(struct::Point::z);  # Print the z-coordinate of Point

@execute jmp 0x01 0x02;  # Jump to a specific code location and execute it multiple times
                         # 0x01 - the number of rows to climb up, 0x02 - how many times to execute the code
