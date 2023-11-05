# @set vec Vector 2;
@set vec Vector {};

@call set::vec::push_back(5);
@call set::vec::view();

@call set::vec::push_back(2);
@call set::vec::view();

@call set::vec::swap(1, 9);
@call set::vec::view();

@call set::vec::size();
@call print($return);

@call set::vec::capacity();
@call print($return);

@call set::vec::at(1);
@call print($return);
@call set::vec::at(9);
@call print($return);

@call set::vec::pop_back();
@call set::vec::pop_back();
@call set::vec::pop_back();
@call set::vec::view();
