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
            // console.log(ast);
        }
    }


    parse(expression) {
        const scanner = new Scanner(expression);
        let tokens = scanner.scanTokens();
        return this.buildAst(tokens);
    }


    buildAst(tokens) {
        let isParen = false;
        let newast = [];
        let idx = 0;

        for (let index = 0; index < tokens.length; index++) {
            const token = tokens[index];

            if (token?.type == EXPRESSION_TOKEN_TYPE.LEFT_PAREN) {
                isParen = true;
            } 
            
            else if (token?.type == EXPRESSION_TOKEN_TYPE.RIGHT_PAREN) {
                isParen = false;
            }
            
            else {
                if (isParen) {
                    if (newast[index] == undefined) newast[index] = [];
                    newast[index][idx] = token;
                    idx++;
                } else {
                    newast.push(token);
                }
            }
        }

        return newast;
    }
}

module.exports = Expression;