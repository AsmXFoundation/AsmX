@unit make_dir(name: String):
    @modify $cmd 'mkdir';
    @modify $cmdargs [name];
    @invoke 0x08;


@unit echo(message: String):
    @modify $cmd 'echo';
    @modify $cmdargs [message];
    @invoke 0x08;


@unit input(message: String):
    @modify $cmd 'read -p';
    @modify $cmdargs [message];
    @invoke 0x08;
