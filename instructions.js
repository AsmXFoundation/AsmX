const Types = require("./keywords");

class Instructions {
    constructor() {
        this.Instructions = [];
    }


    setInstruction(instructionToken, argsRules) {
        
    }

    getInstruction(instructionToken, args) {

    }
}


let Instructions = new Instructions();

Instructions.setInstruction('@set', {
    0: 'Identifier',
    1: ['Identifier', new Types().types]
});


module.exports = Instructions;