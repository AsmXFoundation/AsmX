const { TypeError } = require("./anatomics.errors");
const ValidatorByType = require("./checker");
const Lexer = require("./lexer");
const Switching = require("./switching");
const Token = require("./tokens");
const Validator = require("./validator");

class Parser {
    static parse(sourceCode) {
        let lines = sourceCode.split('\n');
        let tokens = [];
        let newLines = [];
        let isInterpreteProccess = Switching.setState(true);

        lines = lines.map(line => line.indexOf(';') >= 0 ? line.split(';') : line);

        lines.forEach((line) => {
            if (Array.isArray(line))
                for (let idx = 0, len = line.length; idx < len; idx++)  newLines.push(line[idx]);
            else
                newLines.push(line);
        });

        lines = newLines;

        ParserCycle: for (let index = 0; index < lines.length; index++) {
            const line = lines[index].trim();
          //  line.indexOf('#') === 0 ? instructions.push(line) : false;
          //  line.indexOf('#') >= 0  ? instructions.push(line.substring(0, line.indexOf('#'))) : false;

            if (line.length === 0) continue;

            if (isInterpreteProccess.state && Validator.isUnitStatement(line)) {
                isInterpreteProccess.setState(false);
                let unit = this.parseUnitStatement(line);
                let unitBody = [];
                if (unit == 'rejected' || line.length === 0) break ParserCycle;
                let fixedLine = index;
                
                UnitCycle: for (let idx = fixedLine, len = lines.length; idx < len; idx++) {
                    let lineUnit = lines[idx].trim();
                    if (lineUnit.length === 0) break UnitCycle
                    else unitBody.push(lineUnit), lines[idx] = '';
                }
                
                tokens.push({ unit: unitBody });
                isInterpreteProccess.setState(true);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isImportStatement(line)) {
                let alias = this.parseImportStatement(line);
                if (alias == 'rejected') { break ParserCycle; } else tokens.push(alias);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isReturnStatement(line)) {
                let ret = this.parseReturnStatement(line);
                if (ret == 'rejected') { break ParserCycle; } else tokens.push(ret);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isCallStatement(line)) {
                let call = this.parseCallStatement(line);
                if (call == 'rejected'){ break ParserCycle; } else tokens.push(call);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isIssueStatement(line)) {
                let issue = this.parseIssueStatement(line);
                if (issue == 'rejected'){ break ParserCycle; } else tokens.push(issue); 
                continue;
            }

            if (isInterpreteProccess.state && Validator.isSetDeclaration(line)) {
                let set = this.parseSetStatement(line)
                if (set == 'rejected'){ break ParserCycle; } else tokens.push(set);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isInvokeStatement(line)) {
                let invoke = this.parseInvokeStatement(line);
                if (invoke == 'rejected'){ break ParserCycle; } else tokens.push(invoke);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isMemoryInvokeStatement(line)) {
                let memory = this.parseMemoryInvoke(line);
                if (memory == 'rejected'){ break ParserCycle; } else  tokens.push(memory);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isAddressInvokeStatement(line)) {
                let address = this.parseAddressInvoke(line);
                if (address == 'rejected'){ break ParserCycle; } else tokens.push(address);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isRouteStatement(line)) {
                let route = this.parseRouteStatement(line);
                if (route == 'rejected'){ break ParserCycle; } else tokens.push(route);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isStackStatement(line)) {
                let stack = this.parseStackStatement(line);
                if (stack == 'rejected'){ break ParserCycle; } else tokens.push(stack);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isAddStatement(line)) {
                let add = this.parseAddStatement(line);
                if (add == 'rejected'){ break ParserCycle; } else tokens.push(add);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isSubStatement(line)) {
                let sub = this.parseSubStatement(line);
                if (sub == 'rejected'){ break ParserCycle; } else tokens.push(sub);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isCallStatement(line)) {
                let call = this.parseCallStatement(line);
                if (call == 'rejected'){ break ParserCycle; } else tokens.push(call);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isEqualStatement(line)) {
                let equal = this.parseEqualityStatement(line);
                if (equal == 'rejected'){ break ParserCycle; } else tokens.push(equal);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isDivStatement(line)) {
                let div = this.parseDivStatement(line);
                if (div == 'rejected'){ break ParserCycle; } else tokens.push(div);
                continue;
            }

            if (isInterpreteProccess.state && Validator.isModStatement(line)) {
                let mod = this.parseModStatement(line);
                if (mod == 'rejected'){ break ParserCycle; } else tokens.push(mod);
                continue;
            }
        }

        return tokens;
    }


