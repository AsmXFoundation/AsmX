# ./examples/unit.asmX
@Issue true;

@Unit  add5 (x: Int):
    @Add [x] , 0x05
    @Invoke 0x04

@call add5(6);
@call add5(9);