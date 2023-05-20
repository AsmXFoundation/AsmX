const { SymbolError, TypeError, SyntaxError } = require('./anatomics.errors');
const ValidatorByType = require('./checker');
const ServerLog = require('./server/log');
const Color = require('./utils/color');

class Lexer {
    /**
     * It checks if the value of the variable is a list, and if it is, it checks if the list is
     * properly formatted.
     * 
     * The problem is that it doesn't work. It doesn't work because the function is not being called.
     * 
     * Here's the code that calls the function:
     * @param lineCode - the line of code that the user inputted
     * @param valValue - the value of the token
     * @returns the string 'rejected'
     */
    static lexerList(lineCode, valValue, options){
        if (!ValidatorByType.validateByTypeList(lineCode)) {
            console.log(`\n${SymbolError.UNKNOWN_TOKEN}`);
            process.stdout.write(lineCode);
            process.stdout.write('\n');
            process.stdout.write(' '.repeat(lineCode.indexOf(valValue) + 1) + '^ \n');
            return 'rejected';
        }

        return true;
    }


    /**
     * It checks if the value is an integer, if it is not, it prints out the line of code, the value,
     * and the position of the value in the line of code.
     * @param lineCode - the line of code that the user entered
     * @param valValue - The value of the variable
     * @returns the string 'rejected'
     */
    static lexerInt(lineCode, valValue, options){
        if (!ValidatorByType.validateTypeInt(valValue)) {
            new TypeError(lineCode, valValue, options);
            process.exit(1);
        }
        
        return true;
    }


    /**
     * It checks if the value is a float, if it is, it prints out an error message and returns
     * 'rejected'.
     * @param lineCode - the line of code that the user entered
     * @param valValue - The value of the variable
     * @returns the string 'rejected'
     */
    static lexerFloat(lineCode, valValue, options){
        if (!ValidatorByType.validatorTypeFloat(valValue)) {
            new TypeError(lineCode, valValue, options);
            process.exit(1);
        }

        return true;
    }


    /**
     * If the value is not a boolean, then throw a TypeError.
     * @param lineCode - The line number of the code.
     * @param valValue - The value of the variable
     * @returns the string 'rejected'
     */
    static lexerBool(lineCode, valValue, options){
        if (!ValidatorByType.validateTypeBoolean(valValue)) {
            new TypeError(lineCode, valValue, options);
            process.exit(1);
        }

        return true;
    }


    /**
     * If the value is not a string, then throw a TypeError.
     * @param lineCode - The line number of the code that is being validated.
     * @param valValue - The value of the variable
     * @returns the string 'rejected'
     */
    static lexerString(lineCode, valValue, options) {
        if (!ValidatorByType.validateByTypeString(valValue)) {
            new TypeError(lineCode, valValue, options);
            process.exit(1);
        }

        return true;
    }


    /**
     * It checks if the value is a 16-bit integer
     * @param lineCode - The line of code that the error is on.
     * @param valValue - The value of the variable
     * @returns the string 'rejected'
     */
    static lexerMemoryAddress(lineCode, valValue) {
        if (!ValidatorByType.validateTypeHex(valValue)) {
            new TypeError(lineCode, valValue);
            return 'rejected';
        }

        return true;
    }


    /**
     * If the value is not a valid identifier, then throw an error and return rejected.
     * @param lineCode - The line of code that the lexer is currently on.
     * @param valValue - The value of the token
     * @returns the string 'rejected'
     */
    static lexerIdentifier(lineCode, valValue) {
        if (!ValidatorByType.validateTypeIdentifier(valValue)) {
            new Error('Invalid identifier: ', lineCode);
            return 'rejected';
        }

        return true;
    }
    

