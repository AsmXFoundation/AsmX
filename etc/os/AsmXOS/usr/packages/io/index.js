class CLI {
    static print() {
        const parameters = this.cli_args;
        console.log(parameters);
    }
}

module.exports = CLI;