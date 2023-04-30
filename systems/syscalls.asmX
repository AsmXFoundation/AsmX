# ./systems/syscalls.asmX 
# SYSTEM CALLS
@Define EXIT    0x01
@Define READ    0x03
@Define WRITE   0x04

@Define INVOKE_EXIT    0x01
@Define INVOKE_READ    0x03
@Define INVOKE_WRITE   0x04


@Unit print(text):
    @Route [text]
    @Invoke 0x04

@Unit text_for_read(text):
    @Modify $text [text]