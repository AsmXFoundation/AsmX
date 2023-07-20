@using method get_descriptive_name;
@using method read_odometer;

@unit printc(msg):
    @route [msg];
    @invoke 0x05;

@constructor __init__(self, string model, string make, int year):
    self.odometer_reading 0;

@class Car:
    @bind constructor __init__;
    @bind method get_descriptive_name;
    @bind method read_odometer;

    @method get_descriptive_name():
        @call printc(self.year)
        @call printc(' ')
        @call printc(self.make)
        @call printc(' ')
        @call printc(self.model)

    @method read_odometer():
        @call printc('This car is ')
        @call printc(self.odometer_reading)
        @call printc(' miles on it.')

@create class Car tesla;
@call class::tesla('Tesla', 'ModelS', 2012);

@call tesla->get_descriptive_name();

@call print('');
@call tesla->read_odometer();

@call print('');
@property class::tesla odometer_reading 23;
@call tesla->read_odometer();
@call print('');