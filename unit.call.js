const { UnitError } = require("./anatomics.errors");
const Lexer = require("./lexer");
const Parser = require("./parser");
//const Compiler = require('./compiler');

class UnitCall {
    constructor(){
        this.units = [];
    }


    /**
     * It takes a line of code, an array of arguments, and an array of types of arguments, and then it
     * loops through the arguments and types of arguments and calls a function that will lex the
     * arguments based on their types.
     * @param lineCode - The line of code that is being analyzed.
     * @param args - is the arguments of the function
     * @param typesArgs - is an array of types of arguments, for example:
     */
    #lexerFunctionArguments(lineCode, args, typesArgs){
        args = args.indexOf(',') ? args = args.trim().split(",").map(arg => arg.trim()) : args.trim();
        
        for (let index = 0; index < args.length; index++) {
            const typeArgument = typesArgs[index];
            Lexer.lexerAutonomyByType(lineCode, args[index], typeArgument);
        }
    }


    /**
     * "This function adds a new unit to the units array."
     * 
     * The units array is an array of objects. Each object has a name, argsRules, argsNames, and body.
     * 
     * The name is the name of the unit.
     * 
     * The argsRules is an array of rules for the arguments.
     * 
     * The argsNames is an array of the names of the arguments.
     * 
     * The body is the body of the unit.
     * 
     * The argsRules and argsNames are arrays of the same length.
     * 
     * The argsRules array is an array of strings. Each string is a rule for the argument.
     * 
     * The argsNames array is an array of strings. Each string is the name of the argument.
     * 
     * The body is a string.
     * 
     * The argsRules and argsNames arrays are the same length.
     * 
     * The argsRules
     * @param name - The name of the function.
     * @param argsRules - an array of strings that represent the types of the arguments.
     * @param body - The function body.
     * @param argsnames - an array of strings that are the names of the arguments
     */
    set(name, argsRules, body, argsnames){
        this.units.push({ name: name, argsRules: argsRules, argsNames: argsnames, body: body });
    }


    /**
     * It takes a line of code, a function name, and the arguments of the function, and returns the
     * function's body
     * @param lineCode - The line of code that the function is on.
     * @param name - The name of the function
     * @param args - The arguments of the function
     * @returns the result of the Parser.parse() function.
     */
    get(lineCode, name, args){
        let unit = this.units.find(unit => unit.name === name);

        if (!(unit == undefined || typeof unit === 'undefined')) {
            if (unit.argsRules != false) this.#lexerFunctionArguments(lineCode, args, unit.argsRules);
            return Parser.parse(unit.body);
        }
    }


    /**
     * It takes a string of arguments and a unit name, and returns a hashmap of the arguments and their
     * corresponding names.
     * @param name - The name of the unit.
     * @param args - The arguments that the user has entered.
     * @returns A hashmap of the arguments and their values.
     */
    getArgumentsHashMap(name, args){
        let unit = this.units.find(unit => unit.name === name);
        let hashMap = {};
        args = args.split(',');

        if (!(unit == undefined || typeof unit === 'undefined')) {
           for (let index = 0; index < args.length; index++) {
            hashMap[unit.argsNames[index].trim()] = args[index].trim();
           }
        }

        return hashMap;
    }


    /**
     * If the name of the unit is the same as the name of the unit we're looking for, then return true.
     * @param name - The name of the unit to check for.
     * @returns a boolean value.
     */
    has(name){
        let res = false;
        this.units.forEach(unit => { if (unit.name == name) res = true; });
        return res;
    }
}

let unitCall = new UnitCall();

module.exports = unitCall;