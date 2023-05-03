@Add 5, 4

@using label labelname;
@using enviroment envname;
@Execute goto_env envname;

@enviroment envname:
    @set hello String 'This enviroment!'
    @Route set::hello
    @Invoke 0x04


@label labelname:
    @Add 0x04, 0x05

@Execute goto labelname;
@Route $ret
@Invoke 0x04

@subprogram program:
    @set hello String "This program!"
    @Route set::hello
    @Invoke 0x04

@Execute goto_sbp program;
@Route set::hello
@invoke 0x04