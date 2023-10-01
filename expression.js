const { ExpressionException } = require("./exception");
const ServerLog = require("./server/log");

const EXPRESSION_TOKEN_TYPE = {
    LEFT_PAREN: 'LEFT_PAREN',
    RIGHT_PAREN: 'RIGHT_PAREN',
    DEGREE: 'DEGREE',
    DOT: 'DOT',
    MINUS: 'MINUS',
    PLUS: 'PLUS',
    SLASH: 'SLASH',
    STAR: 'STAR',
    SPACE: 'SPACE',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',

    EOF: 'EOF'
}


class Token {
    constructor(type, lexeme, literal, line, index) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.index = index || 0;
    }

    toString() {
        return this.type + " " + this.lexeme + " " + this.literal;
    }
}


class Operator {
    constructor(priority, lexeme, literal, line) {
        this.priority = priority;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return this.type + " " + this.lexeme + " " + this.literal;
    }
}


class Scanner {
    #source;
    #tokens = new Array();

    start = 0;
    current = 0;
    line = 1;

    constructor(source) {
        this.#source = source;
    }

    isAtEnd() {
        return this.current >= this.#source.length;
    }


    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.#tokens.push(new Token(EXPRESSION_TOKEN_TYPE.EOF, "", null, this.line));
        return this.#tokens;
    }


    advance() {
        return this.#source.charAt(this.current++) || '';
    }


    addTokenType(type, char) {
        this.addToken(type, null, char);
    }


    addToken(type, literal, char) {
        let text = this.#source.substring(this.start, this.current);
        this.#tokens.push(new Token(type, char ? char : text, literal, this.line, this.current));
    }


    _match(char) {
        if (this.isAtEnd()) return false;
        if (typeof char !== 'string' || char.length > 1) return false;

        this.current++;
        return true;
    }


    _matchInt(char) {
        return /[0-9]/.test(char);
    }

    
    scanToken() {
        let char = this.advance();

        switch (char) {
            case '(': 
                this.addTokenType(EXPRESSION_TOKEN_TYPE.LEFT_PAREN); 
                break;

            case ')': 
                this.addTokenType(EXPRESSION_TOKEN_TYPE.RIGHT_PAREN); 
                break;

            case '-': 
                this.addTokenType(EXPRESSION_TOKEN_TYPE.MINUS); 
                break;

            case '+': 
                this.addTokenType(EXPRESSION_TOKEN_TYPE.PLUS); 
                break;

            case '/':
                this.addTokenType(EXPRESSION_TOKEN_TYPE.SLASH);
                break;

            case '*':
                this.addTokenType(EXPRESSION_TOKEN_TYPE.STAR);
                break;

            case '.':
                this.addTokenType(EXPRESSION_TOKEN_TYPE.DOT);
                break;

            case '^':
                this.addTokenType(EXPRESSION_TOKEN_TYPE.DEGREE);
                break;

            case ' ':
                this.addTokenType(EXPRESSION_TOKEN_TYPE.SPACE);
                break;

            default:
                if (this._matchInt(char)) this.addTokenType(EXPRESSION_TOKEN_TYPE.NUMBER);

                else if (`${char}${this.#source.charAt(this.current) || ''}` == 'pi') {
                    this.addTokenType(EXPRESSION_TOKEN_TYPE.NUMBER, 3.14);
                    this.current++;
                }

                else {
                    new ExpressionException(`expr'${this.#source}'`, "Unexpected character.", this.line, this.current + 4);
                    ServerLog.log('Letters and symbols that are not related to mathematics are prohibited in a mathematical expression.', 'Possible fixes');
                    process.exit(1);
                }
                break;
        }
    }
}


class Expression {
    constructor(expression) {
        this.expression = expression || '';
        if (typeof expression === 'string') {
            const ast = this.parse(this.expression);
            let isParens = this.isParens(ast);
            let tokens = this.definitionTokens(ast);
            let watch;

            if (isParens == undefined) {
                watch = this.evaluateSimple(tokens);
            } else {
                watch = this.evaluateHard(tokens);
                while (this.indexArray(watch) > -1) watch = this.evaluateHard(tokens);
                watch = this.evaluateSimple(watch);
            }

            if (watch instanceof Token && watch.type !== EXPRESSION_TOKEN_TYPE.EOF) {
                this.answer_t = Number(watch.lexeme);
            } else {
                if (watch instanceof Array && watch.length == 1) {
                    this.answer_t = Number(watch[0].lexeme);
                } else {
                    this.answer_t = 0;
                }
            }
        }
    }


