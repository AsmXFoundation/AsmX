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


    static intCaesar(string_t, steps) {
        const abcLower = "abcdefghijklmnopqrstuvwxyz";
        const abcUpper = abcLower.toUpperCase();
        if (typeof string_t !== 'string') throw "Uncgauht argument type";
        let answer_t = '';

        if (0 > steps) string_t = string_t.split('.');

        for (const char_t of string_t) {
            if (steps > 0) {
                if (abcLower.includes(char_t)) answer_t += abcLower.indexOf(char_t) + steps + 'l.'; // int
                else if (abcUpper.includes(char_t)) answer_t += abcUpper.indexOf(char_t) + steps + 'u.'; // int
                else answer_t += char_t + 's.';
            } else if (0 > steps) {
                if (char_t.endsWith('u')) {
                    answer_t += abcUpper[+char_t.slice(0, -1) + steps]; // int
                } else if (char_t.endsWith('l')) {
                    answer_t += abcLower[+char_t.slice(0, -1) + steps]; // int
                } else if (char_t.endsWith('s')) {
                    answer_t += char_t.slice(0, -1);
                }
            }
        }

        if (steps > 0) answer_t = answer_t.slice(0 , answer_t.length - 1);
        return answer_t;
    }
}

module.exports = CryptoGraphy;