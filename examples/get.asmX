# ./examples/get.asmX
@set text String "This text!"

@Get global::set::text; # or `set::text`
@Route $get
@Invoke 0x04