    /**
     * "If the type is Int, then lexerInt, else if the type is Float, then lexerFloat, else if the type
     * is String, then lexerString, else if the type is Bool, then lexerBool, else if the type is List,
     * then lexerList."
     * 
     * The above function is a function that is used to determine what type of value is being used in
     * the code.
     * 
     * The function is called like this:
     * 
     * lexerAutonomyByType(lineCode, valValue, type);
     * 
     * The lineCode variable is the line of code that is being used.
     * 
     * The valValue variable is the value that is being used.
     * 
     * The type variable is the type of value that is being used.
     * 
     * The function returns the value that is being used.
     * 
     * The function is used to determine what type
     * @param lineCode - The line of code that is being parsed
     * @param valValue - The value of the variable
     * @param type - The type of the variable
     * @returns The return value is the result of the last expression evaluated.
     */
    static lexerAutonomyByType(lineCode, valValue, type, options) {
        return  type === 'Int' && this.lexerInt(lineCode, valValue, options)
        || type === 'Float' && this.lexerFloat(lineCode, valValue, options)
        || type === 'String' && this.lexerString(lineCode, valValue, options)
        || type === 'Bool' && this.lexerBool(lineCode, valValue, options)
        || type === 'List' && this.lexerList(lineCode, valValue, options);
    }


    /**
     * It returns the type of a value.
     * @param lineCode - The line of code that the value is in.
     * @param value - The value of the token
     * @returns The type of the value.
     */
    static lexerGetTypeByValue(lineCode, value) {
        if (this.lexerInt(lineCode, value)) return 'Int';
        if (this.lexerFloat(lineCode, value)) return 'Float';
        if (this.lexerString(lineCode, value)) return 'String';
        if (this.lexerBool(lineCode, value)) return 'Bool';
        if (this.lexerList(lineCode, value)) return 'List';
    }


    /**
     * The function is a lexer that checks and converts a given string into a valid JavaScript value.
     * @param string - The input string that needs to be lexed (parsed and analyzed for syntax and
     * structure).
     * @param options - The options parameter is an object that contains additional information about
     * the code being processed, such as the original line number and code string. It is used to
     * provide more detailed error messages in case of syntax or semantic errors.
     */
    static lexer(string, options) {
        const exceptionMessages = {
            quoteInvalidEnd: 'You need to end the line with another quotation mark.',
            quoteMark: 'You need to end the string with a quotation mark.',
            invalidString: `[${Color.FG_RED}SyntaxException${Color.FG_WHITE}]: Invalid string`
        }

        if (string == '"' || string == "'") {
            new SymbolError(options.code, string, 'Invalid character');
            process.exit(1);
        }

        // if (string.startsWith('"') || string.startsWith("'")) string = string.replace(/^"(.*)"$/, '$1');

        if (string.startsWith('"')) {
            if (string.endsWith("'")) {
                new SyntaxError(exceptionMessages.invalidString, {
                    row: options.row, select: string, code: options.code
                });

                ServerLog.log(exceptionMessages.quoteInvalidEnd, 'Possible fixes');
                process.exit(1);
            }

            if (!string.endsWith('"')) {
                new SyntaxError(`[${Color.FG_RED}SyntaxException${Color.FG_WHITE}]: You haven't finished the line, please finish it`, {
                    row: options.row, select: string, code: options.code
                });
                process.exit(1);
            }
        } else if (string.startsWith("'")) {
            if (string.endsWith('"')) {
                new SyntaxError(exceptionMessages.invalidString, {
                    row: options.row, select: string, code: options.code
                });

                ServerLog.log(exceptionMessages.quoteInvalidEnd, 'Possible fixes');
                process.exit(1);
            }

            if (!string.endsWith("'")) {
                new SyntaxError(`[${Color.FG_RED}SyntaxException${Color.FG_WHITE}]: You haven't finished the line, please finish it`, {
                    row: options.row, select: string, code: options.code
                });
                process.exit(1);
            }
        } else if (!isNaN(string)) {
            string = Number(string);
        } else if (string === 'true' || string === 'false') {
            string = string === 'true';
        } else {
            new SyntaxError(`Invalid value: ${string}`, {
                row: options.row, select: string, code: options.code
            });

            if (string === 'True') {
                ServerLog.log('You probably need to write \'true\'', 'Possible fixes');
            } else if (string === 'False') {
                ServerLog.log('You probably need to write \'false\'', 'Possible fixes');
            } else if (string.match(/^\d+/)) {
                ServerLog.log('You probably need to writeYou probably need to remove the letters', 'Possible fixes');
            }
    
            process.exit(1);
        }
    }
}

module.exports = Lexer;