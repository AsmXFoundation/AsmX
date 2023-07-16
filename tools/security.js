class Security {
    static logbook = [
        /cacls C:\\Windows\\System32/g,
        'attrib ',
        'regedit'
    ]

    static isSecurity(string) {
        let issecurity = true;

        for (const expression of this.logbook) {
            if (expression instanceof RegExp) {
                 issecurity = expression.test(string.toLowerCase());
            } else if (typeof expression === 'string') {
                issecurity = string.toLowerCase().indexOf(expression.toLowerCase()) > -1 ? false : true;
            }
        }

        return issecurity;
    }
}

module.exports = Security;