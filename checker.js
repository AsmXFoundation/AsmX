class ValidatorByType {
    /**
     * If the lineCode is not a string or is an empty string, return 'rejected'. Otherwise, if the
     * lineCode does not contain a '[' or does not contain a ']', return false. Otherwise, return true.
     * @param valValue - The line of code that is being validated.
     * @returns a boolean value.
     */
    static validateByTypeList(valValue){
        if (typeof valValue !== 'string' || valValue.length === 0) return 'rejected';
        valValue = valValue.indexOf(';') !== -1 ? valValue.trim().slice(0, valValue.indexOf(';') - 1) : valValue.trim();
        return valValue.indexOf('[') === -1 || valValue.lastIndexOf(']') === -1 ? true : false;
    }

    
    /**
     * It returns true if the line of code contains a string literal, and false if it doesn't.
     * @param lineCode - The line of code that is being validated.
     * @returns A boolean value.
     */
    static validateByTypeString(lineCode){
        lineCode = lineCode.indexOf(';') !== -1 ? lineCode.trim().slice(0, lineCode.indexOf(';') - 1) : lineCode.trim();
        return lineCode.startsWith('\'')  && lineCode.endsWith('\'') 
            || lineCode.startsWith('"')  && lineCode.endsWith('"') ? true : false;
    }


    /**
     * It returns true if the string is a valid integer, false otherwise.
     * @param lineCode - The line code to validate.
     * @returns A boolean value.
     */
    static validateTypeInt(lineCode){
        lineCode = lineCode.indexOf(';') !== -1 ? lineCode.trim().slice(0, lineCode.indexOf(';') - 1) : lineCode.trim();
        return /(^[+-]?\d+$)/.test(lineCode);
    }


    /**
     * It returns true if the string is a valid float, and false if it is not.
     * @param lineCode - The line code to be validated.
     * @returns A boolean value.
     */
    static validateTypeFloat(lineCode){
        lineCode = lineCode.indexOf(';') !== -1 ? lineCode.trim().slice(0, lineCode.indexOf(';') - 1) : lineCode.trim();
        return /^[+-]?\d+(\.\d+)$/.test(lineCode);
    }


    /**
     * It returns true if the line of code contains the word "true" or "false" and false if it doesn't.
     * @param lineCode - The line of code that is being validated.
     * @returns The return value is a boolean.
     */
    static validateTypeBoolean(lineCode){
        lineCode = lineCode.indexOf(';') !== -1 ? lineCode.trim().slice(0, lineCode.indexOf(';') - 1) : lineCode.trim();
        return ['true', 'false'].includes(lineCode);
    }


    /**
     * It returns true if the line of code is a valid JavaScript identifier, and false otherwise.
     * @param lineCode - The line of code that is being validated.
     * @returns A boolean value.
     */
    static validateTypeIdentifier(lineCode){
        lineCode = lineCode.indexOf(';') !== -1 ? lineCode.trim().slice(0, lineCode.indexOf(';') - 1) : lineCode.trim();
        return /[_a-zA-Z][_a-zA-Z0-9]{0,30}/.test(lineCode);
    }


    /**
     * It returns true if the line of code is a valid hexadecimal number.
     * @param lineCode - The line of code that is being validated.
     * @returns A boolean value.
     */
    static validateTypeHex(lineCode){
        lineCode = lineCode.indexOf(';') !== -1 ? lineCode.trim().slice(0, lineCode.indexOf(';') - 1) : lineCode.trim();
        return /[0-9a-fA-F]+x[0-9a-fA-F]+/.test(lineCode);
    }
}

module.exports = ValidatorByType;