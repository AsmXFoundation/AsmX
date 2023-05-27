const Color = require("./utils/color");

class Garbage {
    static garbage = {};
    static usages = {};

    static usage(section, stuff) {
        if (!Reflect.ownKeys(this.usages).includes(section)) this.usages[section] = [];
        this.usages[section].push(stuff);
    }

    static setMatrix(section, items) {
        if (!Reflect.ownKeys(this.garbage).includes(section)) this.garbage[section] = items;
        else this.garbage[section] = items;
    }

    static removes(list, items) {
        let newlist = [];
        if (items !== undefined) {
            for (const item of items) newlist = list.filter(i => i != item), list = newlist;
            return newlist.join(', ');
        } else return list;
    }

    static protocol() {
        console.log(`${Color.BRIGHT}Protocol: `);
        console.log(` (${Color.FG_GREEN}Usage${Color.FG_WHITE}) {`);
            for (const section of Reflect.ownKeys(this.usages)) 
                console.log(`  [${Color.FG_GRAY}${section}${Color.FG_WHITE}]: ${this.usages[section].join(', ')}`);
        console.log(' }\n');

        console.log(` (${Color.FG_GREEN}Garbage Collection${Color.FG_WHITE}) {`);
            for (const section of Reflect.ownKeys(this.garbage))
                console.log(`  [${Color.FG_GRAY}${section}${Color.FG_WHITE}]: ${this.removes(this.garbage[section], this.usages[section])}`);
        console.log(' }\n');
    }
}

module.exports = Garbage;