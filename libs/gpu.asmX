@define BLACK "\u001B[30m";
@define RED "\u001B[31m";
@define GREEN "\u001B[32m";
@define YELLOW "\u001B[33m";
@define BLUE "\u001B[34m";
@define MAGENTA "\u001B[35m";
@define CYAN "\u001B[36m";
@define WHITE "\u001B[37m";
@define RESET "\u001B[0m";

@define BG_BLACK "\u001B[40m";
@define BG_RED "\u001B[41m";
@define BG_GREEN "\u001B[42m";
@define BG_YELLOW "\u001B[43m";
@define BG_BLUE "\u001B[44m";
@define BG_MAGENTA "\u001B[45m";
@define BG_CYAN "\u001B[46m";
@define BG_WHITE "\u001B[47m";

@Unit gpu_cursor_top():
    @call print('\u001b[1A')

@Unit gpu_cursor_button():
    @call print('\u001b[1B')

@Unit gpu_cursor_right():
    @call print('\u001b[1C')

@Unit gpu_cursor_left():
    @call print('\u001b[1D')

@Unit gpu_clear():
    @call print('\u001b[2J')

@Unit gpu_text_bold():
    @call print('\u001b[1m')

@Unit gpu_text_reset():
    @call print('\u001b[0m')