    answer() {
        return this.answer_t;
    }

    priorityOperators = {
        '(': 1,
        ')': 2,
        '^': 3,
        '*': 4,
        '/': 4,
        '+': 5,
        '-': 5
    };

    parse(expression) {
        const scanner = new Scanner(expression);
        let tokens = scanner.scanTokens();
        return this.buildAst(tokens);
    }


    buildAst(tokens) {
        let newast = [];
        tokens = tokens.filter(t => t?.type !== EXPRESSION_TOKEN_TYPE.SPACE);
        
        function scanNumber(tokens) {
            let list = [];
            let next = null;
            let index = 0;
            let intIndex = 0;

            for (const token of tokens) {
                if (token instanceof Token) {
                    if (!next && token.type === EXPRESSION_TOKEN_TYPE.NUMBER) {
                        intIndex = index;
                        list[intIndex] = [];
                        list[intIndex].push(token?.lexeme);
                        next = true;
                    } else {
                        if (next && token.type === EXPRESSION_TOKEN_TYPE.NUMBER || token.type === EXPRESSION_TOKEN_TYPE.DOT) {
                            list[intIndex].push(token?.lexeme);
                        } else {
                            list[index] = token;
                            next = false;
                        }
                    }
                }

                index++;
            }

            list = list.filter(i => i);
            return list;
        }


        function splitNumber(tokens) {
            let list = [];

            for (const token of tokens) {
                if (token instanceof Token) {
                   list.push(token);
                } else if (token instanceof Array) {
                    list.push(new Token(EXPRESSION_TOKEN_TYPE.NUMBER, token.join(''), null, 1));
                }
            }

            list = list.filter(i => i);
            return list;
        }


        function scopeParens(tokens) {
            let list = [];
            let next = null;
            let index = 0;
            let parensIndex = 0;
            let depth = 0;

            for (const token of tokens) {
                if (token instanceof Token) {
                    if (!next && token?.type == EXPRESSION_TOKEN_TYPE.LEFT_PAREN) {
                        depth++;
                        parensIndex = index;
                        if (list[parensIndex] == undefined) list[parensIndex] = [];

                        if (depth == 0) list[parensIndex].push(token);
                        list[parensIndex].push(token);
                        next = true;
                    } else {
                        if (next) { // (...
                            if (token.type === EXPRESSION_TOKEN_TYPE.LEFT_PAREN) {
                                depth++;
                                list[parensIndex].push(token);
                            } else if (token.type === EXPRESSION_TOKEN_TYPE.RIGHT_PAREN) {
                                list[parensIndex].push(token);
                                if (depth > 0) depth--;
                                else if (depth == 0) next = false;
                            } else {
                                if (depth > 0) list[parensIndex].push(token);
                                else if (depth == 0) {
                                    list[index] = token;
                                    next = false;
                                }
                            }
                        } else {
                            list[index] = token;
                            next = false;
                        }
                    }
                }

                index++;
            }

            list = list.filter(i => i);
            return list;
        }

        newast = splitNumber(scanNumber(tokens));
        newast = scopeParens(newast);
        return newast;
    }


    evaluateSimple(ast) {
        let index = 0;
        let priorityMin = this.priorityMin(ast);

        if (ast instanceof Array && ast.length == 2) {
            return ast[0];
        }

        for (const token of ast) {
            if (token instanceof Operator) {
                let operand_l = ast[index - 1];
                let operand_r = ast[index + 1];
                [operand_l, operand_r] = this.transformationToken([operand_l, operand_r]).map(t => t.lexeme);

                if (token.priority == priorityMin) {
                    ast[index - 1] = null;
                    ast[index] = new Token(EXPRESSION_TOKEN_TYPE.NUMBER, String(this.Operator()[this.parse(token.lexeme)[0].type.toLowerCase()](operand_l, operand_r)), null, 1);
                    ast[index + 1] = null;
                    ast = ast.filter(t => t);
                    ast = this.evaluateSimple(ast);
                    break;
                }
            }

            index++;
        }

        return ast;
    }


