@import Engine.File;

# TODO: support multiple files
@implementation Engine (Engine.File)

# TODO: create a stream for each file
@Stream engine.fileStream

# TODO: create a text stream for each file
@Stream engine.textStream

# TODO: write text to the file
@Interface engine.file

# TODO: create a user input stream
@Stream engine.inputStream
@Invoke 0x03 # user input

@Stream engine.fileInputStream
@Stream engine.file filepath "./text.txt"

@Route $out
@Invoke 0x04


