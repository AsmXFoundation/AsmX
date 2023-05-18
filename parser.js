const { TypeError, SymbolError, SyntaxError, CodeStyleException, InstructionException, StructureException } = require("./anatomics.errors");
const ValidatorByType = require("./checker");
const Lexer = require("./lexer");
const ServerLog = require("./server/log");
const Structure = require("./structure");
const Color = require("./utils/color");

class Parser {
    static parse(sourceCode) {
        let lines = sourceCode.split('\n');
        let tokens = [];
        let newLines = [];
        let isInterpreteProccess = { state: true };
        lines = lines.map(line => line.indexOf(';') >= 0 ? line.split(';') : line);

        lines.forEach((line, index) => {
            if (this.parseAndDeleteEmptyCharacters(line) != '') {
                let parsed = this.parseAndDeleteEmptyCharacters(line);
                
                if (parsed.endsWith(',')) {
                    new SyntaxError(`<source:${index+1}:${parsed.lastIndexOf(',')+1}>  Invalid character`, {
                        select: ',',
                        row: index,
                        code: line,
                        position: 'end'
                    });

                    if (lines.length-1 == index) {
                        ServerLog.log('The end of the file, delete the last character or add more arguments to this instruction.', 'Possible fixes');
                        process.exit(1);
                    }

                    if (lines[index+1] == '' || /^\@\w+/.test(lines[index+1])) {
                        ServerLog.log('You may need to supplement this instruction or delete this symbol.', 'Possible fixes');
                        process.exit(1);
                    }
                }
            }

            if (Array.isArray(line))
                for (let idx = 0, len = line.length; idx < len; idx++) newLines.push(line[idx]);
            else
                newLines.push(line);
        });

        lines = newLines;

        ParserCycle: for (let index = 0; index < lines.length; index++) {
            const line = lines[index].trim();
          //  line.indexOf('#') === 0 ? instructions.push(line) : false;
          //  line.indexOf('#') >= 0  ? instructions.push(line.substring(0, line.indexOf('#'))) : false;

           if (line.length === 0) continue;

            if (isInterpreteProccess.state && Structure.is(line)){
                isInterpreteProccess.state = false;
                let structureName = Structure.getNameByLine(line.trim())[1];
                let structureBody = [];
                let fixedLine = index;

                StructureCycle: for (let idx = fixedLine, len = lines.length, iterator = 0; idx < len; idx++, iterator++) {
                    let lineStructure = lines[idx].trim();
                    this.parseAndDeleteEmptyCharacters(lineStructure) != '' && this.parseStatement(lineStructure, idx);
                    let structureNameByLine = Structure.getNameByLine(lineStructure);
                    if (structureNameByLine != null) structureNameByLine = structureNameByLine[1];
                    if (iterator > 0 && structureNameByLine == structureName) StructureException.NestedStructureException(structureName, lineStructure, idx);
                    if (iterator > 0 && Structure.is(lineStructure)) StructureException.NestedStructureInStructureException(structureName, structureNameByLine, lineStructure, idx);
                    if (lineStructure.length === 0) break StructureCycle;
                    else structureBody.push(lineStructure), lines[idx] = '';
                }

                if (structureBody.length === 1) StructureException.EmptyStructureException(structureName, structureBody[0], fixedLine);
                structureName = structureName[0].toLowerCase() + structureName.slice(1);
                tokens.push({ [structureName]: structureBody });
                isInterpreteProccess.state = true;
                continue;
            } else if (isInterpreteProccess.state) {
                this.parseAndDeleteEmptyCharacters(line) != '' && tokens.push(this.parseStatement(line, index));
            }
        }

        return tokens;
    }


    /**
    * The function parses a statement in a given line of code and returns an abstract syntax tree.
    * @param line - The current line of code being parsed as a string.
    * @param index - The index parameter is the line number or index of the current line being parsed
    * in the code. It is used to provide context in case of syntax errors or other issues during
    * parsing.
    * @returns The function `parseStatement` is returning an abstract syntax tree (AST) for a given
    * statement in the input `line`. The type of statement is determined by parsing the string and
    * checking if it is a valid statement. If it is a valid statement, the corresponding
    * `parse<Statement>` function is called to generate the AST. If it is not a valid statement, a
    * `SyntaxError` is
    */
    static parseStatement(line, index){
        let stmt;

        line.trim().indexOf(' ') > -1 ?
            stmt = this.parseAndDeleteEmptyCharacters(line).substring(line.indexOf('@') + 1, line.indexOf(' '))
            : stmt = line.substring(1);

        stmt = stmt[0].toUpperCase() + stmt.substring(1);
        let ast;

        if (this.isStatement(stmt)) {
           ast = this[`parse${stmt}Statement`](line, index);
        } else {
            ServerLog.log('This instruction does not exist', 'Exception');
            new SyntaxError(`\n<source:${index+1}:1>  This instruction does not exist`, { code: line, row: index });
            ServerLog.log('You need to remove this instruction.', 'Possible fixes');
            process.exit(1);
        }

        return ast;
    }


