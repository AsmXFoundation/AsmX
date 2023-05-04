# ./examples/software/number.asmX

@using label small_int;
@using label big_int;
@using label winner;

@using label start;
@using label int_enter;

@using subprogram start_v2;

@subprogram start_v2:
    @call input("Pls enter number: ")
    @Execute eq $urt set::randomize
    @Route $urt
    @Invoke 0x04
    @Execute jmp_equal winner
    @Execute cmp $urt set::randomize
    @Execute jmp_great big_int
    @Execute jmp_zero small_int

#----------------------------------------------------------------
@Execute rand 1 100;
@set randomize Int $math;
@call print($math);
@call print("Start game!");
@Execute goto_sbp start_v2;
#----------------------------------------------------------------


#----------------------------------------------------------------
# This labels for game
#----------------------------------------------------------------
@label start:
    @Execute goto_sbp start_v2;

@label int_enter:
    @Execute goto_sbp start_v2;

@label big_int:
    @call print("Big int!")
    @Execute goto int_enter;

@label small_int:
    @call print("Small int!")
    @Execute goto int_enter;

@label winner:
    @call print("Game winner!")
    @Invoke 0x01;
#----------------------------------------------------------------