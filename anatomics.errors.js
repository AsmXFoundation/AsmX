const Color = require("./utils/color");
const highlightCLI = require("./utils/highlight");

class BackTraceError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.stack = (new Error()).stack;
    }

    toString() {
        return this.message;
    }

    get name() {
        return this.constructor.name;
    }

    get stack() {
        return this.constructor.stack;
    }

    get message() {
        return this.constructor.message;
    }

    get code() {
        return this.constructor.code;
    }

    get cause() {
        return this.constructor.cause;
    }

    get causeName() {
        return this.constructor.causeName || false;
    }
}


class SymbolError {
    constructor(lineCode, symbol, message) {
        if (lineCode != undefined || lineCode != null) {
            if (message != undefined) {
                process.stdout.write(`${Color.BRIGHT}${message}\n`);
                process.stdout.write(' |\t\n');
                process.stdout.write(` |\t${highlightCLI.light(lineCode)}\n ${Color.BRIGHT}|\t`);
                process.stdout.write(' '.repeat(lineCode.indexOf(symbol)));
                process.stdout.write(`${Color.FG_RED}^${Color.RESET}\n${Color.RESET}`);
            } else {
                console.log(`\n${symbol}`);
                process.stdout.write(highlightCLI.light(lineCode));
                process.stdout.write(`\n${Color.BRIGHT}${Color.FG_RED}^`);
                process.stdout.write(`${Color.FG_RED}-${Color.RESET}`.repeat(lineCode.length-1));
            }
        }
    }
}


class StatementError extends BackTraceError {
    constructor(message) {
        super(message);
    }
}


class ArgumentError extends BackTraceError {
    constructor(lineCode, valValue, typeMessage) {
        super(valValue);
        console.log(`\n${typeMessage}`);
    }
}


class UnitError extends BackTraceError {
    constructor(lineCode, typeMessage, options) {
        super(lineCode);
        
        if (lineCode != undefined || lineCode != null) {
            this.options = options;
            let lastLine = `${Color.FG_GRAY}${this.options?.row} |\t\n`;
            let middleLine = `${this.options?.row + 1} |\t`;
            let nextLine = `${this.options?.row + 2} |\t`;

            console.log(`${Color.BRIGHT}${typeMessage}`);
            process.stdout.write(lastLine);
            process.stdout.write(`${middleLine}${highlightCLI.light(lineCode)}\n`);
            process.stdout.write(`${Color.BRIGHT}${Color.FG_GRAY}${nextLine}${Color.FG_RED}^`);
            process.stdout.write(`${Color.FG_RED}-`.repeat(lineCode.length - 1));
            process.stdout.write(`${Color.RESET}\n`);
        }
    }
}


class TypeError extends BackTraceError {
    constructor(lineCode, valValue, options) {
        super(valValue);
        this.options = options;
        let lastLine = `${this.options?.row} |\t\n`;
        let middleLine = `${this.options?.row + 1 } |\t`;
        let nextLine = `${this.options?.row + 2} |\t`;

        process.stdout.write(`\n${Color.BRIGHT}${TypeError.INVALID_TYPE}\n`);
        process.stdout.write(lastLine);
        process.stdout.write(`${middleLine}${highlightCLI.light(lineCode)}`);
        process.stdout.write(`\n${Color.BRIGHT}${nextLine}`);
        process.stdout.write(' '.repeat(lineCode.indexOf(valValue)) + `${Color.FG_RED}^`.repeat(valValue.length));
        process.stdout.write(`\n${Color.RESET}`);
    }
}


class FileError extends BackTraceError {
    constructor(options) {
        super(options.message);
        this.options = options;
        process.stdout.write(`${Color.BRIGHT}${this.options.message}\n`);

        if (this.options.lineCode != undefined || this.options.lineCode != null) {
            process.stdout.write(this.options.lineCode);
            process.stdout.write('\n');
            process.stdout.write(`${Color.FG_RED}^${Color.RESET}`.repeat(this.options.lineCode.length));
        }
    }
}


class SyntaxError extends Error {
    constructor(message, options){
        super(message);
        this.options = options;
        let lastLine = `${Color.FG_GRAY}${this.options.row} |\t\n`;
        let middleLine = `${this.options.row + 1} |\t`;
        let nextLine;

        if (this.options.select) {
            if (this.options.position === 'first') {
                nextLine = `${Color.BRIGHT}${Color.FG_GRAY}${this.options.row + 2} |${Color.FG_RED}\t^${'-'.repeat(this.options.code.length -1)}${Color.RESET}\n`;
            } else if (this.options.position === 'end') {
                nextLine = `${Color.BRIGHT}${Color.FG_GRAY}${this.options.row + 2} |${Color.FG_RED}\t${' '.repeat(this.options.code.length -1)}^${Color.RESET}\n`;
            } else {
                nextLine = `${Color.BRIGHT}${Color.FG_GRAY}${this.options.row + 2} |${Color.FG_RED}\t${' '.repeat(this.options.code.indexOf(this.options.select))}^${'-'.repeat(this.options.select.length-1)}${Color.RESET}\n`;
            }
        }  else {
            nextLine = `${Color.BRIGHT}${Color.FG_GRAY}${this.options.row + 2} |${Color.FG_RED}\t^${'-'.repeat(this.options.code.length -1)}${Color.RESET}\n`;
        }

        process.stdout.write(`${Color.BRIGHT}${message}\n`);
        process.stdout.write(lastLine);
        process.stdout.write(`${middleLine}${highlightCLI.light(this.options.code)}\n`);
        process.stdout.write(nextLine);

    }
}


