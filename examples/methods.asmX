@set str String 'Hello World!';

@call print(set::str);

@call set::str::slice(0, -1);
@call print($return);
@call set::str::size();
@call print($return);

@set str2 String 'hello world!';

@call set::str2::title();
@call print($return);
@call set::str2::repeat(2);
@call print($return);

@call set::str2::reverse();
@call print($return);