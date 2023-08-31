class Auth {
    static serialize(obj_t) {
        if (typeof obj_t === 'object' && Array.isArray(obj_t)) {
            let user, password;

            if (obj_t.indexOf('-u') > -1) {
                user = obj_t[obj_t.indexOf('-u') + 1];
                if (!/[a-zA-Z][a-zA-Z0-9_]+/.test(user)) user = undefined;
            }

            if (obj_t.indexOf('-p') > -1) {
                password = obj_t[obj_t.indexOf('-p') + 1];
                if (![/[a-zA-Z][a-zA-Z0-9_]+/.test(password), /[0-9]+/.test(password)].includes(true)) password = undefined;
            }

            return { user: user, password: password };
        }
    }
}

module.exports = Auth;