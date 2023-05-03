# ./examples/software/number.asmX
@import stream;

@using label start;
@using label small_int;
@using label big_int;
@using label int_check;
@using label winner;
@using label int_enter;

@using subprogram v2;

@subprogram v2:
    @call input("Pls enter number: ")
    @Execute eq $urt $math
    @Route $urt
    @Invoke 0x04
    @Execute jmp_equal winner
    @Execute cmp $urt set::randomize
    @Execute jmp_great big_int
    @Execute jmp_zero small_int
    @Execute jmp_zero int_enter

#----------------------------------------------------------------
@Execute rand 1 100;
@set randomize Int $math;

@call print($math);
@set user_input Int $math;
@Execute goto_sbp v2;

#@call input("Please enter int: ");
#@Execute cmp $urt 0x00;
#@Execute jmp_great start;
#@Execute jmp_zero small_int;
#----------------------------------------------------------------


#----------------------------------------------------------------
# This labels for game
#----------------------------------------------------------------
@label start:
    #@call print("Starting game!")
    #@Execute goto int_check;
    @Execute goto_sbp v2;

@label int_enter:
    @Execute goto_sbp v2;

@label big_int:
    @call print("Big int!")

@label small_int:
    @call print("Small int!")

@label winner:
    @call print("Game winner!")
    @Invoke 0x01

@label int_check:
    @Execute eq $urt set::user_input
    @Execute jmp_equal winner
    @Execute cmp $input set::user_input
    @Execute jmp_great big_int
    @Execute jmp_zero small_int
    @Execute jmp_zero int_enter;
#----------------------------------------------------------------