    static parseImportStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['import'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [ImportToken, Alias] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';
        if (Alias == undefined) { process.stdout.write('Alias not defined'); return 'rejected'; }
        else  smallAbstractSyntaxTree['import']['alias'] = Alias;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, splits it into two parts, and returns an object with the second part as
     * a property of the first part
     * @param lineCode - The line of code that is being parsed.
     * @returns a small abstract syntax tree.
     */
    static parseReturnStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['ret'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [RetToken, RetAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';
        if (RetAddress == undefined) console.error('Invoke address not found');
        else  smallAbstractSyntaxTree['ret']['arg'] = RetAddress;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and then validates each argument
     * @param lineCode - the line of code that is being parsed
     * @returns A small abstract syntax tree.
     */
    static parseDivStatement(lineCode) {
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['div'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 6) return 'rejected';
        let  args =  lineCode.indexOf(',') > -1 ? lineCode.split(',') : lineCode.split(' ');
        args = args.map(arg => arg.indexOf(' ') > -1 ? arg.split(' ')[1] : arg);
        args.map(arg => ValidatorByType.validateTypeHex(arg));
        smallAbstractSyntaxTree['div']['args'] = args;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, splits it into arguments, and then validates each argument.
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parseModStatement(lineCode) {
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['mod'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 6) return 'rejected';
        let  args =  lineCode.indexOf(',') > -1 ? lineCode.split(',') : lineCode.split(' ');
        args = args.map(arg => arg.indexOf(' ') > -1 ? arg.split(' ')[1] : arg);
        args.map(arg => ValidatorByType.validateTypeHex(arg));
        smallAbstractSyntaxTree['mod']['args'] = args;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and returns an object with the
     * arguments as properties.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of 'add' and a value of an object with a key of 'args' and a value
     * of an array of arguments.
     */
    static parseEqualityStatement(lineCode) {
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['equal'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 6) return 'rejected';
        let  args =  lineCode.indexOf(',') > -1 ? lineCode.split(',') : lineCode.split(' ');
        args = args.map(arg => arg.indexOf(' ') > -1 ? arg.split(' ')[1] : arg);
        smallAbstractSyntaxTree['equal']['args'] = args;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and returns an object with the
     * arguments as properties.
     * @param lineCode - the line of code that is being parsed
     * @returns an object.
     */
    static parseAddStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['add'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 6) return 'rejected';
        let  args =  lineCode.indexOf(',') > -1 ? lineCode.split(',') : lineCode.split(' ');
        args = args.map(arg => arg.indexOf(' ') > -1 ? arg.split(' ')[1] : arg);
        args.map(arg => ValidatorByType.validateTypeHex(arg));
        smallAbstractSyntaxTree['add']['args'] = args;
        return smallAbstractSyntaxTree;
    }



    /**
     * It takes a line of code and returns an object with the name of the function and the arguments
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parseCallStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['call'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 2) return 'rejected';
        const unitName = lineCode.substring(lineCode.indexOf(' ') + 1, lineCode.indexOf('('));
        const unitArguments = lineCode.substring(lineCode.indexOf('('), lineCode.indexOf(')') + 1);
        smallAbstractSyntaxTree['call']['name'] = unitName;
        smallAbstractSyntaxTree['call']['args'] = unitArguments;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code and returns an object with the sub statement and its arguments.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of 'sub' and a value of an object with a key of 'args' and a value
     * of an array of arguments.
     */
    static parseSubStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['sub'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 6) return 'rejected';
        let  args =  lineCode.indexOf(',') > -1 ? lineCode.split(',') : lineCode.split(' ');
        args = args.map(arg => arg.indexOf(' ') > -1 ? arg.split(' ')[1] : arg);
        args.map(arg => ValidatorByType.validatorTypeHex(arg));
        smallAbstractSyntaxTree['sub']['args'] = args;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a string, splits it into an array, and then assigns the array elements to variables.
     * @param lineCode - The line of code that is being parsed.
     * @returns An object with a key of route and a value of an object with keys of name and address.
     */
    static parseRouteStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['route'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 3) return 'rejected';
        const [RouteToken, RouteName, RouteAddress] = lineCode.split(' ');

        if (RouteAddress && !ValidatorByType.validateTypeHex(RouteAddress)) {
            new TypeError(lineCode, RouteAddress);
            return 'rejected';
        }

        smallAbstractSyntaxTree['route']['name'] = RouteName;
        smallAbstractSyntaxTree['route']['address'] = RouteAddress;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, splits it into two parts, and returns an object with the second part as
     * a property of the first part.
     * @param lineCode - the line of code that is being parsed
     * @returns an object with a key of 'stack' and a value of an object with a key of 'address' and a
     * value of the stack address.
     */
    static parseStackStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['stack'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [StackToken, StackAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';

        if (!ValidatorByType.validateTypeHex(StackAddress)) {
            new TypeError(lineCode, StackAddress);
            return 'rejected';
        }

        smallAbstractSyntaxTree['stack']['address'] = StackAddress;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a string, splits it into two parts, and returns an object with the two parts as
     * properties.
     * @param lineCode - The line of code that is being parsed
     * @returns An array of objects.
     */
    static parseIssueStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['issue'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 2) return 'rejected';
        const [IssueToken, IssueStatus] = lineCode.split(' ');
        Lexer.lexerBool(lineCode, IssueStatus);
        smallAbstractSyntaxTree['issue']['state'] = IssueStatus || 'on';
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a string and replaces all the empty characters with a single space.
     * @param lineCode - The line of code that is being parsed.
     * @returns The line of code with all the empty characters removed.
     */
    static parseAndDeleteEmptyCharacters(lineCode){
        lineCode = lineCode.replace(/\s+/g, ' ').trim();
        return  lineCode.substring(0, lineCode.indexOf('#') >= 0 ? lineCode.indexOf('#') -1 : lineCode.length);
    }


    /**
     * It takes a line of code, splits it into an array, and then assigns the values of the array to a
     * JSON object.
     * </code>
     * @param lineCode - The line of code that is being parsed.
     * @returns An array of objects.
     */
    static parseSetStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['set'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [setToken, setName, setType, setValue] = lineCode.split(' ');
        if (lineCode.split(' ').length > 4) return 'rejected';

        if (setValue == undefined) {
            Lexer.lexerAutonomyByType(lineCode, setType, Lexer.lexerGetTypeByValue(lineCode, setType));
            smallAbstractSyntaxTree['set']['name'] = setName;
            smallAbstractSyntaxTree['set']['type'] = Lexer.lexerGetTypeByValue(lineCode, setType);
            smallAbstractSyntaxTree['set']['value'] = setType;
        } else {
            Lexer.lexerAutonomyByType(lineCode, setValue, setType);
            smallAbstractSyntaxTree['set']['name'] = setName;
            smallAbstractSyntaxTree['set']['type'] = setType;
            smallAbstractSyntaxTree['set']['value'] = setValue;
        }

        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, splits it into two parts, and then returns an object with the two parts
     * as properties.
     * @param lineCode - The line of code that is being parsed.
     * @returns An array of objects.
     */
    static parseInvokeStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['invoke'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [InvokeToken, InvokeAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';

        if (!ValidatorByType.validateTypeHex(InvokeAddress)) {
            new TypeError(lineCode, InvokeAddress);
            return 'rejected';
        }

        if (InvokeAddress == undefined) console.error('Invoke address not found');
        else  smallAbstractSyntaxTree['invoke']['address'] = InvokeAddress;
        return smallAbstractSyntaxTree;
    }


    /**
     * It takes a line of code, parses it, and then sets the memory address to the value.
     * </code>
     * @param lineCode - The line of code that is being parsed.
     */
    static parseMemoryInvoke(lineCode){
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [memoryToken, memoryValue, memoryAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 3) return 'rejected';

        if (!ValidatorByType.validateTypeHex(memoryAddress)) {
            new TypeError(lineCode, memoryAddress);
            return 'rejected';
        }

        Lexer.lexerMemoryAddress(lineCode, memoryAddress);
        return { memory: { name: memoryValue, address: memoryAddress } };
    }
    
        
    /**
     * It takes a string, finds the first and last parentheses, and returns an object with the string
     * between the parentheses as the ref property and the string after the last parentheses as the
     * addressVal property.
     * @param lineCode - The line of code that is being parsed.
     * @returns An object with two properties: ref and addressVal.
     */
    static parseAddressInvoke(lineCode){
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.indexOf('(')  !== -1 && lineCode.indexOf(')') !== -1){
            const addressName = lineCode.substring(lineCode.indexOf('('), lineCode.lastIndexOf(')')).trim();
            const address = lineCode.substring(lineCode.lastIndexOf(')')).trim();
            return { address: { name: addressName, address: address } };
        } else {
            const [addressToken, address, addressName] = lineCode.split(' ');
            return { address: { name: addressName, address: address } };
        }
    }


    /**
     * It takes a string of arguments and returns an object with the argument index as the key and the
     * argument type as the value
     * @param args - The arguments that are passed to the function.
     * @returns An object with the index of the argument as the key and the type of the argument as the
     * value.
     */
    static parseTypesArgumentsUnit(args) {
        args = args.trim().split(",");
        let argsRules = {};
        let argsTypes = [];
        for (let index = 0; index < args.length; index++) argsTypes.push(args[index].split(':'));
        for (let index = 0; index < argsTypes.length; index++) argsRules[index] = argsTypes[index][1].trim() || 'Any';
        return argsRules;
    }


    /**
     * It takes a string of arguments, splits them into an array, splits each argument into a key and
     * value, and returns an array of the keys
     * @param args - The arguments that are passed to the function.
     * @returns An array of strings.
     */
    static parseNamesArgumentsUnit(args) {
        args = args.trim().split(",");
        let argsParse = [];
        let argsNames = [];
        for (let index = 0; index < args.length; index++) argsParse.push(args[index].split(':'));
        for (let index = 0; index < argsParse.length; index++) argsNames.push(argsParse[index][0].trim());
        return argsNames;
    }


    /**
     * It takes a string, and returns an array of three strings.
     * @param lineCode - the line of code that is being parsed
     * @returns An array of three elements.
     */
    static parseUnitStatement(lineCode){
        let smallAbstractSyntaxTree = {};
        smallAbstractSyntaxTree['unit'] = {};
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        const unitName = lineCode.substring(lineCode.indexOf(' ') + 1, lineCode.indexOf('(')).trim();
        const unitArguments = lineCode.substring(lineCode.indexOf('('), lineCode.indexOf(')') + 1);
        const argsRules = this.parseTypesArgumentsUnit(unitArguments.slice(1, -1));
        const argsNames = this.parseNamesArgumentsUnit(unitArguments.slice(1, -1));
        smallAbstractSyntaxTree['unit']['name'] = unitName;
        smallAbstractSyntaxTree['unit']['args'] = unitArguments;
        smallAbstractSyntaxTree['unit']['argsnames'] = argsNames;
        smallAbstractSyntaxTree['unit']['rules'] = { ...argsRules };
        return smallAbstractSyntaxTree;
    }
}

module.exports = Parser;