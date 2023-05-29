@Unit print(text):
    @Route [text]
    @Invoke 0x04


@unit input(text):
    @Modify $text [text]
    @Invoke 0x03
    @Ret $input