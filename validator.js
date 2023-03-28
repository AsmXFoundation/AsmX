class Validator {
    /**
     * It checks if a line of code starts with the string '@set' and returns true if it does, false if
     * it doesn't.
     * @param lineCode - The line of code that is being checked.
     * @returns A boolean value.
     */
    static isSetDeclaration(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@set');
    }


    /**
     * It checks if a line of code starts with the string '@Invoke'
     * @param lineCode - The line of code that is being checked.
     * @returns A boolean value.
     */
    static isInvokeStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Invoke');
    }


    /**
     * It checks if a line of code starts with the string '@ref' and returns true if it does, false if
     * it doesn't
     * @param lineCode - The line of code that is being checked.
     * @returns A boolean value.
     */
    static isRefStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@ref');
    }


    /**
     * It checks if a line of code starts with the string '@memory' and returns true if it does, false
     * if it doesn't
     * @param lineCode - The line of code that is being checked.
     * @returns A boolean value.
     */
    static isMemoryInvokeStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@memory');
    }


    /**
     * It checks if a line of code starts with the string '@address' and returns true if it does, false
     * if it doesn't
     * @param lineCode - The line of code that is being checked.
     * @returns A boolean value.
     */
    static isAddressInvokeStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@address');
    }

    
    /**
     * It checks if a line of code is an import statement
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isImportStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@import');
    }


    /**
     * It checks if a line of code starts with the string '@Issue' and returns a boolean value
     * @param lineCode - The line of code that is being checked.
     * @returns A boolean value.
     */
    static isIssueStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Issue');
    }


    /**
     * It checks if a line of code starts with the string '@Unit' and returns true if it does, false if
     * it doesn't
     * @param lineCode - The line of code that is being checked.
     * @returns A boolean value.
     */
    static isUnitStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Unit');
    }


    /**
     * It returns true if the line of code starts with @Route, and false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns a string.
     */
    static isRouteStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Route');
    }


    /**
     * It returns true if the line of code starts with the string "@Stack" and false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns a string.
     */
    static isStackStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Stack');
    }


    /**
     * It returns true if the line of code starts with @Add, false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isAddStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Add');
    }


    /**
     * It returns true if the line of code starts with the string '@Sub' and false otherwise.
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isSubStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Sub');
    }


    /**
     * It returns true if the line of code starts with the string '@call' and false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isCallStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@call');
    }


    /**
     * It checks if the line of code starts with @Equal, @equal, @Equ, or @equ.
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isEqualStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        lineCode = lineCode.replace(/\s+/g, ' ');
        return lineCode.startsWith('@Equal') ||
                lineCode.startsWith('@equal') ||
                lineCode.startsWith('@Equ') ||
                lineCode.startsWith('@equ');
    }


    /**
     * It returns true if the line of code starts with @Div, and false otherwise.
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isDivStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Div');
    }


    /**
     * It returns true if the line of code starts with @Mod, and false if it doesn't
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isModStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Mod');
    }


    /**
     * It returns true if the line of code starts with the string '@Ret' and false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns The function isReturnStatement is being returned.
     */
    static isReturnStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Ret');
    }


    /**
     * It returns true if the line of code starts with @Define, and false otherwise.
     * @param lineCode - The line of code that is being checked.
     * @returns a string.
     */
    static isDefineStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Define');
    }


    /**
     * It returns true if the line of code starts with the string "@Execute" and false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns a string.
     */
    static isExecuteStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Execute');
    }


    /**
     * If the lineCode is a string and it starts with @Imul, then return the lineCode with all the
     * spaces replaced with a single space.
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isImulStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Imul');
    }


    /**
     * If the lineCode is a string and it starts with @Offset, then return true, otherwise return
     * false.
     * @param lineCode - The line of code that is being checked.
     * @returns a string.
     */
    static isOffsetStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Offset');
    }


    /**
     * It returns true if the line of code starts with the string "@Unset" and false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isUnsetStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Unset');
    }


    /**
     * It returns true if the line of code starts with the string "@Modify" and false otherwise.
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isModifyStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Modify');
    }


    /**
     * It returns true if the line of code starts with the word "Stream" preceded by an "@" symbol
     * @param lineCode - The line of code that is being checked.
     * @returns a string.
     */
    static isStreamStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Stream');
    }


    /**
     * It returns true if the line of code starts with @Pop, and false otherwise.
     * @param lineCode - The line of code that is being checked.
     * @returns a string.
     */
    static isPoptatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Pop');
    }


    /**
     * It returns true if the line of code starts with the string "@Push" and false otherwise
     * @param lineCode - The line of code that is being checked.
     * @returns a boolean value.
     */
    static isPushStatement(lineCode) {
        if (typeof lineCode !== 'string' || lineCode.length === 0) return 'rejected';
        return lineCode.replace(/\s+/g, ' ').startsWith('@Push');
    }
}

module.exports = Validator;