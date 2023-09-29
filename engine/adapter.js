class EngineAdapter {
    static registerInstruction(tree, args, parser) {
        const callback = tree?.cb || tree?.callback;

        if (callback) {
            const response = callback(args, parser?.parser || {});
            
            if (response) {
                const list = Object.getOwnPropertyNames(response.constructor['prototype']);

                if (list.includes('instance')) {
                    const instance = response.instance();

                    if (instance == 'Register') {
                        this[response['name']] = response['value'];
                    } else if (instance == 'CallUnit') {
                        if (response.args instanceof Array) response.args = response.args.join(',');
                        let call = { name: response.name, args: response.args };

                        try {
                            this.compileCallStatement(call, parser?.row || 0, { call: call, parser: parser });
                        } catch {}
                    }
                }
            }
        }
    }


    static registerUnit(tree, args, parser) {
        const callback = tree?.cb || tree?.callback;

        if (callback) {
            const response = callback(args, parser?.parser || {});

            if (response) {
                const list = Object.getOwnPropertyNames(response.constructor['prototype']);

                if (list.includes('instance')) {
                    const instance = response.instance();

                    if (instance == 'Return') {
                        this['$urt'] = response.value;
                    }
                }
            }
        }
    }
}

module.exports = EngineAdapter;