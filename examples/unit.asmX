# ./examples/unit.asmX
@import stream;

@Unit  matchCoords(x, y: Int, z):
    @Add [x] , [y],[z]
    @Ret $ret


@call matchCoords(4, 5, 4)
@Route $urt
@Invoke 0x04

@call read()
