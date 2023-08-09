const EXPRESSION_TOKEN_TYPE = {
    LEFT_PAREN: 'LEFT_PAREN',
    RIGHT_PAREN: 'RIGHT_PAREN',
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
            console.log(ast);
        }
    }


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
                        list[parensIndex] = [];
                        // list[parensIndex].push(token);
                        
                        if (list[parensIndex][depth] == undefined) list[parensIndex][depth] = [];
                        list[parensIndex][depth].push(token);

                        next = true;
                    } else {
                        if (next) {
                            // ((3 + 1) + 34) * 2 + 1
                            if (token.type === EXPRESSION_TOKEN_TYPE.LEFT_PAREN) {
                                depth++;
                                if (list[parensIndex][depth] == undefined) list[parensIndex][depth] = [];
                                list[parensIndex][depth].push(token);
                            } else if (token.type === EXPRESSION_TOKEN_TYPE.RIGHT_PAREN) {
                                // console.log(parensIndex, depth);
                                // console.log(depth);
                                if (depth > 0) list[parensIndex][depth].push(token);
                                else list[parensIndex].push(token);
                                depth--;
                                // next = false;
                            } else {
                                console.log(depth, token);
                                if (depth > 0) list[parensIndex][depth].push(token);
                                else list[parensIndex].push(token);
                                // console.log(token);
                            }
                        } else {
                            // console.log(depth, token);
                            list[index] = token;
                            next = false;
                        }
                    }
                }

                index++;
            }

            list = list.filter(i => i);
            console.log(list);
            return list;
        }

        newast = scanNumber(tokens);
        newast = splitNumber(newast);
        scopeParens(newast);
        return newast;
    }
}

module.exports = Expression;