    /**
     * The function checks if a given statement is valid by checking if there is a corresponding
     * parsing function for it.
     * @param stmt - stmt is a parameter that represents a statement in a programming language.
     * @returns The function `isStatement` is returning a boolean value that indicates whether the
     * object that the function is called on has a method with a name that matches the string passed as
     * an argument to the function with the prefix "parse" and suffix "Statement".
     */
    static isStatement(stmt) {
        return Reflect.has(this, `parse${stmt}Statement`);
    }


    /**
     * The function parses a define statement in JavaScript and returns a small abstract syntax tree.
     * @param lineCode - a string representing a line of code that contains a define statement
     * @param row - The row number where the code is located in the source file.
     * @returns The function `parseDefineStatement` returns either a small abstract syntax tree object
     * containing the name and value of the defined constant, or the string 'rejected' if the input
     * line of code does not meet certain criteria.
     */
    static parseDefineStatement(lineCode, row){
        let ast = { define: {}, parser: { code: lineCode, row: row } };
        let originalLine = lineCode;
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const instructionPattern = /^@[d|D]efine\s+([\w-]+)\s+(.+)$/;
        const match = instructionPattern.exec(lineCode);
        
        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: originalLine
            });

            if (match == null && (lineCode.indexOf("'") > -1 || lineCode.indexOf('"') > -1)) {
                ServerLog.log('You are not allowed to use a quotation mark near the instruction or the name of the constant', 'Possible fixes');
            }

            process.exit(1);
        }
        
        if (!/^[A-Z]+(_[A-Z]+)*$/.test(match[1])) {
            new CodeStyleException('Invalid constant name style', {
                row: row, code: originalLine, select: match[1]
            });

            ServerLog.log('You need to write the name of the constant in the SNAKE_UPPER_CASE style', 'Possible fixes');

            if (match[1].startsWith('_') || match[1].endsWith('_')) {
                ServerLog.log('You are not allowed to use underscores at the beginning or end of the constant name', 'Possible fixes');
            }

            process.exit(1);
        }

        let value = match[2];
        Lexer.lexer(value, { row: row, code: originalLine });
        ast['define']['name'] = match[1];
        ast['define']['value'] = value;
        return ast;
    }


    /**
     * It takes a line of code and returns an object with the alias of the imported module
     * @param lineCode - The line of code that is being parsed.
     * @returns an object.
     */
    static parseImportStatement(lineCode, row){
        let ast = { import: {}, parser: { code: lineCode, row: row } };
        let originalLine = lineCode;
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, Alias] = lineCode.split(' ');
        if (!ValidatorByType.validateTypeIdentifier(Alias)) Lexer.lexer(Alias, { code: originalLine, row: row + 1 });

        if (lineCode.split(' ').length > 2) {
            process.exit(1);
        }

        if (Alias == undefined) { process.stdout.write('Alias not defined'); return 'rejected'; }
        else  ast['import']['alias'] = Alias;
        ast['import']['linecode'] = lineCode;
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and returns an object with the second part as
     * a property of the first part
     * @param lineCode - The line of code that is being parsed.
     * @returns a small abstract syntax tree.
     */
    static parseRetStatement(lineCode, row){
        let ast = { ret: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args,ast.parser, [1, 1]);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        ast['ret']['arg'] = args[0];
        return ast;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and returns an object with the
     * arguments as properties.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of 'add' and a value of an object with a key of 'args' and a value
     * of an array of arguments.
     */
    static parseEqualStatement(lineCode, row) {
        let ast = { equal: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['equal']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code and returns an object with the name of the function and the arguments
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parseCallStatement(lineCode, row){
        let ast = { call: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        let tokens = /\@[c|C]all\s+(\w+)\(([^]+)?\)/.exec(lineCode);

        if (tokens == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['call']['name'] = tokens[1];
        ast['call']['args'] = tokens[2] || '()';
        return ast;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and returns an object with the
     * arguments as properties.
     * @param lineCode - the line of code that is being parsed
     * @returns an object.
     */
    static parseAddStatement(lineCode, row){
        let ast = { add: {}, parser: { code: lineCode, row: row  } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['add']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code and returns an object with the sub statement and its arguments.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of 'sub' and a value of an object with a key of 'args' and a value
     * of an array of arguments.
     */
    static parseSubStatement(lineCode, row){
        let ast = { sub: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['sub']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code, splits it into an array of arguments, and then validates each argument
     * @param lineCode - the line of code that is being parsed
     * @returns A small abstract syntax tree.
     */
    static parseDivStatement(lineCode, row) {
        let ast = { div: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['div']['args'] = args;
        return ast;
    }


    /**
     * It takes a line of code, splits it into arguments, and then validates each argument.
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parseModStatement(lineCode, row) {
        let ast = { mod: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['mod']['args'] = args;
        return ast;
    }
    

    /**
     * It takes a line of code, splits it into an array of arguments, and then validates each argument.
     * @param lineCode - the line of code that is being parsed
     * @returns an object.
     */
    static parseMulStatement(lineCode, row){
        let ast = { imul: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'], operators: ['=', '+', '-', '*', '%', '/'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [2, 6]);
        ast['mul']['args'] = args;
        return ast;
    }


    /**
     * The function parses a route statement and returns an abstract syntax tree object containing the
     * route name and address.
     * @param lineCode - a string representing a line of code to be parsed and processed.
     * @param row - The row number of the code being parsed.
     * @returns either an object representing the parsed route statement or the string 'rejected' if
     * the statement is invalid.
     */
    static parseRouteStatement(lineCode, row){
        let ast = { route: {}, parser: { row, code: lineCode } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 3) return 'rejected';
        const [, RouteName, RouteAddress] = lineCode.split(' ');

        if (RouteAddress && !ValidatorByType.validateTypeHex(RouteAddress)) {
            new TypeError(lineCode, RouteAddress);
            return 'rejected';
        }

        ast['route']['name'] = RouteName;
        ast['route']['address'] = RouteAddress;
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and returns an object with the second part as
     * a property of the first part.
     * @param lineCode - the line of code that is being parsed
     * @returns an object with a key of 'stack' and a value of an object with a key of 'address' and a
     * value of the stack address.
     */
    static parseStackStatement(lineCode, row){
        let ast = { stack: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, StackAddress] = lineCode.split(' ');
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        if (lineCode.split(' ').length > 2) return 'rejected';

        if (!ValidatorByType.validateTypeHex(StackAddress)) {
            new TypeError(lineCode, StackAddress);
            return 'rejected';
        }

        ast['stack']['address'] = StackAddress;
        return ast;
    }


    /**
     * It takes a string, splits it into two parts, and returns an object with the two parts as
     * properties.
     * @param lineCode - The line of code that is being parsed
     * @returns An array of objects.
     */
    static parseIssueStatement(lineCode, row){
        let ast = { issue: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        if (lineCode.split(' ').length > 2) return 'rejected';
        const [, IssueStatus] = lineCode.split(' ');
        Lexer.lexerBool(lineCode, IssueStatus);
        ast['issue']['state'] = IssueStatus || 'on';
        return ast;
    }


    /**
     * It takes a string and replaces all the empty characters with a single space.
     * @param lineCode - The line of code that is being parsed.
     * @returns The line of code with all the empty characters removed.
     */
    static parseAndDeleteEmptyCharacters(lineCode){
        if (Array.isArray(lineCode)) lineCode = lineCode.filter(code => code.trim() != ''),
            lineCode = lineCode[0];
        else
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
    static parseSetStatement(lineCode, row){
        let ast = { set: {}, parser: { code: lineCode, row: row } };
        let originalLine = lineCode;
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const instructionPattern = /^@[s|S]et\s+([^-]+)?\s+([\w-]+)(<(\s+?)?\w+.+?(\s+)?\w+(\s+)?>)?\s+?(.+)$/;
        let match = instructionPattern.exec(lineCode);
        
        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: originalLine
            });
            
            process.exit(1);
        }

        if (/^[A-Z]+(_[A-Z]+)*$/.test(match[1])) ServerLog.log('For better readability, it is better not to make the variable name in the SNAKE_UPPER_CASE style, since basically this style is used only in constant names.', 'Warning');
        match = match.filter(lexem => lexem !== undefined).filter(lexem => lexem != ' ');

        if (match.length == 5) { 
            ast['set']['generics'] = match[3];
            ast['set']['value'] = match[4];
        } else ast['set']['value'] = match[3];

        ast['set']['name'] = match[1];
        ast['set']['type'] = match[2];
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and then returns an object with the two parts
     * as properties.
     * @param lineCode - The line of code that is being parsed.
     * @returns An array of objects.
     */
    static parseInvokeStatement(lineCode, row){
        let ast = { invoke: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, InvokeAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';

        // if (!/^[A-Z]+(_[A-Z]+)*$/.test(InvokeAddress) || !ValidatorByType.validateTypeHex(InvokeAddress)) {
        //     new TypeError(lineCode, InvokeAddress);
        //     return 'rejected';
        // }

        if (typeof InvokeAddress == 'undefined') console.error('[AsmX]: Invoke address not found');
        else  ast['invoke']['address'] = InvokeAddress;
        return ast;
    }


    /**
     * It takes a line of code, parses it, and then sets the memory address to the value.
     * </code>
     * @param lineCode - The line of code that is being parsed.
     */
    static parseMemoryStatement(lineCode){
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        const [, memoryValue, memoryAddress] = lineCode.split(' ');
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
    static parseAddressStatement(lineCode){
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
        for (let index = 0; index < argsTypes.length; index++) argsRules[index] =  argsTypes[index][1] != undefined ? argsTypes[index][1].trim() : 'Any';
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
    static parseUnitStatement(lineCode, row){
        let ast = { unit: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: false, operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        const unitName = lineCode.substring(lineCode.indexOf(' ') + 1, lineCode.indexOf('(')).trim();
        const unitArguments = lineCode.substring(lineCode.indexOf('('), lineCode.indexOf(')') + 1);
        const argsRules = this.parseTypesArgumentsUnit(unitArguments.slice(1, -1));
        const argsNames = this.parseNamesArgumentsUnit(unitArguments.slice(1, -1));
        ast['unit']['name'] = unitName;
        ast['unit']['args'] = unitArguments;
        ast['unit']['argsnames'] = argsNames;
        ast['unit']['rules'] = { ...argsRules };
        return ast;
    }


    /**
     * It takes a line of code, splits it into two parts, and then checks if the second part is a valid
     * hexadecimal number. If it is, it returns an object with the second part as a property. If it
     * isn't, it returns 'rejected'
     * @param lineCode - The line of code that is being parsed.
     * @returns An object with a key of 'offset' and a value of an object with a key of 'address' and a
     * value of the address.
     */
    static parseOffsetStatement(lineCode, row){
        let ast = { offset: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { brackets: ['(', ')', '{', '}'] });
        const [, OffsetAddress] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';

        if (!ValidatorByType.validateTypeHex(InvokeAddress)) {
            new TypeError(lineCode, InvokeAddress);
            return 'rejected';
        }

        if (typeof OffsetAddress == 'undefined') console.error('[AsmX]: address not found');
        else  ast['offset']['value'] = OffsetAddress;
        return ast;
    }


    /**
     * It takes a line of code, and returns an object with the model name
     * @param lineCode - The line of code that is being parsed.
     * @returns an object.
     */
    static parseUnsetStatement(lineCode, row){
        let ast = { unset: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        const [, UnsetModel] = lineCode.split(' ');
        if (lineCode.split(' ').length > 2) return 'rejected';
        if (typeof UnsetModel == 'undefined') console.error('[AsmX]: model not defined');
        ast['unset']['model'] = UnsetModel;
        return ast;
    }


    /**
     * The function parses and returns a small abstract syntax tree for a modify statement in
     * JavaScript.
     * @param lineCode - a string representing a line of code that contains a modify statement.
     * @returns either a rejected string if the first element of the commandArray is not '@Modify', or
     * a small abstract syntax tree object with the 'modify' key containing a nested object with
     * 'model' and 'value' keys.
     */
    static parseModifyStatement(lineCode, row){
        let ast = { modify: {}, parser: { code: lineCode, row: row } };
        const commandArray = lineCode.trim().split(/\s+/);
        if (commandArray[0] !== '@Modify') { return 'rejected'; }
        const registerName = commandArray[1];
        const value = commandArray.slice(2).join(' ');
        ast['modify']['model'] = registerName;
        ast['modify']['value'] = value;
        return ast;
    }


    /**
     * It takes a string, splits it into an array, then maps the array to a new array, then returns the
     * new array.
     * @param lineCode - the line of code that is being parsed
     * @returns An object with a key of execute and a value of an object with a key of args and a value
     * of an array of strings.
     */
    static parseExecuteStatement(lineCode, row){
        let ast = { execute: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        if (lineCode.split(' ').length > 7) return 'rejected';
        let  args =  lineCode.indexOf(',') > -1 ? lineCode.split(',') : lineCode.split(' ');
        args = args.map(arg => arg.indexOf(' ') > -1 ? arg.split(' ')[1] : arg);
        args.map(arg => ValidatorByType.validateTypeHex(arg));
        ast['execute']['cmd'] = args[1];
        ast['execute']['args'] = args.slice(2);
        return ast;
    }


    /**
     * It takes a line of code, and returns an object that represents the line of code.
     * 
     * The line of code is a string. The object is a JavaScript object.
     * 
     * The line of code is a line of code in a programming language called "POP". The object is an
     * abstract syntax tree for the line of code.
     * 
     * The line of code is a line of code in a programming language called
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parsePopStatement(lineCode, row) {
        let ast = { pop: {}, parser: { code: lineCode , row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [0, 0]);
        return ast;
    }


    /**
     * It takes a line of code and returns an object that represents the line of code.
     *
     * The function is called parsePushStatement. It takes a line of code as an argument. It returns an
     * object that represents the line of code.
     * 
     * The function is called parsePushStatement. It
     * @param lineCode - the line of code that is being parsed
     * @returns a small abstract syntax tree.
     */
    static parsePushStatement(lineCode, row) {
        let ast = { push: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [1, 2]);
        ast['push']['args'] = args[0];
        return ast;
    }


    /**
     * The function parses a "get" statement in JavaScript code and returns an abstract syntax tree
     * (AST) object with the arguments.
     * @param lineCode - The parameter `lineCode` is a string representing a line of code that contains
     * a "get" statement. The method `parseGetStatement` parses this line of code and returns an
     * abstract syntax tree (AST) object representing the "get" statement.
     * @returns If the length of the split lineCode is greater than 2, the function returns 'rejected'.
     * Otherwise, it returns an AST (Abstract Syntax Tree) object with a 'get' property containing an
     * 'args' property that holds the second element of the split lineCode.
     */
    static parseGetStatement(lineCode, row) {
        let ast = { get: {}, parser: { code: lineCode, row: row }  };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'], brackets: ['{', '}', '(', ')'] });
        let args = this.parserArgumentsInstruction(lineCode);
        this.checkLimitArguments(args, ast.parser, [1, 1]);
        ast['get']['args'] = args[0];
        return ast;
    }


    /**
     * This function parses a label statement in JavaScript code and returns an abstract syntax tree
     * (AST) object containing information about the label.
     * @param lineCode - The code for a single line of a program.
     * @param row - The row number of the line of code being parsed.
     * @returns an object with a "label" property that contains a "name" property and a "parser"
     * property that contains a "code" and "row" property. If the input line of code is invalid or does
     * not contain the expected label syntax, the function returns the string "rejected".
     */
    static parseLabelStatement(lineCode, row) {
        let ast = { label: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[L|l]abel\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['label']['name'] = match[1];
        return ast;
    }


    /**
     * This function parses an environment statement in JavaScript code and returns an abstract syntax
     * tree (AST) object.
     * @param lineCode - a string representing a line of code to be parsed as an environment statement
     * @param row - The line number or row in the code where the statement is located.
     * @returns an object with the parsed environment statement, which includes the environment name
     * and parser information. If the input line of code is invalid or missing required arguments, the
     * function will return the string 'rejected'.
     */
    static parseEnviromentStatement(lineCode, row) {
        let ast = { enviroment: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[E|e]nviroment\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['enviroment']['name'] = match[1];
        return ast;
    }


    static parseSubprogramStatement(lineCode, row) {
        let ast = { subprogram: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode, { operators: ['=', '+', '-', '*', '%', '/'] });
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[S|s]ubprogram\s+(\w+)(?=\s+\:|\:)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['subprogram']['name'] = match[1];
        return ast;
    }


    static parseUsingStatement(lineCode, row) {
        let ast = { using: {}, parser: { code: lineCode, row: row } };
        lineCode = this.parseAndDeleteEmptyCharacters(lineCode);
        this.lexerSymbol(lineCode);
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        let match = lineCode.match(/^\@[U|u]sing\s+(\w+)\s+(\w+)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['using']['structure'] = match[1];
        ast['using']['name'] = match[2];
        return ast;
    }

    /**
     * This function parses the arguments of a given line of code in JavaScript.
     * @param lineCode - The code line that contains the instruction and its arguments.
     * @returns The function `parserArgumentsInstruction` returns an array of parsed arguments
     * extracted from the input `lineCode`. The function first checks if the input contains a comma
     * (`,`) and splits the input by comma. If there are spaces in any of the arguments, it splits them
     * by space as well. The resulting array is then flattened to remove any nested arrays. If there
     * are no commas in the input, the array is returned as an empty array instead of returning an empty array 
     * with the same length and no nested arrays returned
     */
    static parserArgumentsInstruction(lineCode) {
        let parsed;

        if (lineCode.indexOf(',') > -1) {
            parsed = lineCode.split(',').map(argument => argument.indexOf(' ') > -1 ? argument.split(' ') : argument).flatMap(argument => argument);
        } else if (lineCode.indexOf(' ') > -1) parsed = lineCode.split(' ');

        return parsed && parsed.filter(argument => argument.trim() != '').slice(1) || [];
    }


    /**
     * This function checks if the number of arguments passed to a function is within a specified range and throws an exception if it is not.
     * @param args - an array of arguments passed to a function
     * @param options - an object containing information about the instruction, such as the row and code
     * @param list - A list of integers representing the minimum number of arguments required for a given instruction.
     */
    static checkLimitArguments(args, options, list) {
        const constexpr = (list[0] == 1 && args.length == 1);

        if (!constexpr && list && list[0] > args.length) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: options.row,     code: options.code
            });

            process.exit(1);
        }

        if (list[1] && (args.length > list[1])) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}InstructionException${Color.FG_WHITE}]:  You have too many arguments.`, {
                row: options.row,     code: options.code
            });

            process.exit(1);
        }
    }


    /**
     * It checks if a line of code contains a symbol.
     * @param lineCode - The line of code that is being checked for a symbol.
     * @param symbol - The symbol to check for.
     * @returns The function isSymbol is being returned.
     */
    static isSymbol(lineCode, symbol) {
        if (typeof symbol === 'string') {
            return lineCode.indexOf(symbol) !== -1 ? true : false;
        } else if (Array.isArray(symbol)) {
            let result = false;
            for (let i = 0; i < symbol.length; i++) if (lineCode[i] === symbol[i]) result = true;
            return result;
        } else if (lineCode === undefined) {
            throw { message: `[${Color.FG_RED}SyntaxException${Color.FG_WHITE}]: Missing line code for symbol: ${symbol}` };
        }
    }


    /**
     * The function checks for invalid symbols in a given line of code based on specified options.
     * @param line - The input string that needs to be checked for symbols.
     * @param options - An object that contains optional parameters for the lexerSymbol function.
     */
    static lexerSymbol(line, options) {
        let brackets = options?.brackets == false ? '' : options?.brackets || ['(', ')', '[', ']', '{', '}'];
        let operators = options?.operators == false ? '' : options?.operators || ['=', '+', '-', '*', '%', ':', '/'];
        let angles = options?.angles == false ? '' : options?.angles || ['<', '>'];
        let quoted = options?.quoted == false ? '' : options?.quoted || [ '"', "'"];
        let other = options?.other == false ? '' : options?.other || ['&', '\\', '!', '?', '№', '|', '^'];
        let symbols = [brackets, operators, angles, quoted, other].flat().filter(char => char != '');

        for (let i = 0; i < symbols.length; i++)
            if (this.isSymbol(line, symbols[i])) {
                new SymbolError(line, symbols[i], SymbolError.INVALID_SYMBOL_ERROR);
                ServerLog.log('You need to remove this symbol.', 'Possible fixes');
                process.exit(1);
            }
    }
}

module.exports = Parser;