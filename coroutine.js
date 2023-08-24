class Coroutine {
    static coroutines = [];

    static create(obj, name) {
        this.coroutines.push({ [name]: obj });
    }

    static getCoroutines(name) {
        return this.coroutines.filter(coroutine => coroutine?.[name]);
    }
}

module.exports = Coroutine;