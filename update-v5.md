# AsmX v5

AsmX v5.0.0 has been released!

- Updated the Docker image to v5.0.0

## Changelog

- Updated the Docker image to v5.0.0
- Fixed a bug where `docker run` would fail if no command was provided (#13)
- Added support for specifying an alternate entrypoint in the Dockerfile (#9)
- Added support for specifying an alternate command in the Dockerfile (#10)
- Added support for specifying an alternate working directory in the Dockerfile (#11)
- Added support for specifying an alternate user in the Dockerfile (#12)
- Removed the `--no-cache` flag from `asmx build`, which is now always used by default (#8)

## Reference

- [AsmX v5.0.0 release notes](#asmx-v5-0-0-release-notes)
- [AsmX OS new features](#asmx-os-new-features)
- [Improving the packages --info command output](#improving-the-packages---info-command-output)
- [Improvements and Updates to the AsmX Programming Language Project Documentation](#improvements-and-updates-to-the-asmx-programming-language-project-documentation)
- [Explains](#explains)
- [List of updated files and directories](#list-of-updated-files-and-directories)
- [List of checked files and directories](#list-of-checked-files-and-directories)
- [AsmX contributors](#asmx-contributors)
- [AsmX maintainers](#asmx-maintainers)


## AsmX v5.0.0 release notes

- Updated the Docker image to v5.0.0
- Added the new types

## AsmX OS new features
New commands: `tree` and `gift`.
### `tree` command

Use `tree` to view the file system structure starting from the current directory (.) or any other specified directory.

#### To see the root:

```sh
root@asmxOS ~# tree .
└───bin
.history
```

To see a different directory:
```sh
root@asmxOS ~# cd usr/bin && tree .
```

Gift:
```sh
root@asmxOS ~# gift
```

xfetch & neofetch:
```sh
root@asmxOS ~# xfetch
...

root@asmxOS ~# neofetch
...
```
New commands have been added to the reference book. To get help, enter the `help` command.

## Improving the packages --info command output
The packages --info command output has been updated to provide a more polished and user-friendly display:
```sh
/usr/packages/asmx/      asmx.pkg      asmx        (.pkg)  457B    
/usr/packages/crypto/    crypto.pkg    crypto      (.pkg)  652B
/usr/packages/gift/      gift.pkg      gift        (.pkg)  497B
/usr/packages/git/       git.pkg       git         (.pkg)  436B
/usr/packages/pkg/       pkg.pkg       pkg         (.pkg)  1.1KB
/usr/packages/starlink/  starlink.pkg  starlink    (.pkg)  3.68KB
/usr/packages/stdlib/    stdlib.pkg    stdlib      (.pkg)  463B
/usr/packages/tar/       tar.pkg       tar         (.pkg)  1.71KB
/usr/packages/url/       url.pkg       url         (.pkg)  2.41KB
```

The command output now provides the following updated information:

- 1 row (Directory): The directory where the package is located.
- 2 row (Package): The package file name.
- 3 row (Name): The name of the package.
- 4 row (File) Type: The file extension of the package.
- 5 row (Size): The size of the package file.

## AsmX new features

### Type Array (Array, array)
```asmx
@set a2 Array [];  # Create an empty array called a2
@set a1 Array [];  # Create an empty array called a1

@call set::a1::push(2);  # Add the value 2 to the array a1
@call set::a1::push(4);  # Add the value 4 to the array a1

@call set::a2::push(4);  # Add the value 4 to the array a2
@call set::a2::push(2);  # Add the value 2 to the array a2

@call tion::print(set::a1);  # Print the contents of the array a1
@call tion::print(set::a2);  # Print the contents of the array a2

@call set::a1::size();  # Get the size of the array a1
@call print($return);  # Print the size of the array a1

@call set::a2::size();  # Get the size of the array a2
@call print($return);  # Print the size of the array a2

@call set::a1::at(-1);  # Get the value at the last index of the array a1
@call print($return);  # Print the value at the last index of the array a1

@call set::a1::view();  # View the contents of the array a1
```

### Type Buffer (Buffer, buffer)
```asmx
# Create a new buffer object
@set buf Buffer {};

# Allocate memory for the buffer with a size of 20 bytes
@call set::buf::alloc(20);

# Push the value 0x04 into the buffer
@call set::buf::push(0x04); # Buffer { 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }

# Push the string 'AsmX' into the buffer
@call set::buf::push('AsmX'); # Buffer { 0, 0, 0, 4, 27, 41, 73, 6d, 58, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }

# Push the character 'A' into the buffer
@call set::buf::push('A'); # Buffer { 0, 0, 0, 4, 27, 41, 73, 6d, 58, 27, 27, 41, 27, 0, 0, 0, 0, 0, 0, 0 }

# Print the contents of the buffer
@call tion::print(set::buf);

# View the contents of the buffer (in a human-readable format)
@call set::buf::view();

# Get the size of the buffer
@call set::buf::size();

# Print the size of the buffer
@call print($return); # 20
```

### Type RegExpr (RegExpr, regexpr)
```asmx
# Set the regular expression pattern
@set regex RegExpr '/[a-zA-Z][a-zA-Z0-9_]+/g';

# Test if the given string matches the pattern
@call set::regex::test('asm');
@call print($return);   # Output: true

@call set::regex::test('43');
@call print($return);   # Output: false

# Find all matches of the pattern in the given string
@call set::regex::match('first second');
@call print($return); # Output: [ 'first', 'second' ]

# Find all matches of the pattern in the given string and return as an array
@call set::regex::matchAll('first second');

# Check if the returned value from matchAll is an instance of an object
@execute instanceof list::$return Object;
@call print($ret); # Output: true
```

## Improvements and Updates to the AsmX Programming Language Project Documentation:
New structures `@task` and `@todolist` have been added to the AsmX programming language. These structures allow for the organization and execution of tasks in a sequential manner.

Types:
- A new Buffer type has been added, which can now also be written with a lowercase letter.
- A new Array type has been added, which can now also be written with a lowercase letter.
- A new Regexp type has been added, which can be written as "regexp". Regular expressions are written within a string.
- A new Iterator type has been added, which can now also be written with a lowercase letter.
- A new Vector type has been added, which can now also be written with a lowercase letter.
- Each of these new types has its own set of methods.

New commands in the instruction "`@execute cmd arg1 arg2`":
- Added `shl`, `shr`, `ror`, and `rol` commands.

New operator in the "`@execute`" statement:
- Added the `instanceof` operator. Example: `@execute instanceof var/class Type`.

New registers:
- Added `$add`, `$mod`, `$mul`, `$sub`, and `$div` registers.

Integers with new types:
- It is now possible to assign new types to integers. The prefix 'i' indicates the bit depth of the int integer type in AsmX. Example: `@set num i8 255; # OK`.

String methods:
- Added the following methods to the String type:
  - `upper()` - Converts the string to uppercase.
  - `lower()` - Converts the string to lowercase.
  - `title()` - Converts the string to title case.
  - `size()` - Returns the size of the string.
  - `slice(start?, end?)` - Returns a slice of the string starting from the optional start index to the optional end index.
  - `code(index)` - Returns the Unicode code of the character at the given index.
  - `reverse()` - Reverses the string.
  - `has(substr)` - Checks if the string contains the given substring.
  - `index(str)` - Returns the index of the first occurrence of the given substring in the string.
  - `get(index)` - Returns the character at the given index.
  - `hasSpace()` - Checks if the string contains any whitespace characters.
  - `hasInt()` - Checks if the string contains any numeric digits.
  - `hasSymbol()` - Checks if the string contains any symbol characters.
  - `hasChar()` - Checks if the string contains any non-digit and non-symbol characters.

AsmX OS:
- Added the ability to navigate the path using the `cd ./` command.
- Improved neofetch to display only the main information by default. To view more information, use the `neofetch --page <number>` command, where `<number>` is the page number.
- Implemented the integration of modern technologies, including Git. AsmX OS now supports working with Git if it is installed. It's interesting to note that this feature was used to send commits to the OS itself and made a push 😀.
- Added many packages such as url, gift, and others.
- Added anonymity mode. Use the `mode --private/public` command to toggle between private and public modes.

## Explains
### [`HelloWorld program`](./examples/explains/hello.md)
### [`@todolist`](./examples/explains/todolist.md)

## List of updated files and directories
```sh
 .gitignore
 .ini
 cli.js
 compiler.js
 docker/.dockerignore
 docker/DOCKERFILE
 etc/config/asmx.properties
 etc/os/AsmXOS/cli.js
 etc/os/AsmXOS/config.js
 examples/collection.asmX
 examples/hello.asmX
 examples/iterator.asmX
 examples/struct.asmX
 examples/example_microexplains/hello.md
 examples/example_microexplains/todolist.md
 kernel.js
 methods.js
 parser.js
 structure.js 
 types.js
```

## List of checked files and directories
```sh
.ini
.gitignore

docker/.dockerignore
docker/DOCKERFILE

etc/config/asmx.properties
etc/os/AsmXOS/usr/packages/gift/index.js
etc/os/AsmXOS/cli.js
etc/os/AsmXOS/config.js

examples/example_microexplains/hello.md
examples/example_microexplains/todolist.md

examples/regexpr.asmx
examples/collection.asmX
examples/hello.asmX
examples/iterator.asmX
examples/struct.asmX
examples/buffer.asmX
examples/todolist.asmX
examples/array.asmX

cli.js
kernel.js
compiler.js

methods.js
parser.js
structure.js
types.js
```

## 172-180 file system units
```sh
.gitattributes
.gitignore
.ini
AsmX_Crash_Course/hello_world.asmX
AsmX_Crash_Course/numbers.asmX    
LICENSE
README.md
analysis.js
bin/app/app.js
bin/app/cli.js
bin/app/v2/app.js
bin/app/v3/app.js
bin/app/v4/app.js
bin/arm/arm.js
bin/distribution/builder.asmX     
bin/exe/exe.js
bin/exe/task.md
bin/utils/hex-types.js
bin/utils/superbuffer.js
checker.js
cli.js
compiler.js
config.js
coroutine.js
docker/.dockerignore
docker/DOCKERFILE
engine/adapter.js
engine/core.d.ts
engine/core.js
etc/cli/theme/earthUI/theme.json
etc/cli/theme/marsUI/theme.json
etc/cli/theme/neoUI/theme.json
etc/config/asmx.properties
etc/config/neofetch.conf
etc/os/AsmXOS/cli.js
etc/os/AsmXOS/config.js
etc/os/AsmXOS/core.js
etc/os/AsmXOS/etc/neofetch.conf
etc/os/AsmXOS/neofetch.js
etc/os/AsmXOS/parser/index.js
etc/os/AsmXOS/usr/.history
etc/os/AsmXOS/usr/bin/asmx/index.js
etc/os/AsmXOS/usr/index.ash
etc/os/AsmXOS/usr/packages/asmx/index.js
etc/os/AsmXOS/usr/packages/crypto/index.js
etc/os/AsmXOS/usr/packages/git/index.js
etc/os/AsmXOS/usr/packages/pkg/index.js
etc/os/AsmXOS/usr/packages/starlink/index.js
etc/os/AsmXOS/usr/packages/stdlib/index.js
etc/os/AsmXOS/usr/packages/tar/index.js
etc/os/AsmXOS/usr/packages/url/index.js
etc/os/AsmXOS/usr/var.ash
event.js
examples/add.asmX
examples/bin-app/hello.app
examples/bin-app/hello.asmX
examples/bin-app/v2/hello.app
examples/bin-app/v2/hello.asmX
examples/bin-app/v3/hello.app
examples/bin-app/v3/hello.asmX
examples/bin-app/v4/hello.app
examples/bin-app/v4/hello.asmX
examples/bin-arm/arm.asmX
examples/bin-arm/arm.s
examples/class.asmX
examples/cli.asmX
examples/collection.asmX
examples/coroutine.asmX
examples/default.asmX
examples/div.asmX
examples/engine-asmx/index.asmX
examples/engine-asmx/index.js
examples/engine.asmX
examples/enum.asmX
examples/equ.asmX
examples/example-use-package/index.asmX
examples/example_micro/build.micro
examples/example_micro/hello.asmX
examples/example_micro/tar/hello.app
examples/example_microexplains/hello.md
examples/example_microexplains/todolist.md
examples/execute.asmX
examples/expr.asmX
examples/extends.asmX
examples/ffi.asmX
examples/get.asmX
examples/hello.asmX
examples/import.asmX
examples/input.asmx
examples/iterator.asmX
examples/many-extends.asmX
examples/methods.asmX
examples/mod.asmX
examples/modify.asmX
examples/mul.asmX
examples/namespace.asmX
examples/software/branches.asmX
examples/software/dbs.asmX
examples/software/hanoi_tower.asmX
examples/software/number.asmX
examples/software/string.asmX
examples/software/ttt.asmX
examples/struct.asmX
examples/sub.asmX
examples/tion.asmX
examples/unit.asmX
examples/vector.asmX
exception.js
expression.js
flow.js
fs.js
garbage.js
installer/linux/asmx.sh
installer/macOS/asmx.sh
installer/windows/asmx.bat
interface.js
javascript.js
kernel.js
kernelos.js
keywords.js
lexer.js
libs/asmx.asmX
libs/asmxos.asmX
libs/gpu.asmX
libs/japan_number.asmX
libs/linux.asmX
libs/math.asmX
libs/ml.asmX
libs/mysql.asmX
libs/number.asmX
libs/request.asmX
libs/shell.asmX
libs/stream.asmX
libs/win_app.asmX
libs/windows.asmX
licenses/AsmX/LICENSE
licenses/Common/LICENSE
memory.js
methods.js
micro/micro.js
micro/parser.js
micro/structure.js
middleware.software.js
package.json
parser.js
route.js
server/log.js
stack.js
structure.js
systems/boolean.asmX
systems/engine/engine.js
systems/index.asmX
systems/io.asmX
systems/registers.asmX
systems/syscalls/syscalls.asmX
systems/types/units/int.asmX
systems/types/units/string.asmX
task.js
test.exe
tools/apm/apm.js
tools/apm/cli.js
tools/auth.js
tools/cide/cide.js
tools/cide/cli.js
tools/cryptography.js
tools/docs-writter-neural.js
tools/neural.js
tools/security.js
tools/theme.js
types.js
types/iterator.js
types/vector.js
unit.call.js
utils/color.js
utils/highlight.js
```

## AsmX contributors
- [@langprogramming-AsmX](https://github.com/langprogramming-AsmX)

## AsmX maintainers
- [@langprogramming-AsmX](https://github.com/langprogramming-AsmX)

