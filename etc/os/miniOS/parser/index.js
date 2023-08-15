const TOKEN_TYPE = {
    STRING_QUOTE: 'STRING_QUOTE',
    STRING_DOUBLE_QUOTE: 'STRING_DOUBLE_QUOTE',

    LEFT_PAREN: 'LEFT_PAREN',
    RIGHT_PAREN: 'RIGHT_PAREN',

    DEGREE: 'DEGREE',
    DOT: 'DOT',
    MINUS: 'MINUS',
    PLUS: 'PLUS',
    SLASH: 'SLASH',
    STAR: 'STAR',
    SPACE: 'SPACE',
    DOLLAR: 'DOLLAR',

    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
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

        this.#tokens.push(new Token(TOKEN_TYPE.EOF, "", null, this.line));
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


    _matchIdentifer(char) {
        return /[a-zA-Z]/.test(char);
    }
    

    scanToken() {
        let char = this.advance();

        switch (char) {
            case '(': 
                this.addTokenType(TOKEN_TYPE.LEFT_PAREN); 
                break;

            case ')': 
                this.addTokenType(TOKEN_TYPE.RIGHT_PAREN); 
                break;

            case '-': 
                this.addTokenType(TOKEN_TYPE.MINUS); 
                break;

            case '+': 
                this.addTokenType(TOKEN_TYPE.PLUS); 
                break;

            case '/':
                this.addTokenType(TOKEN_TYPE.SLASH);
                break;

            case '*':
                this.addTokenType(TOKEN_TYPE.STAR);
                break;

            case '.':
                this.addTokenType(TOKEN_TYPE.DOT);
                break;

            case '^':
                this.addTokenType(TOKEN_TYPE.DEGREE);
                break;

            case ' ':
                this.addTokenType(TOKEN_TYPE.SPACE);
                break;

            case '$':
                this.addTokenType(TOKEN_TYPE.DOLLAR);
                break;

            case '\'':
                this.addTokenType(TOKEN_TYPE.STRING_QUOTE);
                break;

            case '"':
                this.addTokenType(TOKEN_TYPE.STRING_DOUBLE_QUOTE);
                break;

            default:
                if (this._matchInt(char)) this.addTokenType(TOKEN_TYPE.NUMBER); 
                else if (this._matchIdentifer(char)) this.addTokenType(TOKEN_TYPE.IDENTIFIER); 
                else throw "Unexpected character.";
                break;
        }
    }
}


class Tokenize {
    constructor(source) {
        this.source = source || '';
        if (typeof source === 'string') {
            const ast = this.parse(this.source);
            let tokens = this.definitionTokens(ast);
            this.answer_t = tokens;
        }
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

    answer() {
        return this.answer_t;
    }

    parse(source) {
        const scanner = new Scanner(source);
        let tokens = scanner.scanTokens();
        return this.buildAst(tokens);
    }


    buildAst(tokens) {
        let newast = tokens;
        newast = this.joinTokens(this.scanNumber(newast), TOKEN_TYPE.NUMBER);
        newast = this.joinTokens(this.scanIdentifer(newast), TOKEN_TYPE.IDENTIFIER);
        newast = this.joinTokens(this.scanString(newast, TOKEN_TYPE.STRING_QUOTE), TOKEN_TYPE.STRING);
        newast = this.joinTokens(this.scanString(newast, TOKEN_TYPE.STRING_DOUBLE_QUOTE), TOKEN_TYPE.STRING);
        return newast;
    }

    scanNumber(tokens) {
        let list = [];
        let next = null;
        let index = 0;
        let intIndex = 0;

        for (const token of tokens) {
            if (token instanceof Token) {
                if (!next && token.type === TOKEN_TYPE.NUMBER) {
                    intIndex = index;
                    list[intIndex] = [];
                    list[intIndex].push(token?.lexeme);
                    next = true;
                } else {
                    if (next && token.type == TOKEN_TYPE.SPACE) {
                        next = false;
                    } else {
                        if (next && token.type === TOKEN_TYPE.NUMBER || token.type === TOKEN_TYPE.DOT) {
                            list[intIndex].push(token?.lexeme);
                        } else {
                            list[index] = token;
                            next = false;
                        }
                    }
                }
            }

            index++;
        }

        list = list.filter(i => i);
        return list;
    }


    scanIdentifer(tokens) {
        let list = [];
        let next = null;
        let index = 0;
        let intIndex = 0;

        for (const token of tokens) {
            if (token instanceof Token) {
                if (!next && token.type === TOKEN_TYPE.IDENTIFIER) {
                    intIndex = index;
                    list[intIndex] = [];
                    list[intIndex].push(token?.lexeme);
                    next = true;
                } else {
                    if (next && token.type === TOKEN_TYPE.SPACE) {
                        next = false;
                    } else {
                        if (next && token.type === TOKEN_TYPE.IDENTIFIER) {
                            list[intIndex].push(token?.lexeme);
                        } else {
                            list[index] = token;
                            next = false;
                        }
                    }
                }
            }

            index++;
        }

        list = list.filter(i => i);
        return list;
    }


    scanString(tokens, type) {
        let list = [];
        let next = null;
        let index = 0;
        let stringIndex = 0;

        for (const token of tokens) {
            if (token instanceof Token) {
                console.log(type, token);
                if (!next && token.type === type) {
                    console.log(index);
                    stringIndex = index;
                    list[stringIndex] = [];
                    list[stringIndex].push(token?.lexeme);
                    next = true;
                } else {
                    if (next && token.type === type) {
                        list[index] = token;
                        next = false;
                    } else {
                        console.log(list[stringIndex]);
                        list[stringIndex].push(token?.lexeme);
                    }
                }
            }

            index++;
        }

        list = list.filter(i => i);
        return list;
    }


    joinTokens(tokens, type) {
        let list = [];

        for (const token of tokens) {
            if (token instanceof Token) {
               list.push(token);
            } else if (token instanceof Array) {
                list.push(new Token(type, token.join(''), null, 1));
            }
        }

        list = list.filter(i => i);
        return list;
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
            if (item instanceof Token && countLeftParen == 0 && item.type == TOKEN_TYPE.LEFT_PAREN) {
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

            if (item instanceof Token && countRightParen == 0 && item.type == TOKEN_TYPE.RIGHT_PAREN) {
                rightParen = index;
                countRightParen++;
            }
        }

        return rightParen;
    }


    countLeftParen(ast) {
        let countLeftParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == TOKEN_TYPE.LEFT_PAREN) countLeftParen++;

        return countLeftParen;
    }


    countRightParen(ast) {
        let countRightParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == TOKEN_TYPE.RIGHT_PAREN) countRightParen++;

        return countRightParen;
    }


    indexLeftParenByCount(ast, count) {
        let idx = 0;
        let countLeftParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == TOKEN_TYPE.LEFT_PAREN) {
                countLeftParen++;
                if (countLeftParen == count) idx = index + 1;
            }

        return idx;
    }


    indexRightParenByCount(ast, count) {
        let idx = 0;
        let countRightParen = 0;

        for (let index = 0; index < ast.length; index++)
            if (ast[index] instanceof Token && ast[index].type == TOKEN_TYPE.RIGHT_PAREN) {
                countRightParen++;
                if (countRightParen == count) idx = index;
            }

        return idx;
    }


    isParens(ast) {
        return ast.find(item => item instanceof Array && item.find(i => i.type == TOKEN_TYPE.LEFT_PAREN));
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
            if (token instanceof Token) newast.push(token.type == TOKEN_TYPE.NUMBER ? { ...token, lexeme: Number(token.lexeme) } : token);

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
}

module.exports = Tokenize;