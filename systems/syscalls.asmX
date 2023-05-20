# ./systems/syscalls.asmX 
# SYSTEM CALLS
@Define EXIT    0x01
@Define READ    0x03
@Define WRITE   0x04
@Define LOG     0x05

@Define INVOKE_EXIT    0x01
@Define INVOKE_READ    0x03
@Define INVOKE_WRITE   0x04
@Define INVOKE_LOG     0x05

@Unit print(text):
    @Route [text]
    @Invoke 0x04


@unit input(text):
    @Modify $text [text]
    @Invoke 0x03
    @Ret $input


@Unit get_char(string: String, index: Int):
    @get [string][[index]]
    @Ret $get


@Unit is_Empty(symbol):
    @Execute eq [symbol] Empty
    @Ret $eq