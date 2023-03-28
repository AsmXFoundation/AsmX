@Unit printf(string):
    @Route [strings]
    @Invoke 0x04


@Unit print(string):
    @Route [strings]
    @Invoke 0x04


# read user data
# @ret String
# @api public
@Unit read():
    @Invoke 0x03
    @Ret $out