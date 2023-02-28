const { SymbolError, TypeError } = require('./anatomics.errors');
const ValidatorByType = require('./checker');

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
    static lexerList(lineCode, valValue){
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
    static lexerInt(lineCode, valValue){
        if (!ValidatorByType.validateTypeInt(valValue)) {
            new TypeError(lineCode, valValue);
            return 'rejected';
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
    static lexerFloat(lineCode, valValue){
        if (!ValidatorByType.validatorTypeFloat(valValue)) {
            new TypeError(lineCode, valValue);
            return 'rejected';
        }

        return true;
    }


    /**
     * If the value is not a boolean, then throw a TypeError.
     * @param lineCode - The line number of the code.
     * @param valValue - The value of the variable
     * @returns the string 'rejected'
     */
    static lexerBool(lineCode, valValue){
        if (!ValidatorByType.validateTypeBoolean(valValue)) {
            new TypeError(lineCode, valValue);
            return 'rejected';
        }

        return true;
    }


    /**
     * If the value is not a string, then throw a TypeError.
     * @param lineCode - The line number of the code that is being validated.
     * @param valValue - The value of the variable
     * @returns the string 'rejected'
     */
    static lexerString(lineCode, valValue) {
        if (!ValidatorByType.validateByTypeString(valValue)) {
            new TypeError(lineCode, valValue);
            return 'rejected';
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
    static lexerAutonomyByType(lineCode, valValue, type) {
        return  type === 'Int' && this.lexerInt(lineCode, valValue)
        || type === 'Float' && this.lexerFloat(lineCode, valValue)
        || type === 'String' && this.lexerString(lineCode, valValue)
        || type === 'Bool' && this.lexerBool(lineCode, valValue)
        || type === 'List' && this.lexerList(lineCode, valValue);
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
}

module.exports = Lexer;