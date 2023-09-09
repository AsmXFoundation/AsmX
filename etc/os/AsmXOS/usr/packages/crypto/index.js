const crypto = require('crypto');
const CryptoGraphy = require('../../../../../../tools/cryptography');

class CLI {
    static crypto() {
        const parameters = this.cli_args.slice(1);
        const type = parameters[0];
        
        if (['csr', 'caesar'].includes(type)) {
            const text = parameters.slice(2).join(' ');
            return CryptoGraphy.caesar(text, Number(parameters[1]));
        } else if (['icsr', 'i-caesar'].includes(type)) {
            const text = parameters.slice(2).join(' ');
            return CryptoGraphy.intCaesar(text, Number(parameters[1]));
        }
    }
}

module.exports = CLI;