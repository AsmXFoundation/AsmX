@import shell;
@import gpu;

#================================================================
# Components for Compiler
#================================================================
@import "./bin/bash/datalist.asmX";
@import "./bin/bash/generate.asmX";
#================================================================


@using subprogram startlogger;
@using subprogram finnishlogger;

@execute goto_sbp startlogger;
@execute goto_sbp finnishlogger;

@subprogram startlogger:
    @call gpu_text_bold();
    @route '[';
    @invoke 0x05;
    @route kernelos::date::time;
    @invoke 0x05;
    @route ']';
    @invoke 0x05;
    @call log("Compiler\u0020Log", YELLOW, "Compiler\n");
    @call print(COMPILER_GENERATOR_CODE_VERSION);

@subprogram finnishlogger:
    @call gpu_text_bold();
    @route '[';
    @invoke 0x05;
    @route kernelos::date::time;
    @invoke 0x05;
    @route ']';
    @invoke 0x05;
    @call log("Compiler\u0020Log", YELLOW, "Compiler\u0020Finish!\n");