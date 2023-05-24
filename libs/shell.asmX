#================================================================
# Shell API
#================================================================

@unit log(tag: String, colortag, message: String):
    @route '\u001b[1m';
    @invoke 0x05;
    @route '[';
    @invoke 0x05;
    @route [colortag];
    @invoke 0x05;
    @route [tag];
    @invoke 0x05;
    @route '\u001b[1m';
    @invoke 0x05;
    @route '\u001b[0m';
    @invoke 0x05;
    @route '\u001b[1m';
    @invoke 0x05;
    @route ']\u0020';
    @invoke 0x05;
    @route [message];
    @invoke 0x05;
    @route '\u001b[0m';
    @invoke 0x05;
    @ret true;