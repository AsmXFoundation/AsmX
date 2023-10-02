@import javascript.os;
@import javascript.fs;

@call javascript.os.cpus();
@call tion::print(list::$return::0);
# @call javascript.fs.mkdirSync('js-ffi');