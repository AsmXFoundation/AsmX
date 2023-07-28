@Unit print(text):
    @Route [text]
    @Invoke 0x04

@tion print(message):
    @route [message];
    @invoke 0x02;

@unit log(message):
    @route [message];
    @invoke 0x02;

@unit input(text):
    @Modify $text [text]
    @Invoke 0x03
    @Ret $input