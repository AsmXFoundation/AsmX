@unit inc(x: Int):
    @add [x] 0x01;
    @ret $ret;

@unit dec(x: Int):
    @sub [x] 0x01;
    @ret $ret;