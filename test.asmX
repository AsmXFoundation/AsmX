@Issue false;

@Unit  add5(x: Int):
    @Add [x] , 0x05
    @Route $ret
    @Invoke 0x04

@call add5(6);
@call add5(9);

@set age Int 16;