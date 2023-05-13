const Color = require("./utils/color");

class Garbage {
    static garbage = [];

    static usage(stuff) {
        this.garbage.push(stuff);
    }

    static protocol() {
        console.log(`${Color.BRIGHT}Protocol: `);
    }
}

module.exports = Garbage;