const fs = require('fs');
const ini = require('ini');

/* The Config class allows for setting and writing INI variables to a file. */
class Config {
    constructor() {
        this.PATH_INI_FILE = '.ini';
        this.section = null;
        this.INI_VARIABLES = ini.parse(fs.readFileSync(this.PATH_INI_FILE, 'utf-8'));
    }


    /**
     * The function "print" sets a value for a given section in an object called "INI_VARIABLES".
     * @param section - The section parameter is a string that represents the section name in an INI
     * file. It is used to identify which section the value belongs to.
     * @param value - The value to be assigned to the specified section in the INI_VARIABLES object.
     */
    print(section, value) {
        this.section = { [section]: value };
        this.INI_VARIABLES[section] = value;
    }
    

    /**
     * This function writes INI variables to a file if a section is specified.
     */
    commit() {
        this.section != null && fs.writeFileSync(this.PATH_INI_FILE, ini.stringify(this.INI_VARIABLES));
    }
}

let config = new Config();
module.exports = config;