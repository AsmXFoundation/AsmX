const issue = require("./issue");
const Color = require("./utils/color");

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


class SymbolError extends BackTraceError {
    constructor(message) {
        super(message);
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
    constructor(lineCode, typeMessage) {
        super(lineCode);
        console.log(typeMessage);
        process.stdout.write(lineCode);
        process.stdout.write('\n');
        process.stdout.write(`${Color.FG_RED}^${Color.RESET}`.repeat(lineCode.length));
    }
}


class TypeError extends BackTraceError {
    constructor(lineCode, valValue) {
        super(valValue);
        console.log(`\n${TypeError.INVALID_TYPE}`);
        process.stdout.write(lineCode);
        process.stdout.write('\n');
        process.stdout.write(' '.repeat(lineCode.indexOf(valValue)) + `${Color.FG_RED}^${Color.RESET}`.repeat(valValue.length));
    }
}


//================================================================================================
// SYNTAX ERRORS
//================================================================================================
Object.defineProperty(SymbolError, 'INVALID_SYMBOL_ERROR', { value: '[SyntaxError]: Invalid symbol' });
Object.defineProperty(SymbolError, 'UNKNOWN_TYPE', { value: '[SyntaxError]: Unknown type' });
Object.defineProperty(SymbolError, 'UNKNOWN_TOKEN', { value: '[SyntaxError]: Unknown token' });
Object.defineProperty(SymbolError, 'UNKNOWN_MUTATION_OPERATOR', { value: '[SyntaxError]: Unknown operator' });
Object.defineProperty(SymbolError, 'UNKNOWN_OPERATOR', { value: '[SyntaxError]: Unknown operator' });
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
// STATEMENT ERRORS
//================================================================================================
Object.defineProperty(StatementError, 'INVALID_CASES_ERROR', { value: '[StatementError]: you must specify a statement' });
//================================================================================================


//================================================================================================
// TYPE ERRORS
//================================================================================================
Object.defineProperty(TypeError, 'INVALID_TYPE', { value: '[TypeError]: you must specify a type name' });
//================================================================================================

module.exports = {
    StatementError: StatementError,
    SymbolError: SymbolError,
    TypeError: TypeError,
    ArgumentError: ArgumentError,
    UnitError: UnitError,
}