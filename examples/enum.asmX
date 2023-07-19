@enum example:
    @property one 1;
    @property two;

@create enum example Example;
@call print(enum::Example::two);
@call print("=====");

@enum week:
    @property Monday 1;
    @property Tuesday;
    @property Wednesday;
    @property Thursday;
    @property Friday;
    @property Saturday;
    @property Sunday;

@create enum week day;
@property enum::day Monday 8;
@call print(enum::day::Monday);
@call print(enum::day::Tuesday);
@call print(enum::day::Wednesday);
@call print(enum::day::Thursday);
@call print(enum::day::Friday);
@call print(enum::day::Saturday);
@call print(enum::day::Sunday);
