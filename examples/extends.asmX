@using method setType;
@using method getType;

@constructor __create__(self):
    @call print('Created animal');

@class Animal:
    @bind constructor  __create__;
    @bind method setType;

    @method setType(type):
        self.type type;

@class Dog extends Animal:
    @bind constructor  __create__;
    @bind method getType;

    @method getType():
        @call print(self.type)

@create class Dog dog; # Created Animal
@call class::dog();

@create class Dog siba; # Created Animal
@call class::siba();

@call dog->setType('Dog');
@call dog->getType(); # Dog

@call siba->setType('Siba Inu');
@call siba->getType(); # Siba Inu