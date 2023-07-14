@unit asmx_update():
    @modify $cmd 'node ./kernel.js';
    @modify $cmdargs 'asmx-cli update';
    @invoke 0x08;


@unit asmx_doctor():
    @modify $cmd 'node ./kernel.js';
    @modify $cmdargs 'asmx-cli doctor -ls';
    @invoke 0x08;


@unit asmx_cli_config():
    @modify $cmd 'node ./kernel.js';
    @modify $cmdargs 'asmx-cli config -ls';
    @invoke 0x08;


@unit asmx_cli_usage():
    @modify $cmd 'node ./kernel.js';
    @modify $cmdargs 'asmx-cli usage';
    @invoke 0x08;
