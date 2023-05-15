const Color = require("./utils/color");

class Analysis {
    static analysis = {};

    /**
     * The function creates a new model in an analysis object if it doesn't already exist.
     * @param model - The "model" parameter is a string representing the name of a model that is being
     * created.
     */
    static createModel(model) {
        if (!Reflect.ownKeys(this.analysis).includes(model)) this.analysis[model] = 0;
    }


    /**
     * This function creates a branch model if it does not already exist in the analysis object.
     * @param branch - The "branch" parameter is likely a string or a number that represents a category
     * or branch of analysis. It is used as a key in an object called "analysis" to store the count of
     * a particular model within that branch.
     * @param model - The "model" parameter in the "createBranchModel" function is a string
     * representing the name of a model.
     */
    static createBranchModel(branch, model) {
        if (!Reflect.ownKeys(this.analysis).includes(branch)) this.analysis[branch] = {};
        if (!Reflect.ownKeys(this.analysis[branch]).includes(model)) this.analysis[branch][model] = 0;
    }


    /**
     * The function updates a counter in an analysis object based on different events related to a
     * given model.
     * @param event - A string representing the type of event that occurred. It can be either 'new',
     * 'dec', or 'del'.
     * @param model - The "model" parameter in this function refers to a specific model or category
     * that is being tracked for analysis. It could be a product model, a user model, or any other type
     * of model that the code is designed to analyze.
     */
    static counterModel(event, model) {
       if (event == 'new') this.analysis[model] += 1;
       if (event == 'dec') this.analysis[model] -= 1;
       if (event == 'del') this.analysis[model] = 0;
    }


    /**
     * The function updates a counter in an analysis object based on the event, branch, and model
     * parameters.
     * @param event - A string indicating the type of event that occurred. It can be one of three
     * values: 'new', 'dec', or 'del'.
     * @param branch - The branch parameter is a string that represents the branch of the analysis
     * being performed. It could be a department, team, or any other category that the analysis is
     * being done for.
     * @param model - The "model" parameter in this function refers to a specific type of counter that
     * is being tracked within a particular branch. It could be any kind of metric or measurement that
     * needs to be counted and analyzed. Examples could include the number of sales, the number of
     * website visits, or the number of customer
     */
    static counterModelByBranch(event, branch, model) {
        if (event == 'new') this.analysis[branch][model] += 1;
        if (event == 'dec') this.analysis[branch][model] -= 1;
        if (event == 'del') this.analysis[branch][model] = 0;
    }


    /**
     * The function calculates the percentage of models in each branch of an analysis and prints the results.
     */
    static protocol() {
        let countModels = 0;
        let precentModels = {};
        let precentTotalModels = 0;
        let taskStart = performance.now();

        // TODO: counter countModels
        for (const branch of Reflect.ownKeys(this.analysis)) {
            // (this.analysis[branch] instanceof Object) ? countModels += Reflect.ownKeys(this.analysis[branch]).length : countModels += this.analysis[branch];
            (this.analysis[branch] instanceof Object) ? countModels += 0 : countModels += this.analysis[branch];
        }

        // TODO: countModel to precent
        if (countModels > 0) {
            for (const branch of Reflect.ownKeys(this.analysis)) {
                if (this.analysis[branch] instanceof Object) {
                    let countModels = 0;

                    for (const model of Reflect.ownKeys(this.analysis[branch])) countModels += this.analysis[branch][model];

                    for (const model of Reflect.ownKeys(this.analysis[branch])) {
                        let calc = ((this.analysis[branch][model] / countModels) * 100).toFixed(2);
                        if (!Reflect.ownKeys(precentModels).includes(branch)) precentModels[branch] = {};
                        if (!Reflect.ownKeys(precentModels[branch]).includes(model)) precentModels[branch][model] = calc;
                        console.log(calc);
                    }
                } else {
                    let calc = ((this.analysis[branch] / countModels) * 100).toFixed(2);
                    precentModels[branch] = calc;
                    precentTotalModels += +calc;
                }
            }
        }

        let taskEnd = performance.now();

        // TODO: print precent models
        console.log(`${Color.BRIGHT}[${Color.FG_CYAN}Time Task${Color.FG_WHITE}]: ${taskEnd - taskStart} ms`);
        console.log(`${Color.BRIGHT}[${Color.FG_CYAN}Analysis${Color.FG_WHITE}]: ${precentTotalModels}%`);

        for (const branch of Reflect.ownKeys(this.analysis)) {
            if (this.analysis[branch] instanceof Object) {
                console.log(`${branch}`);
                for (const model of Reflect.ownKeys(this.analysis[branch])) {
                    console.log(` |\t@${model}: ${precentModels[branch][model]}%`);
                    if (Reflect.ownKeys(this.analysis[branch]).length > 1) console.log(` ${Color.FG_BLACK}*${Color.FG_WHITE}`);
                }
            } else 
                console.log(`@${branch}: ${precentModels[branch]}%`);
        }
    }
}

module.exports = Analysis;