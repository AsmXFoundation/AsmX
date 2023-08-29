@set hello String "This App! (v3)";
@route set::hello;
@invoke 0x04;

@set hello2 String "Hello AsmX!";
@call print(set::hello2);
@call print('Smart Compile');