#================================================================
# Import modules
#================================================================
@import "./systems/syscalls/syscalls.asmX";
@import "./systems/registers.asmX";
@import "./systems/io.asmX";
@import "./systems/boolean.asmX";
@import "./systems/types/units/string.asmX";
@import "./systems/types/units/int.asmX";
#================================================================

@tion sizeof(list):
    @execute sizeof [list];
    @ret $ret;

@tion length(list):
    @execute sizeof [list];
    @ret $ret;