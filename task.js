class Task {
    static tasks = [];

    static new(name, value, eventType) {
        this.tasks.push({ name, value, eventType });
    }

    static last() {
        if (this.tasks.length == 0) return this.first();
        return this.tasks[this.tasks.length - 1];
    }

    static first() {
        return this.tasks[0];
    }
}

module.exports = Task;