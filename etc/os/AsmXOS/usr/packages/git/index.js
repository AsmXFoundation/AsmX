const { execSync } = require('child_process');

class CLI {
    static git() {
        try {
            const parameters = this.cli_args.slice(1).join(' ');
            let answer = execSync(`git ${parameters}`);
            console.log(answer.toString('utf8'));
        } catch (e) {
            console.log(e.toString());
            console.log(`[GIT][EXCEPTION]: exception`);
        }
    }
}

module.exports = CLI;