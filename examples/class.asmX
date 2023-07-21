@using method get_descriptive_name;
@using method read_odometer;
@using method update_odometer;

@unit printc(msg):
    @route [msg];
    @invoke 0x05;

@constructor __init__(self, string model, string make, int year):
    self.is_update_odometer false;
    self.odometer_reading 0;

@class Car:
    @bind constructor __init__;
    @bind method get_descriptive_name;
    @bind method read_odometer;
    @bind method update_odometer;

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


    @method update_odometer(int mileage):
        self.odometer_reading mileage;
        self.is_update_odometer true;
        @call print('Update mileage is a car!');


@create class Car tesla;
@call class::tesla('Tesla', 'ModelS', 2012);

@call print(class::tesla::is_update_odometer);
@call tesla->get_descriptive_name();
@call print('');

@call tesla->read_odometer();
@call print('');

@call tesla->update_odometer(23);
@call tesla->read_odometer();
@call print('');

@call tesla->update_odometer(45);
@call tesla->read_odometer();
@call print('');

@call print(class::tesla::is_update_odometer);

@call print('================================');

@create class Car supra;
@call class::tesla('Supra', 'Supra', 2012);

@call print(class::supra::is_update_odometer);
@call print('');

@create class Car supra;
@call class::tesla('Supra', 'Supra', 2012);

@call tesla->read_odometer();
@call print('');

@call tesla->update_odometer(203);
@call tesla->read_odometer();
@call print('');

@call print(class::tesla::is_update_odometer);