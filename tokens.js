class StreamLine {
  static isComma(ch) {
    return (ch === ",");
  }
  
  static isDigit(ch) {
    return /\d/.test(ch);
  }

  static isLabel(ch) {
    return ch.startsWith('.');
  }
  
  static isLetter(ch) {
    return /[a-z]/i.test(ch);
  }
  
  static isOperator(ch) {
    return /\+|-|\*|\/|\^/.test(ch);
  }
  
  static isLeftParenthesis(ch) {
    return (ch === "(");
  }
  
  static isRightParenthesis(ch) {
    return (ch == ")");
  }
}

class Token {
    constructor() {
        let tokensSet = new Set();
        this.tokensList = [
          '@Invoke', // invoke method or function on address
          '@Route', // route with parameters (name or address)
          '@memory', // write to memory
          '@address', // write to address
          '@set', // set variable value
          '@Stack', // stack: push or pop, read from memory or select items from bank memory
          '@Issue', // Issue: define issue status (of or on)
          '@Add', // match args
          '@Sub', // match arguments
          '@Equal', // equality
          '@Equ', // equality
          '@equal', // equality
          '@equ', // equality
          '@Unit', // create function
          '@call', // call @Unit
          '@Ret', // Unit return value

          '@import', // import aliases
          '@Shift'// shift
        ];

        this.tokensList.map(token => tokensSet.add(token));
        this.registers = tokensSet;
        this.KEYWORDS = tokensSet;
    }

    /**
     * It returns the tokensList array.
     * @returns The tokensList array.
     */
    getListTokens() { return this.tokensList} ;

    has(token){
      return this.tokensList.find(t => token === t);
    }

    /**
     * @param word - The word to be checked
     * @returns The token object that matches the word.
     */
    getToken(word) {
        return this.tokensList.find(token => token === word);
    }

    /**
     * It returns the first token that matches the line, or false if no token matches.
     * @param line - The line of code that is being parsed.
     * @param token - The token to search for.
     * @returns The first element in the array that satisfies the provided testing function. Otherwise
     * undefined is returned.
     */
    findByLine(line, token) {
      return this.tokensList.find(t => line.match(token)) || false;
    }
      
    StreamLine (){ return StreamLine; }
}

module.exports = Token;