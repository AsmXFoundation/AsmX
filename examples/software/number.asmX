# ./examples/software/number.asmX
@import stream;

#----------------------------------------------------------------
@Execute rand 1 100;
@set randomize Int $math;
@call input("Please enter int: ");
@Execute cmp $urt 0x00;
@Execute jmp_great start;
@Execute jmp_zero small_int;
#----------------------------------------------------------------

#----------------------------------------------------------------
# This Software game
# Algorithm:
#                                num = $rand
#                                    |
#                           ---  num == $rand ---
#                   (no)    |                   |    (yes)
#                       ----                     ----
#               next_game                          winner
#                  |
#    (no)          |            (yes)
#        ----  num > $rand -----
#       |                       |
#    small_int               big_int
#
#
#
# Code:
#   print("Start game") :(start)*
#
#   print("number: ")   :(number)*
#   @Execute cmp $input 0x01;
#   @Execute jmp_great int_check;
#
#   label int_check:
#   if num == $rand     (@Execute eq num $rand)
#       winner()        (@Execute jmp_e winner)
#   else                (@Execute jmp_zero next_game) 
#
#       if num > $rand  (@Execute cmp num $rand) :(next_game)*
#           big_int()   (@Execute jmp_great big_int)
#           number()    (@Execute jmp_great number)
#       else            
#           small_int() (@Execute jmp_zero small_int)
#           number()    (@Execute jmp_great number)
#
#   winner(): print("winner"); @Invoke 0x01;
#   big_int(): print("bif_int");
#   small_int(): print("small_int");
#----------------------------------------------------------------


#----------------------------------------------------------------
# This labels for game
#----------------------------------------------------------------
@label start:
    @call print("Starting game!")
    @Execute jmp_label int_check;

@label int_enter:
    @call print("Please enter number: ")
    @call read()
    @Execute jmp_label int_check;

@label big_int:
    @call print("Big int!")

@label small_int:
    @call print("Small int!")

@label winner:
    @call print("Game winner!")

@label int_check:
    @Execute eq $urt $rdrand
    @Execute jmp_great winner
    @Execute cmp $input $rsrand
    @Execute jmp_great big_int
    @Execute jmp_zero small_int
    @Execute jmp_zero int_enter;
#----------------------------------------------------------------