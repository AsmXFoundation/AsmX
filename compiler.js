// requires
const readline = require('readline');

// Components that compiler
const Issues = require("./issue");
const { Memory, MemoryAddress, MemoryVariables } = require("./memory");
const Route = require("./route");
const Stack = require("./stack");
const Switching = require("./switching");

class Compiler {
    constructor(AbstractSyntaxTree) {
        this.AbstractSyntaxTree = AbstractSyntaxTree;
        this.isIssue = Switching.setState(false);
        this.set = [];
        
        // Call this args
        this.$arg0 = 0x00;
        this.$arg1 = 0x00;
        this.$arg2 = 0x00;
        this.$arg3 = 0x00;
        this.$arg4 = 0x00;
        this.$arg5 = 0x00;
        
        
        /* Setting up the compiler. */
        this.stack = new Stack();
        this.$mov = new Route();
        this.$mem = Memory;
        this.$stack = this.stack;
        this.$name = 0x00;
        this.$offset = 0x00;
        this.ret = false;
        this.$arch = "AsmX";

        this.$args = ['$arg0', '$arg1', '$arg2', '$arg3', '$arg4', '$arg5'];
        this.$registers = ['$mem', '$stack', '$name', '$offset', '$arch'];
        this.$extensionRegisters = [...this.$args, ...this.$registers];

        for (let index = 0; index < this.AbstractSyntaxTree.length; index++) {
            const trace = this.AbstractSyntaxTree[index];

            if (trace?.issue){
                this.compileIssue(trace.issue);  
                continue;
            }

            if (trace?.invoke){
                Switching.state && process.stdout.write(Issues.INVOKE_EVENT);
                this.compileInvoke(trace.invoke);
                continue;
            }

            if (trace?.set){
                Switching.state && process.stdout.write(Issues.SET_EVENT);
                this.compilerSetStatement(trace.set);
                continue;
            }

            if (trace?.memory){
                Switching.state && process.stdout.write(Issues.MEMORY_EVENT);
                this.compilerMemory(trace.memory);
                continue;
            }

            if (trace?.address){
                Switching.state && process.stdout.write(Issues.ADDRESS_EVENT);
                this.compilerAddress(trace.address);
                continue;
            }

            if (trace?.route){
                Switching.state && process.stdout.write(Issues.ROUTE_EVENT);
                this.compilerRoute(trace.route);
                continue;
            }

            if (trace?.stack){
                Switching.state && process.stdout.write(Issues.STACK_EVENT);
                this.compilerStack(trace.stack);
                continue;
            }

            if (trace?.add){
                Switching.state && process.stdout.write(Issues.ADD_EVENT);
                this.compilerAddStatement(trace.add);
                continue;
            }

            if (trace?.sub){
                Switching.state && process.stdout.write(Issues.SUB_EVENT);
                this.compilerSubStatement(trace.sub);
                continue;
            }


            if (trace?.equal){
                Switching.state && process.stdout.write(Issues.EQUALITY_EVENT);
                this.compilerEquality(trace.equal);
                continue;
            }

            if (trace?.div) {
                Switching.state && process.stdout.write(Issues.MATCH_DIV_EVENT);
                this.compilerDivStatement(trace.div);
                continue;
            }

            if (trace?.mod) {
                Switching.state && process.stdout.write(Issues.MATCH_MOD_EVENT);
                this.compilerModStatement(trace.mod);
                continue;
            }
        };
    }


