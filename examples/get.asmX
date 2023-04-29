# ./examples/get.asmX
@set text String "This text!"

@Get set::text; # or `set::text`
@Get kernelos::date::time;
@Route $get
@Invoke 0x04