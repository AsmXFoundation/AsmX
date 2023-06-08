class MiddlewareSoftware {
    static source = [];

    static compileStatement(object) {
        this.source.push(object);
    }
}

module.exports = MiddlewareSoftware;