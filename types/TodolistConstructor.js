const Parser = require("../parser");

class TodolistConstructor {
    static run(todolist) {
        if (Object.getOwnPropertyNames(todolist).includes('tasks')) {
            const lastTask = todolist.tasks.at(-1);
            if (this.tasks) {
                const code = this.tasks[lastTask]?.body;
                let index = 0;

                if (code) {
                    for (const line of code) {
                        if (line.startsWith('@')) {
                            let trace = Parser.parse(line)[0];
                            let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
                            this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);
                        }

                        index++;
                    }
                }
            }

            todolist.tasks.pop();
        }

        todolist.isDone = todolist.tasks.length == 0;
    }

    static runSerial(todolist) {
        if (Object.getOwnPropertyNames(todolist).includes('tasks') && this.tasks) {
            for (const task of todolist.tasks) {
                const code = this.tasks[task]?.body;
                let index = 0;

                if (code) {
                    for (const line of code) {
                        if (line.startsWith('@')) {
                            let trace = Parser.parse(line)[0];
                            let statement = Reflect.ownKeys(trace).filter(stmt => stmt != 'parser')[0];
                            this[`compile${statement[0].toUpperCase() + statement.substring(1)}Statement`](trace[statement], index, trace);
                        }

                        index++;
                    }
                }
            }

            todolist.tasks = [];
            todolist.isDone = todolist.tasks.length == 0;
        }
    }

    static restart(todolist) {
        if (['originTasks', 'tasks']
            .map(property => Object.getOwnPropertyNames(todolist).includes(property))
            .every(condition => condition == true)
        ) {
            todolist.tasks = todolist.originTasks;
            todolist.isDone = false;
        }
    }

    static stop(todolist) {
        if (Object.getOwnPropertyNames(todolist).includes('isDone')) todolist.isDone = true;
    }

    static start(todolist) {
        if (Object.getOwnPropertyNames(todolist).includes('isDone')) todolist.isDone = false;
    }

    static clear(todolist) {
        if (Object.getOwnPropertyNames(todolist).includes('tasks')) todolist.tasks = [];
    }

    static view(todolist) {
        const methods_t = Object.getOwnPropertyNames(TodolistConstructor.prototype).filter(m => m != 'constructor').filter(m => !m.startsWith('_'));
        
        const properties = {
            type: '(TodoList)',
            tasks:`{ ${todolist.tasks.join(', ')} }`,
            originTasks: `{ ${todolist.originTasks.join(', ')} }`,
            isDone: todolist.isDone
        }

        const message = ['TodoList<T> {'];
        for (const field of Reflect.ownKeys(properties)) message.push(` ${field}: ${properties[field]},`);
        for (const method_t of methods_t) message.push(` ${method_t}<T>(...): any => { },`);
        message[message.length - 1] = message[message.length - 1].slice(0, -1);
        message.push('}');
        console.log(message.join('\n'));
    }
}

module.exports = TodolistConstructor;