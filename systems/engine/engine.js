const EngineProvider = {
    registerInstruction: (Engine) => {
        Engine.registerInstruction('rsub', (arguments, parser) => {
            let args = arguments.split(',').map(t => Number(t.trim()));
            let result = args[0];

            for (let index = 1, len = args.length; index < len; index++) {
                if (index == 1) result = args[0] - args[index];
                else if (index > 0) result = result - args[index];
            }

            return Engine.changeRegister('$ret', String(result));
        });


        for (const cmd of ['msg', 'print']) 
            Engine.registerInstruction(cmd, (arguments) => {
                return Engine.callUnit('print', arguments.split(',').map(t => t.trim()));
            });
    }
}

module.exports = EngineProvider;