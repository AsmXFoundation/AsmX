@unit asmxos_start():
    @modify $cmd 'node ./kernel.js asmx-cli';
    @modify $cmdargs 'os AsmXOS';
    @invoke 0x08;