class CodeStyleException {
    constructor(message, options) {
        this.options = options;

        let lastLine = `${Color.FG_GRAY}${this.options.row} |\t\n`;
        let middleLine = `${this.options.row + 1} |\t`;
        let nextLine;

        if (options?.select) {
            nextLine = `${Color.BRIGHT}${Color.FG_GRAY}${this.options.row + 2} |${Color.FG_RED}\t${' '.repeat(this.options.code.indexOf(this.options.select))}^${'-'.repeat(this.options.select.length -1)}${Color.RESET}\n`;
        } else {
            nextLine = `${Color.BRIGHT}${Color.FG_GRAY}${this.options.row + 2} |${Color.FG_RED}\t^${'-'.repeat(this.options.code.length -1)}${Color.RESET}\n`;
        }

        process.stdout.write(`${Color.BRIGHT}[${Color.FG_RED}CodeStyleException${Color.FG_WHITE}]: ${message}\n`);
        process.stdout.write(lastLine);
        process.stdout.write(`${middleLine}${highlightCLI.light(this.options.code)}\n`);
        process.stdout.write(nextLine);
    }
}


class InstructionException {
    constructor(message, options){
        this.options = options;
        let lastLine = `${Color.FG_GRAY}${this.options.row} |\t\n`;
        let middleLine = `${this.options.row + 1} |\t`;
        let nextLine = `${Color.BRIGHT}${Color.FG_GRAY}${this.options.row + 2} |${Color.FG_RED}\t^${'-'.repeat(this.options.code.length -1)}${Color.RESET}\n`;

        process.stdout.write(`${Color.BRIGHT}${message}\n`);
        process.stdout.write(lastLine);
        process.stdout.write(`${middleLine}${highlightCLI.light(this.options.code)}\n`);
        process.stdout.write(nextLine);

    }
}

//================================================================================================
// SYNTAX ERRORS
//================================================================================================
Object.defineProperty(SymbolError, 'INVALID_SYMBOL_ERROR', { value: `[${Color.BRIGHT}${Color.FG_RED}SyntaxError${Color.FG_WHITE}]: Invalid symbol` });
Object.defineProperty(SymbolError, 'UNKNOWN_TOKEN', { value: `[SyntaxError]: Unknown token` });
//================================================================================================


//================================================================================================
// ARGUMENT ERRRORS
//================================================================================================
Object.defineProperty(ArgumentError, 'ARGUMENT_INVALID_TYPE_ARGUMENT', { value: '[ArgumentError]: Invalid type argument' });
Object.defineProperty(ArgumentError, 'ARGUMENT_INVALID_VALUE_ARGUMENT', { value: '[ArgumentError]: Invalid value argument' });
Object.defineProperty(ArgumentError, 'ARGUMENT_INVALID_COUNT_ARGUMENTS', { value: '[ArgumentError]: Invalid count argument' });
//================================================================================================


//================================================================================================
// UNIT ERRORS
//================================================================================================
Object.defineProperty(UnitError, 'UNIT_UNKNOWN', { value: '[UnitError]: Unknown unit call' });
//================================================================================================


//================================================================================================
// TYPE ERRORS
//================================================================================================
Object.defineProperty(TypeError, 'INVALID_TYPE', { value: `[${Color.FG_RED}TypeError${Color.FG_WHITE}]: you must specify a type name` });
//================================================================================================


//================================================================================================
// FILE ERRORS
//================================================================================================
Object.defineProperty(FileError, 'FILE_NOT_FOUND', { value: `[${Color.FG_RED}FileError${Color.FG_WHITE}]: File not found` });
Object.defineProperty(FileError, 'FILE_EXTENSION_INVALID', { value: `[${Color.FG_RED}FileError${Color.FG_WHITE}]: File extension invalid` });
//================================================================================================


module.exports = {
    StatementError: StatementError,
    SymbolError: SymbolError,
    TypeError: TypeError,
    ArgumentError: ArgumentError,
    UnitError: UnitError,
    FileError: FileError,
    SyntaxError: SyntaxError,
    CodeStyleException: CodeStyleException,
    InstructionException: InstructionException
}