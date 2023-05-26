# examples/software/hanoi_tower.asmX

@unit hanoi(n, from, to, work):
    @execute eq [n] 0x00;
    @execute exit $ret;
    @route '(';
    @invoke 0x05;
    @route [from];
    @invoke 0x05;
    @route '\u0020->\u0020';
    @invoke 0x05;
    @route [to];
    @invoke 0x05;
    @route ')';
    @invoke 0x05;
    @route '\u0020';
    @invoke 0x05;
    @sub [n] 0x01;
    @call hanoi($ret, [from], [work], [to]);
    @sub [n] 0x01;
    @call hanoi($ret, [work], [to], [from]);


@call hanoi(5, 1, 3, 2);