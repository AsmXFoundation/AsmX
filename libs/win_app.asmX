@unit run_calc():
    @modify $cmd 'calc.exe';
    @invoke 0x08;


@unit run_notepad():
    @modify $cmd 'notepad.exe';
    @invoke 0x08;


@unit run_explorer():
    @modify $cmd 'explorer.exe';
    @invoke 0x08;


@unit run_charmap():
    @modify $cmd 'charmap.exe';
    @invoke 0x08;


@unit run_paint():
    @modify $cmd 'mspaint.exe';
    @invoke 0x08;


@unit run_task_manager():
    @modify $cmd 'taskmgr';
    @invoke 0x08;


@unit run_media_player():
    @modify $cmd 'wmplayer';
    @invoke 0x08;


@unit run_powershell():
    @modify $cmd 'powershell';
    @invoke 0x08;


@unit run_cmd():
    @modify $cmd 'cmd';
    @invoke 0x08;
