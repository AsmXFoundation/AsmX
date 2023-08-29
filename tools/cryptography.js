class CryptoGraphy {
    static caesar(string_t, steps) {
        const abcLower = "abcdefghijklmnopqrstuvwxyz";
        const abcUpper = abcLower.toUpperCase();
        if (typeof string_t !== 'string') throw "Uncgauht argument type";
        let answer_t = '';
        
        for (const char_t of string_t) {
            if (abcLower.includes(char_t)) answer_t += abcLower[abcLower.indexOf(char_t) + steps]; // int
            else if (abcUpper.includes(char_t)) answer_t += abcUpper[abcUpper.indexOf(char_t) + steps]; // int
            else answer_t += char_t; // int
        }

        return answer_t;
    }
}

module.exports = CryptoGraphy;