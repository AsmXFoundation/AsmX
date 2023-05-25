# examples/software/hanoi_tower.asmX

@unit hanoi(n, from, to, work):
    @execute eq [n] 1;
    @execute exit $ret;
    @sub [n] 0x01;
    @call hanoi($ret, [from], [work], [to]);
    @route [from];
    @invoke 0x05;
    @route '->';
    @invoke 0x05;
    @route [to];
    @invoke 0x05;
    @sub [n] 0x01;
    @call hanoi($ret, [work], [to], [from]);


@call hanoi(4, 1, 3, 2);