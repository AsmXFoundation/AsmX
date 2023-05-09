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