@unit ml_linear(m: Int, b: Int, x: Int):
    @mul [m], [x];
    @add $ret, [b];
    @ret $ret;