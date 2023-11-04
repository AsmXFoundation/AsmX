@set iterator Iterator {};

@set str string "Hello World!";
@set str2 string "Hello World";

@call set::iterator::slot(set::str); # Iterator { swap: void, slot: set::str, type: (Iterator), next: 0 }
@call tion::print(set::iterator);

@call set::str::size();
@set size i8 $return;

@call set::iterator::tile();
@call tion::print(set::iterator);
@execute jmp 0x02 set::size;

@call set::iterator::tile();
@call tion::print(set::iterator);

@call set::iterator::swap(set::str2); # Iterator { swap: set::str, slot: set::str, type: (Iterator), next: 0 }
@call tion::print(set::iterator);

@call set::iterator::view();