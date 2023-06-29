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


#----------------------------------------------------------------
@Unit pow(x: Int, n: Int):  # create unit from x and n and return the result of the $ret register
    @Execute mov 0x01       # $mov = 0x01 AND $ret = 0x01
    @mul $ret [x]           # $ret = $ret * [x] -> $ret *= [x]
    @Execute jmp 0x01 [n]   # jmp 0x01 (top) [n] (count)
    @Ret $ret               # return $ret
#----------------------------------------------------------------


#----------------------------------------------------------------
@unit square(x: Int):
    @mul [x], [x]
    @ret $ret
#----------------------------------------------------------------