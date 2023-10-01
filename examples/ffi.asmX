@import javascript.os;
@import javascript.fs;

@call javascript.os.arch();
@call tion::print($return);
@call javascript.fs.mkdirSync('js-ffi');