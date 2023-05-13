#./examples/software/ttt.asmX
@import gpu;

@using subprogram start;
@using enviroment drawline_start;
@using enviroment drawline_mid;
@using enviroment drawline_end;

# Coords for game cells
# x - horizontal
# y - vertical
@set cell_x1_y1 Int 0;
@set cell_x2_y1 Int 0;
@set cell_x3_y1 Int 0;

@set cell_x1_y2 Int 0;
@set cell_x2_y2 Int 0;
@set cell_x3_y2 Int 0;

@set cell_x1_y3 Int 0;
@set cell_x2_y3 Int 0;
@set cell_x3_y3 Int 0;

@call print('Start game 'Tic Tac Toe'');
@Execute goto_sbp start;

@subprogram start:
    @Execute goto_env drawline_start
    @Execute goto_env drawline_mid
    @Execute goto_env drawline_end
    @call input("x: ")
    @set  user_position_1 Int $urt
    @call input("y: ")
    @set  user_position_1 Int $urt
    @Execute eq set::user_position_1 0x01
    @Execute eq set::user_position_1 0x02
    @Execute eq set::user_position_1 0x03

@enviroment drawline_start:
    @call print('╭───┬───┬───╮')

@enviroment drawline_mid:
        @call print('├───┼───┼───┤')

@enviroment drawline_end:
        @call print('╰───┴───┴───╯')