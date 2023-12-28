# comment. AsmX programming language

# Define the first task
@task first:
    @call print('task 1');

# Define the second task
@task second:
    @call print('task 2');
    @set three i8 255;

# Define the third task
@task three:
    @call print('task 3');
    @call print(set::three);

# Define the First todolist
@todolist First:
    @bind task first;
    @bind task second;
    @bind task first;

# Define the Second todolist
@todolist Second:
    @bind task second;
    @bind task first;
    @bind task second;
    @bind task first;
    @bind task three;

# Create an instance of the First todolist with the first task
@create todolist First first;

# Run the first task in the First todolist
@call todolist::first::run(); # task 1
@call todolist::first::run(); # task 2

# View the contents of the First todolist
@call todolist::first::view();

# Create an instance of the Second todolist with the second task
@create todolist Second second;

# View the contents of the Second todolist
@call todolist::second::view();

# Run the tasks in the Second todolist in serial order
@call todolist::second::runSerial();

# View the contents of the Second todolist
@call todolist::second::view();
