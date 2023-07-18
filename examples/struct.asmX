@struct person:
    @property name string;
    @property age int;

@struct position:
    @property x int;
    @property y int;
    @property z int;

@create struct position Point;
@property struct::Point y 6;

@create struct person tom;
@property struct::tom age  24;
@property struct::tom name "Tom";

@for name:
    @call print(struct::tom::age);

@execute for name 0x03;
@call print(struct::tom::name);

@call print(struct::Point::z);
@execute jmp 0x01 0x02;