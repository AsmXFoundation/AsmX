# Todolist & task

New structures `@task` and `@todolist` have been added to the AsmX programming language. These structures allow for the organization and execution of tasks in a sequential manner.

## Example Usage

Here is an example usage of the new structures:

```asmx
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
```

## New Structures

### `@task`

The `@task` structure is used to define individual tasks. A task can consist of one or more instructions. Each task must have a unique name.

Example:

```asmx
@task first:
    @call print('task 1');
```

### `@todolist`

The `@todolist` structure is used to create a list of tasks. Tasks can be bound to a todolist in any order. A todolist can contain multiple instances of the same task.

Example:

```asmx
@todolist First:
    @bind task first;
    @bind task second;
    @bind task first;
```

## Execution and Manipulation of Todolists

### Creating an Instance of a Todolist

To create an instance of a todolist, use the `@create todolist` command followed by the todolist name and an instance name. The instance name can be any valid identifier.

Example:

```asmx
@create todolist First first;
```

### Running a Task in a Todolist

To run a task in a todolist, use the `@call` command followed by the todolist name, instance name, and the `run()` function.

Example:

```asmx
@call todolist::first::run(); # task 1
```

### Viewing the Contents of a Todolist

To view the contents of a todolist, use the `@call` command followed by the todolist name, instance name, and the `view()` function.

Example:

```asmx
@call todolist::first::view();
```

### Running Tasks in a Todolist in Serial Order

To run the tasks in a todolist in serial order, use the `@call` command followed by the todolist name, instance name, and the `runSerial()` function.

Example:

```asmx
@call todolist::second::runSerial();
```
