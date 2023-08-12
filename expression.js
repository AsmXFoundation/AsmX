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
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
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

    addTokenType(type) {
        this.addToken(type, null);
    }

    addToken(type, literal) {
        let text = this.#source.substring(this.start, this.current);
        this.#tokens.push(new Token(type, text, literal, this.line));
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
                else throw "Unexpected character.";
                break;
        }
    }
}


class Expression {
    constructor(expression) {
        this.expression = expression || '';
        if (typeof expression === 'string') {
            const ast = this.parse(this.expression);
            let isParens = ast.find(item => item instanceof Array && item.find(i => i.type == EXPRESSION_TOKEN_TYPE.LEFT_PAREN));

            if (isParens == undefined) {
                let tokens = this.definitionTokens(ast);
                let watch = this.evaluateSimple(tokens);

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
                        // if (depth > 0 && list[parensIndex][depth] == undefined) list[parensIndex][depth] = []; // v2
                        // else if (depth > 0) list[parensIndex][depth].push(token);

                        depth++;
                        parensIndex = index;
                        if (list[parensIndex] == undefined) list[parensIndex] = [];

                        if (depth == 0) list[parensIndex].push(token);
                        list[parensIndex].push(token);
                        next = true;
                    } else {
                        if (next) { // (...
                            // ((3 + 1) + 34) * 2 + 1
                            if (token.type === EXPRESSION_TOKEN_TYPE.LEFT_PAREN) {
                                // list[parensIndex][depth].push(token); // v2

                                depth++;
                                list[parensIndex].push(token);
                            } else if (token.type === EXPRESSION_TOKEN_TYPE.RIGHT_PAREN) {
                                list[parensIndex].push(token);
                                // list[parensIndex][depth].push(token); // v2
                                // console.log(list[parensIndex], scopeParens(list[parensIndex].slice(2, -1)));
                                if (depth > 0) depth--;
                                else if (depth == 0) next = false;
                            } else {
                                if (depth > 0) list[parensIndex].push(token);
                                // console.log(depth, list[parensIndex]);
                                // if (depth > 0) list[parensIndex][depth].push(token); // v2
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
            // console.log(list);
            return list;
        }

        newast = splitNumber(scanNumber(tokens));
        newast = scopeParens(newast);
        return newast;
    }


    evaluateSimple(ast) {
        let index = 0;
        let newast = [];
        let priorityMax = this.priorityMax(ast);
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


    definitionTokens(ast) {
        let newast = [];

        for (const token of ast)
            if (token instanceof Token)
                newast.push(Reflect.ownKeys(this.priorityOperators).includes(token.lexeme) ? new Operator(this.priorityOperators[token.lexeme], token.lexeme, null, 1) : token);

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