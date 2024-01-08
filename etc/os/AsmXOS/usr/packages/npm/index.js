const { execSync } = require('child_process');

/**
 * CLI class for executing npm commands.
 */
class CLI {
    /**
     * Executes a npm command.
     * @param {string} cli_args - Arguments for the npm command.
     */
    static npm() {
        try {
            // Join the CLI arguments into a single string
            const parameters = this.cli_args.slice(1).join(' ');

            // Execute the npm command
            let answer = execSync(`npm ${parameters}`);

            // Log the command output
            console.log(answer.toString('utf8'));
        } catch (e) {
            // Log any exceptions that occur during command execution
            console.log(e.toString());
            console.log(`[NPM][EXCEPTION]: exception`);
        }
    }
}

module.exports = CLI;