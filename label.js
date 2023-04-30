class Label {
    constructor() {
        this.labels = [];
    }

    new(name, body) {
        this.labels.push({ [name]: body });
    }
}

let Labels = new Label();

module.exports = Labels;