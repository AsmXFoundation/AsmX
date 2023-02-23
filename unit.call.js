const { UnitError } = require("./anatomics.errors");
const Lexer = require("./lexer");

class UnitCall {
    constructor(){
        this.units = [];
    }


    /**
     * The function takes a list of tokens, a list of arguments, and a list of types of arguments. It
     * then iterates through the list of arguments and calls a function that takes a line of code, an
     * argument, and a type of argument
     * @param tokenList - is the object that contains the code of the program, the line of code and the
     * type of the line of code.
     * @param args - is the arguments of the function, separated by commas.
     * @param typesArgs - is an array of types of arguments, for example:
     */
    #lexerFunctionArguments(tokenList, args, typesArgs){
        args = args.indexOf(',') ? args = args.trim().split(",").map(arg => arg.trim()) : args.trim();
        let lineCode = tokenList.subProgram;
        
        for (let index = 0; index < args.length; index++) {
            const typeArgument = typesArgs[index];
            Lexer.lexerAutonomyByType(lineCode, args[index], typeArgument);
        }
    }


    /**
     * This function adds a new function to the functions array.
     * @param name - The name of the function.
     * @param to - The function to call when the function is called.
     * @param argsRules - An array of objects that contain the following properties:
     */
    set(name, to, argsRules){
        this.units.push({ name: name, to: to, argsRules: argsRules });
    }


    /**
     * If the function exists, then if the function has no arguments, then return the function, else if
     * the function has arguments, then check if the arguments are valid, then return the function.
     * @param tokenList - The list of tokens that the lexer has created.
     * @param name - The name of the function
     * @param args - The arguments of the function
     * @returns the name of the function and the arguments.
     */
    get(tokenList, name, args){
        let unit = this.unit=s.find(unit => unit.name === name);

        if (!(unit == undefined || typeof unit === 'undefined')) {
            if (unit.argsRules == false){
                return `${unit.to}(${args});`;
            } else {
                this.#lexerFunctionArguments(tokenList, args, unit.argsRules);
                return `${unit.to}(${args});`;
            }
        } else {
            new UnitError(tokenList.subProgram, UnitError.UNIT_UNKNOWN);
        }
    }


    /**
     * It returns an array of booleans, where each boolean is true if the function name matches the
     * name passed in, and false otherwise
     * @param name - The name of the function you want to check for.
     * @returns An array of booleans.
     */
    has(name){
        return this.units.map(unit => unit.name === name ? true : false);
    }
}

let unitCall = new UnitCall();

module.exports = unitCall;