const Color = require("../utils/color");

class ServerLog {
    static tags = [];

    /**
     * The function adds a new tag with a specified name and color to an array of tags.
     * @param tagname - The name of the tag that is being added to the list of tags.
     * @param color - The "color" parameter is a value that represents the color associated with a tag.
     * It could be a string value representing a color name (e.g. "red", "blue", "green"), or a
     * hexadecimal value representing a specific color (e.g. "#FF0000" for red).
     */
    static newTag(tagname, color) {
        this.tags.push({ tag: tagname, color: color });
    }


    /**
     * The function logs a message with a tag and optional date and formatting options.
     * @param message - The message to be logged.
     * @param tag - The `tag` parameter is a string that represents a tag for the log message. It is
     * used to identify the source or category of the log message.
     * @param options - An object that contains optional parameters for the log function. It has two
     * @api public
     * @version 1.0
     */
    static log(message, tag, options) {
        options = { Date: options?.date || true, formatString: Color.BRIGHT };
        tag = this.tags.filter(item => item.tag == tag);

        if (message instanceof Array) {
            message.forEach(msg => {
               process.stdout.write(`${options.formatString}[${new Date().getTime()}][${new Date().toLocaleString()}][${tag[0].color}${tag[0].tag}${Color.RESET}${options.formatString}]    ${options.formatString}${msg}${Color.RESET}`);
            });
        } else
            process.stdout.write(`${options.formatString}[${new Date().getTime()}][${new Date().toLocaleString()}][${tag[0].color}${tag[0].tag}${Color.RESET}${options.formatString}]   ${options.formatString}${message}${Color.RESET}`);
    }
}


/* 
    The code is adding new tags to the `ServerLog` class by calling the `newTag` method and passing in a
    tag name and a color. Each tag consists of a name and a color, which are stored in an array of tags.
    The tags are used to identify the source or category of a log message when the `log` method is
    called. 
*/
ServerLog.newTag('Compiler', Color.FG_YELLOW);
ServerLog.newTag('Successfuly', Color.FG_GREEN);
ServerLog.newTag('Warning', Color.FG_YELLOW);
ServerLog.newTag('Exception', Color.FG_RED);
ServerLog.newTag('Notify', Color.FG_CYAN);
ServerLog.newTag('Info', Color.FG_MAGENTA);
ServerLog.newTag('Possible fixes', Color.FG_GREEN);
ServerLog.newTag('Neural Log', Color.FG_YELLOW);
ServerLog.newTag('Security Log', Color.FG_RED);

module.exports = ServerLog;