    compileInvoke(statement) {
        this.$arg0 = statement.address;

        // write
        if (this.$arg0 == 0x04) this.#InvokeWrite();
        // exit
        if (this.$arg0 == 0x01) process.exit(0);
        
        // read
        if (this.$arg0 == 0x03) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('> ',  (answer) => {
                this.$arg0 = answer;
                this.$stack.push({ value: this.$arg0 });
                rl.close();
            });
        }
    }


    /**
     * "This function takes a statement, maps the arguments to integers, reduces the arguments to a
     * single value, and pushes the result to the stack."
     * 
     * The first thing we do is map the arguments to integers. We do this by using the `parseInt`
     * function. The `parseInt` function takes two arguments: the first is the string to convert to an
     * integer, and the second is the base of the number. In this case, we're converting hexadecimal
     * numbers to integers.
     * 
     * The next thing we do is reduce the arguments to a single value. We do this by using the `reduce`
     * function. The `reduce` function takes two arguments: the first is a function that takes two
     * arguments, and the second is the initial value. In this case, the function takes two arguments:
     * the previous argument and the current argument. The initial value is the first argument.
     * 
     * The last thing we
     * @param statement - The statement object that is being executed.
     */
    compilerEquality(statement) {
        const args = statement.args.map(arg => parseInt(arg, 16));
        this.$ret = args.reduce((previousArg, currentArg) => previousArg === currentArg);
        this.$stack.push({ value: this.$ret });
    }


    /**
     * "This function takes a statement, and then compiles it into a JavaScript function that will
     * divide all of the arguments together and then push the result onto the stack."
     * 
     * The first thing that the function does is call the compilerAllArguments function. This function
     * takes the statement, and then compiles it into a JavaScript function that will push all of the
     * arguments onto the stack.
     * 
     * The next thing that the function does is set the  variable to the result of dividing all of
     * the arguments together.
     * 
     * The last thing that the function does is push the result onto the stack.
     * @param statement - The statement to be compiled.
     */
    compilerDivStatement(statement) {
        this.compilerAllArguments(statement, 'Int');
        this.$ret = this.$arg0 / this.$arg1;
        if (this.$arg2 !== 0x00) this.$ret = this.$ret / this.$arg2;
        if (this.$arg3 !== 0x00) this.$ret = this.$ret / this.$arg3;
        if (this.$arg4 !== 0x00) this.$ret = this.$ret / this.$arg4;
        if (this.$arg5 !== 0x00) this.$ret = this.$ret / this.$arg5;
        this.$stack.push({ value: this.$ret });
    }



    /**
     * "This function takes a statement, and compiles it into a JavaScript function that returns the
     * remainder of the first argument divided by the second argument."
     * 
     * The first line of the function is a comment. It's a comment because it starts with a double
     * slash. Comments are ignored by the compiler.
     * 
     * The second line of the function is a function call. It's a function call because it starts with
     * the name of a function, followed by a pair of parentheses. The function call is to the function
     * "compilerAllArguments". The function call passes two arguments to the function. The first
     * argument is the statement. The second argument is the string "Int".
     * 
     * The third line of the function is an assignment. It's an assignment because it starts with a
     * dollar sign, followed by an equal sign. The assignment assigns the value of the first argument
     * to the variable "".
     * 
     * The fourth line of the
     * @param statement - The statement object.
     */
    compilerModStatement(statement) {
        this.compilerAllArguments(statement, 'Int');
        this.$ret = this.$arg0 % this.$arg1;
        if (this.$arg2 !== 0x00) this.$ret = this.$ret % this.$arg2;
        if (this.$arg3 !== 0x00) this.$ret = this.$ret % this.$arg3;
        if (this.$arg4 !== 0x00) this.$ret = this.$ret % this.$arg4;
        if (this.$arg5 !== 0x00) this.$ret = this.$ret % this.$arg5;
        this.$stack.push({ value: this.$ret });
    }


    /**
     * It takes a statement object, and adds the arguments together, and pushes the result to the
     * stack.
     * @param statement - The statement object that is being compiled.
     */
    compilerAddStatement(statement) {
        this.compilerAllArguments(statement, 'Int');
        this.$ret = this.$arg0 + this.$arg1 + this.$arg2 + this.$arg3 + this.$arg4 + this.$arg5;
        this.$stack.push({ value: this.$ret });
    }


    /**
     * It takes a statement, and then it does some stuff with it.
     * @param statement - The statement object that is being compiled.
     */
    compilerSubStatement(statement) {
        this.compilerAllArguments(statement, 'Int');
        this.$ret = this.$arg0 - this.$arg1 - this.$arg2 - this.$arg3 - this.$arg4 - this.$arg5;
        this.$stack.push({ value: this.$ret });
    }


    /**
     * "The compilerStack function pushes the address of the statement to the stack, and then pushes
     * the name of the live point to the stack."
     * 
     * The compilerStack function is called by the compiler when it encounters a statement that is a
     * live point.
     * 
     * The compilerStack function is called by the compiler when it encounters a
     * @param statement - The statement object that is being compiled.
     */
    compilerStack(statement) {
        this.$arg0 = statement.address;
        this.$ret = 0x00;

        /**
         * If the row has a value property, then call the function again with the value property as the
         * row. Otherwise, return the value property
         * @param row - the row object
         * @returns The value of the key 'value' in the object.
         */
        function recursionGetValueByStack(row) {
            return Object.keys(row.value).includes('value') ? recursionGetValueByStack(row.value) : row.value;
        }

        /* Getting the value of the last item in the stack, and then pushing it to the stack. */
        this.$ret = recursionGetValueByStack(this.$stack.list[this.$stack.list.length - 1]);
        this.$stack.push({ address: this.$mov.livePointAddress, value: this.$ret });
    }


    /**
     * It takes a statement, gets the name and address of the statement, gets the cell by the name of
     * the statement, gets the value of the cell by the address of the cell, sets the return value to
     * the value of the cell, pushes the address and value of the cell to the stack, and sets the point
     * of the mov to the name and address of the statement
     * @param statement - The statement that is being compiled.
     */
    compilerRoute(statement) {
        if (!(typeof statement.address === 'undefined')) {
            this.$arg0 = this.$name = statement.name;
            this.$arg1 = statement.address;
            let cell = MemoryVariables.getCellByValue(MemoryAddress.getCellByValue(this.$arg0)?.name);
            let value = Memory.getCellByAddress(cell.address);
            this.$ret = value;
            this.$stack.push({ address: this.$arg1, value: value });
            this.$mov.setPoint(this.$arg0, this.$arg1);
        } else if (this.$extensionRegisters.includes(statement.name)) {
            this.$arg = statement.name;
            if (this.$arg == '$offset') this.$stack.push({ value: this.$offset });
            if (this.$arg == '$name') this.$stack.push({ value: this.$name });
            if (this.$arg == '$arch') this.$stack.push({ value: this.$arch });
            if (this.$arg == '$ret') this.$stack.push({ value: this.$ret });
            if (this.$arg == '$arg0') this.$stack.push({ value: this.$arg0 });
            if (this.$arg == '$arg1') this.$stack.push({ value: this.$arg1 });
            if (this.$arg == '$arg2') this.$stack.push({ value: this.$arg2 });
            if (this.$arg == '$arg3') this.$stack.push({ value: this.$arg3 });
            if (this.$arg == '$arg4') this.$stack.push({ value: this.$arg4 });
            if (this.$arg == '$arg5') this.$stack.push({ value: this.$arg5 });
        }
    }
    
    
    /**
     * The function compilerAddress() takes a statement as an argument and sets the address of the
     * statement to the name of the statement.
     * @param statement - The statement object that is being compiled.
     */
    compilerAddress(statement) {
        this.$arg0 = statement.address;
        this.$arg1 = this.$name = statement.name;
        this.$stack.push({ address: this.$arg0, value: this.$arg1 });
        MemoryAddress.setAddress(this.$arg0, this.$arg1);
        const memory = Memory.getCellByAddress(this.$arg0);
        MemoryVariables.setCell({ name: this.$arg1, address: this.$arg0, memory: memory });
    }
    
    
    /**
     * The function takes a statement, and then pushes the name of the statement to the stack.
     * @param statement - The statement object that is being compiled.
     */
    compilerMemory(statement) {
        this.$arg0 = this.$name = statement.name;
        this.$arg1 = statement.address;
        this.$stack.push({ address: this.$arg1, value: this.$arg0 });
        let set = this.set.filter(cell => cell.name === this.$arg0);
        set['address'] = this.$arg1;
        this.$mem.addCell(this.$arg1, ...set);
    }


    /**
     * It takes a statement object, and pushes it to the set array.
     * @param statement - The statement object that is being compiled.
     */
    compilerSetStatement(statement) {
        this.$arg0 = this.$name = statement.name;
        this.$arg1 = statement.type;
        this.$arg2 = statement.value;
        this.set.push({ name: this.$name, type: this.$arg1, value: this.$arg2 });
    }

    
    /**
     * It triggers the Switching function if the statement is on.
     * @param statement - The statement that was compiled.
    */
    compileIssue(statement) {
       this.$arg0 = statement.state;
       process.stdout.write(Issues.ISSUES_DEFINE_STATUS);
       statement.state.indexOf('on') > -1 && Switching.trigger();
       statement.state.indexOf('off') > -1 && Switching.trigger();
    }
    
    
    /**
     * It writes the value of the stack pointer to the console
     */
    #InvokeWrite(){
        //console.log(this.stack.list);
        console.log(this.$stack.list[this.$stack.sp - 1]?.value);
    }


    /**
     * It takes a statement and a type, and then sets the arguments to the statement's arguments
     * @param statement - The statement that is being compiled.
     * @param type - The type of the variable.
     */
    compilerAllArguments(statement, type){
        if (type == 'Int' || type == 'Float') {
            this.$arg0 = +statement.args[0] || 0x00;
            this.$arg1 = +statement.args[1] || 0x00;
            this.$arg2 = +statement.args[2] || 0x00;
            this.$arg3 = +statement.args[3] || 0x00;
            this.$arg4 = +statement.args[4] || 0x00;
            this.$arg5 = +statement.args[5] || 0x00;
        } else if (type == 'String' || type == 'Bool') {
            this.$arg0 = statement.args[0] || 0x00;
            this.$arg1 = statement.args[1] || 0x00;
            this.$arg2 = statement.args[2] || 0x00;
            this.$arg3 = statement.args[3] || 0x00;
            this.$arg4 = statement.args[4] || 0x00;
            this.$arg5 = statement.args[5] || 0x00;
        }
    }
}

module.exports = Compiler;