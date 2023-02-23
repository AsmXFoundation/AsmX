class Color {}

Object.defineProperty(Color, 'RESET' ,{ value:  "\x1b[0m" });
Object.defineProperty(Color, 'BRIGHT' ,{ value:  "\x1b[1m" });
Object.defineProperty(Color, 'DIM' ,{ value:  "\x1b[2m" });
Object.defineProperty(Color, 'UNDERSCORE' ,{ value:  "\x1b[4m" });
Object.defineProperty(Color, 'BLINK' ,{ value:  "\x1b[5m" });
Object.defineProperty(Color, 'REVERSE' ,{ value:  "\x1b[7m" });
Object.defineProperty(Color, 'HIDDEN' ,{ value:  "\x1b[8m" });

Object.defineProperty(Color, 'FG_BLACK' ,{ value:  "\x1b[30m" });
Object.defineProperty(Color, 'FG_RED' ,{ value:  "\x1b[31m" });
Object.defineProperty(Color, 'FG_GREEN' ,{ value:  "\x1b[32m" });
Object.defineProperty(Color, 'FG_YELLOW' ,{ value:  "\x1b[33m" });
Object.defineProperty(Color, 'FG_BLUE' ,{ value:  "\x1b[34m" });
Object.defineProperty(Color, 'FG_MAGENTA' ,{ value:  "\x1b[35m" });
Object.defineProperty(Color, 'FG_CYAN' ,{ value:  "\x1b[36m" });
Object.defineProperty(Color, 'FG_WHITE' ,{ value:  "\x1b[37m" });
Object.defineProperty(Color, 'FG_GRAY' ,{ value:  "\x1b[90m" });


Object.defineProperty(Color, 'BG_BLACK' ,{ value:  "\x1b[40m" });
Object.defineProperty(Color, 'BG_RED' ,{ value:  "\x1b[41m" });
Object.defineProperty(Color, 'BG_GREEN' ,{ value:  "\x1b[42m" });
Object.defineProperty(Color, 'BG_YELLOW' ,{ value:  "\x1b[43m" });
Object.defineProperty(Color, 'BG_BLUE' ,{ value:  "\x1b[44m" });
Object.defineProperty(Color, 'BG_MAGENTA' ,{ value:  "\x1b[45m" });
Object.defineProperty(Color, 'BG_CYAN' ,{ value:  "\x1b[46m" });
Object.defineProperty(Color, 'BG_WHITE' ,{ value:  "\x1b[47m" });
Object.defineProperty(Color, 'BG_GRAY' ,{ value:  "\x1b[100m" });

module.exports = Color;