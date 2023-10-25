const ServerLog = require('../../../../../../server/log');

class CLI {
    static starlink() {
        let parameters = this.cli_args.slice(1);
        let [flags, url, last] = [['--connect'],, parameters[parameters.length - 1]];

        if (flags.includes(last)) {
            url = parameters.slice(0, -1).join('');
            parameters = [url, last];
        }

        if (parameters.length > 2) {
            ServerLog.log("too many parameters\n", 'Exception');
        } else {
            console.log(`Starlink`);

            if (last == '--connect') {
                let isNext = true;

                let behavior = {
                    effective: [6, 7, 8],
                    failure: [3],
                    route: [4]
                }

                class StarLinkTerminal {
                    static boards = [];
                    static reportBoards = 0;
                    static messages = 0;

                    static rand = (max, min = 0) => Math.ceil(Math.random() * (max - min) + min);

                    static getBoard() {
                        const nameBoards = ['X', 'R', 'NE', 'AIR', 'LI', 'ZE', 'SE', 'AE', 'FA'];
                        const RoomSizeTitle = this.rand(2, 3);
                        let room = '';
                        for (let index = 0; index < RoomSizeTitle; index++) room += this.rand(9);
                        return `${nameBoards[this.rand(nameBoards.length - 1)] || nameBoards[0]}${room}`;
                    }

                    static connect() {
                        let board = this.getBoard();
                        this.log(`The Internet is working stably...`);
                        this.log(`Successful connection on board ${board}`);
                        this.boards.push(board);
                        this.messages += 1;
                    }

                    static route() {
                        let board = this.getBoard();
                        this.log(`Redirection to board ${board}`);
                        this.boards.includes(board) && this.log(`Previously there was a connection on this board: ${board}`);
                        this.reportBoards % 10 == 0 && this.log(`Past boards: (...${this.boards.slice(this.boards.length - 5).join(', ')})`);
                        this.reportBoards += 1;
                        this.log(`New boards: (${board})`);
                        this.boards.push(board);
                        this.messages += 1;
                    }

                    static effective() { 
                        this.log(`The Internet is working stably`);
                        this.messages += 1;
                    }

                    static failure() { 
                        this.log(`Connection terminated`);
                        this.messages >= [100, 200, 150].map(n => n * 10)[this.rand(0, 1)] ? process.exit() : this.route();
                        this.messages += 1;
                    }

                    static log(message) { console.log(`[TERMINAL][STARLINK]: ${message}`); }
                }

                StarLinkTerminal.connect();
                let delay = 0;

                while (isNext) {
                    let num = Math.ceil(Math.random() * (9 - 2) + 2);
                    for (const behaviorStep of Reflect.ownKeys(behavior)) if (behavior[behaviorStep].includes(num)) {
                        if (delay % 2000 == 0) StarLinkTerminal[behaviorStep]();
                        delay += 0.5;
                    }
                }
            }
        }
    }
}

module.exports = CLI;