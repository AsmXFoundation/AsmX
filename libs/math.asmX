################################################################################################
#                                COPYRIGHT (c) 2023
#        LISCENSE (c) AsmX (https://github.com/langprogramming-AsmX/AsmX/blob/main/LICENSE)
#                                LIBRARY NAME (math.asmX)
################################################################################################
@Define     MATH_E          2.718281828459045
@Define     MATH_LN10       2.302585092994046
@Define     MATH_LN2        0.6931471805599453
@Define     MATH_LOG10E     0.4342944819032518
@Define     MATH_LOG2E      1.4426950408889634
@Define     MATH_PI         3.141592653589793
@Define     MATH_SQRT1_2    0.7071067811865476
@Define     MATH_SQRT2      1.4142135623730951
################################################################################################


@Unit add(a, b):
    @Add [a], [b]
    @Ret $ret

@Unit sub(a, b):
    @Sub [a, b]
    @Ret $ret

@Unit mod(a, b):
    @Mod [a, b]
    @Ret $ret

@Unit inc(x: int)
    @Add [x], 0x01
    @Ret $ret

@Unit dec(x: int)
    @Sub [x], 0x01
    @Ret $ret

@Unit div(a, b):
    @Div [a, b]
    @Ret $ret

@Unit ceil(x: Int):
    @Execute ceil [x]
    @Ret $ret

@Unit floor(x: Int):
    @Execute floor [x]
    @Ret $ret

@Unit sqrt(x: Int):
    @Execute sqrt [x]
    @Ret $ret

@Unit exp(x: Int):
    @Execute exp [x]
    @Ret $ret

@Unit log(x: Int):
    @Execute log [x]
    @Ret $ret
    
@Unit sin(x: Int):
    @Execute sin [x]
    @Ret $ret

@Unit log10(x: Int):
    @Execute log10 [x]
    @Ret $ret

@Unit cos(x: Int):
    @Execute cos [x]
    @Ret $ret

@Unit tan(x: Int):
    @Execute tan [x]
    @Ret $ret

@Unit acos(x: Int):
    @Execute acos [x]
    @Ret $ret

@Unit atan(x: Int):
    @Execute atan [x]
    @Ret $ret

@Unit round(x: Int):
    @Execute round [x]
    @Ret $ret

@Unit atan2(x: Int):
    @Execute atan2 [x]
    @Ret $ret