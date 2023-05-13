@import gpu;
@call print('\t Hello')
@call gpu_clear()
@call gpu_text_bold()
@call print('\tHello World!')
@call gpu_text_reset()
@call gpu_cursor_top()
@call print('Wow!')