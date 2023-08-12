@constructor __init__(self):
    @call print('self');

@using method setPrice;
@using method getPrice;
@using method setName;

@class Abstract:
    @bind constructor __init__;
    @bind method setName;

    @method setName(string name):
        @call print(name);

@class Pricer:
    @bind constructor __init__;
    @bind method setPrice;

    @method setPrice(int price):
       self.price price;

@Class Shop extends (Abstract, Pricer)
    @bind constructor __init__;
    @bind method getPrice;

   @method getPrice():
      @call print(self.price);

@create class Shop shop;
@call class::shop();

@call shop->setPrice(200);
@call shop->getPrice();