    evaluateHard(ast) {
        let index = 0;

        if (ast instanceof Array) {
            if (this.indexArray(ast) > -1 && ast[this.indexArray(ast)].length == 1) {
                ast[this.indexArray(ast)] = ast[this.indexArray(ast)][0];
                return ast;
            }
        }

        for (let token of ast) {
            if (token instanceof Array) {
                if (token.length == 1) {
                    return token[0];
                } else if (this.isParens(ast)) {
                    let indexLeftParen = this.indexLeftParenByCount(token, this.countLeftParen(token));
                    let indexRightParen = this.indexRightParenByCount(token, 1);
                    let newast = token.slice(indexLeftParen, indexRightParen);
                    newast.push(new Token(EXPRESSION_TOKEN_TYPE.EOF, '', null, 1));
                    let result = this.evaluateSimple(this.definitionTokens(newast));
                    for (let idx = indexLeftParen - 1; idx < indexRightParen + 1; idx++) token[idx] = null;
                    token[indexLeftParen - 1] = result;
                    token = token.filter(t => t);
                    ast[index] = token;
                    ast = this.evaluateHard(ast);
                    break;
                }
            }

            index++;
        }

        return ast;
    }


    indexArray(ast) {
        let idx = -1;
        let count = 0;

        for (let index = 0; index < ast.length; index++) 
            if (count == 0 && Array.isArray(ast[index])) {
                idx = index;
                count++;
            }

        return idx;
    }


    firstLeftParen(ast) {
        let leftParen = 0;
        let countLeftParen = 0;

        for (let index = 0; index < ast.length; index++) {
            const item = ast[index];
            if (item instanceof Token && countLeftParen == 0 && item.type == EXPRESSION_TOKEN_TYPE.LEFT_PAREN) {
                leftParen = index + 1;
                countLeftParen++;
            }
        }

        return leftParen;
    }


    lastRightParen(ast) {
        let rightParen = 0;
        let countRightParen = 0;
        
        for (let index = ast.length; 0 < index; index--) {
            const item = ast[index];

            if (item instanceof Token && countRightParen == 0 && item.type == EXPRESSION_TOKEN_TYPE.RIGHT_PAREN) {
                rightParen = index;
                countRightParen++;
            }
        }

        return rightParen;
    }


    countLeftParen(ast) {
        let countLeftParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == EXPRESSION_TOKEN_TYPE.LEFT_PAREN) countLeftParen++;

        return countLeftParen;
    }


    countRightParen(ast) {
        let countRightParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == EXPRESSION_TOKEN_TYPE.RIGHT_PAREN) countRightParen++;

        return countRightParen;
    }


    indexLeftParenByCount(ast, count) {
        let idx = 0;
        let countLeftParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == EXPRESSION_TOKEN_TYPE.LEFT_PAREN) {
                countLeftParen++;
                if (countLeftParen == count) idx = index + 1;
            }

        return idx;
    }


    indexRightParenByCount(ast, count) {
        let idx = 0;
        let countRightParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == EXPRESSION_TOKEN_TYPE.RIGHT_PAREN) {
                countRightParen++;
                if (countRightParen == count) idx = index;
            }

        return idx;
    }


    isParens(ast) {
        return ast.find(item => item instanceof Array && item.find(i => i.type == EXPRESSION_TOKEN_TYPE.LEFT_PAREN));
    }


    definitionTokens(ast) {
        let newast = [];

        for (const token of ast)
            if (token instanceof Token)
                newast.push(Reflect.ownKeys(this.priorityOperators).includes(token.lexeme) ? new Operator(this.priorityOperators[token.lexeme], token.lexeme, null, 1) : token);
            else if (token instanceof Array) newast.push(token);

        return newast;
    }


    transformationToken(ast) {
        let newast = [];

        for (const token of ast)
            if (token instanceof Token) newast.push(token.type == EXPRESSION_TOKEN_TYPE.NUMBER ? { ...token, lexeme: Number(token.lexeme) } : token);

        return newast;
    }


    priorityMax(ast) {
        let max = 0;

        for (const token of ast)
            if (token instanceof Operator) if (this.priorityOperators[token.lexeme] > max) max = this.priorityOperators[token.lexeme];

        return max;
    }


    priorityMin(ast) {
        let min = 0;
        let max = this.priorityMax(ast);
        let index = 0;
        ast = ast.filter(tree => tree instanceof Operator);

        for (const token of ast) {
            if (index == 0) {
                if (this.priorityOperators[token.lexeme] <= max) min = this.priorityOperators[token.lexeme];
            } else if (index > 0)
                min = this.priorityOperators[token.lexeme] >= min ? min : this.priorityOperators[token.lexeme];

            index++;
        }

        return min;
    }


    Operator() {
        return class {
            static plus(a, b) {
                return a + b;
            }

            static minus(a, b) {
                return a - b;
            }

            static slash(a, b) {
                return a / b;
            }

            static star(a, b) {
                return a * b;
            }

            static degree(a, b) {
                return Math.pow(a, b);
            }
        }
    }
}

module.exports = Expression;