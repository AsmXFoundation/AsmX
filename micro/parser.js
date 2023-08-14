const { SymbolError, SyntaxError, InstructionException, StructureException } = require("../exception");

const ServerLog = require("../server/log");
const NeuralNetwork = require("../tools/neural");
const Color = require("../utils/color");
const Structure = require("./structure");

class Parser {
    static parse(sourceCode) {
        let lines = sourceCode.split('\n');
        let tokens = [];
        let newLines = [];
        let isInterpreteProccess = { state: true };
        lines = lines.map(line => line.trim());
        lines = lines.map(line => line.indexOf(';') >= 0 ? line.split(';').filter(l => l.trim() != '') : line);

        lines.forEach((line, index) => {
            if (this.parseAndDeleteEmptyCharacters(line) != '') {
                let parsed = this.parseAndDeleteEmptyCharacters(line);

                if (parsed.endsWith(';')) {
                    new SyntaxError(`<source:${index+1}:${parsed.lastIndexOf(';')+1}>  Invalid character`, {
                        select: ',',
                        row: index,
                        code: line,
                        position: 'end'
                    });
                }
                
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

                    if (lines[index+1] == '' || /^\w+/.test(lines[index+1])) {
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

        for (let index = 0; index < lines.length; index++) {
            const line = lines[index].trim();
            if (line.length === 0) continue;

            if (isInterpreteProccess.state && Structure.is(line)){
                isInterpreteProccess.state = false;
                let structureName = Structure.getNameByLine(line)[1];
                let structureBody = [];
                let fixedLine = index;

                StructureCycle: for (let idx = fixedLine, len = lines.length, iterator = 0; idx < len; idx++, iterator++) {
                    let lineStructure = lines[idx].trim();
                    // this.parseAndDeleteEmptyCharacters(lineStructure) != '' && this.parseStatement(lineStructure, idx);
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


    static parseAndDeleteEmptyCharacters(lineCode){
        if (Array.isArray(lineCode)) lineCode = lineCode.filter(code => code.trim() != ''),
            lineCode = lineCode[0];
        else
            lineCode = lineCode.replace(/\s+/g, ' ').trim();
        return  lineCode.substring(0, lineCode.indexOf('#') >= 0 ? lineCode.indexOf('#') -1 : lineCode.length);
    }


    static parseStatement(line, index){
        let stmt;

        line.trim().indexOf(' ') > -1 ?
            stmt = this.parseAndDeleteEmptyCharacters(line).substring(0, line.indexOf(' '))
            : line.trim() != '' ? stmt = line : line;

        // Experemental mode
        if (stmt.substring(1) == stmt.substring(1).toUpperCase()) {
            if (stmt[0] == stmt[0].toUpperCase() && stmt.substring(1) == stmt.substring(1).toUpperCase()) stmt = stmt[0].toUpperCase() + stmt.substring(1).toLowerCase();
            line = `${stmt} ${line.slice(line.indexOf(' '))}`;
        } else {
            stmt = stmt[0].toUpperCase() + stmt.substring(1);
        }
        //

        let ast;

        if (this.isStatement(stmt)) {
           ast = this[`parse${stmt}Statement`](line, index);
        } else {
            ServerLog.log('This instruction does not exist', 'Exception');
            new SyntaxError(`\n<source:${index+1}:1>  This instruction does not exist`, { code: line, row: index });
            ServerLog.log('You need to remove this instruction.', 'Possible fixes');

            const instructions = Reflect.ownKeys(this).filter(property => /parse\w+Statement/.test(property)).map(token => /parse(\w+)Statement/.exec(token)).map(list => list[1]);
            const coincidences = NeuralNetwork.coincidence(instructions, stmt);
            const presumably = NeuralNetwork.presumably(coincidences);
            ServerLog.log(`Perhaps you wanted to write some of these instructions: { ${presumably.map(item => `${Color.FG_GREEN}${item}${Color.FG_WHITE}`).join(', ')} }`, 'Neural Log');

            process.exit(1);
        }

        return ast;
    }


    static isStatement(stmt) {
        return Reflect.has(this, `parse${stmt}Statement`);
    }


    static parseMsgStatement(line, row) {
        let ast = { msg: {}, parser: { code: line, row: row + 1 } };
        ast.msg['message'] = line.substring(line.indexOf(' '));
        return ast;
    }


    static parsePrintStatement(line, row) {
        let ast = { msg: {}, parser: { code: line, row: row + 1 } };
        ast.msg['message'] = line.substring(line.indexOf(' '));
        return ast;
    }


    static parseDelayStatement(line, row) {
        let ast = { delay: {}, parser: { code: line, row: row + 1 } };
        ast.delay.time = line.substring(line.indexOf(' '));
        return ast;
    }


    static parseExitStatement(line, row) {
        let ast = { exit: {}, parser: { code: line, row: row + 1 } };

        if (line.trim() !== 'exit') {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}CommandException${Color.FG_WHITE}]: you shouldn't have arguments or anything superfluous.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        return ast;
    }


    static parseTarStatement(line, row) {
        let ast = { tar: {}, parser: { code: line, row: row + 1 } };
        line = line.substring(line.indexOf(' ')).trim(); // rm cmd
        let name = line.substring(0, line.indexOf(' '));
        if (!name.endsWith('.tar')) name += '.tar';
        ast.tar['name'] = name; // <arg1> arg2
        line = line.substring(line.indexOf(' ')).trim();
        ast.tar['archive'] = line;
        return ast;
    }


    static _parseSectionStatement(line, row) {
        let ast = { section: {}, parser: { code: line, row: row } };
        line = this.parseAndDeleteEmptyCharacters(line);
        this.lexerSymbol(line, { operators: ['=', '+', '*', '%', '/'] });
        if (typeof line !== 'string' || line.length === 0) return undefined;
        let match = line.match(/^\.[S|s]ection\s+(\w+)\-(\w+)/);

        if (match == null) {
            new InstructionException(`${Color.BRIGHT}[${Color.FG_RED}SectionException${Color.FG_WHITE}]:  You don't have enough arguments.`, {
                row: row,     code: ast.parser.code
            });

            process.exit(1);
        }

        ast['section']['name'] = `${match[1]}-${match[2]}`;
        return ast;
    }


    static isSymbol(line, symbol) {
        if (typeof symbol === 'string') {
            return line.indexOf(symbol) !== -1 ? true : false;
        } else if (Array.isArray(symbol)) {
            let result = false;
            for (let i = 0; i < symbol.length; i++) if (lineCode[i] === symbol[i]) result = true;
            return result;
        } else if (lineCode === undefined) {
            throw { message: `[${Color.FG_RED}SyntaxException${Color.FG_WHITE}]: Missing line code for symbol: ${symbol}` };
        }
    }


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


module.exports = {
    MicroParser: Parser
}