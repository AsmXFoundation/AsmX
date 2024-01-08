(function () {
    'use strict';

    class TableCLI {
        /**
         * This is a static method that takes in a message and a fill character,
         * and returns a new string with the fill character inserted at the center of the message.
         * @param {string} message - The original message.
         * @param {string} fill - The fill character to be inserted.
         * @returns {string} - The modified message with the fill character inserted at the center.
         */
        static #centerFill(message, fill) {
            // Calculate the center position of the message
            const center = Math.ceil(message.length / 2);

            // Insert the fill character at the center position
            return `${message.slice(0, center - 1)}${fill}${message.slice(center)}`;
        }


        /**
         * Creates a styled string based on the provided type, string, and indexRow.
         * @param {string} type - The type of style.
         * @param {string} string - The string to be styled.
         * @param {number} indexRow - The index of the row.
         * @returns {string} - The styled string.
         */
        static #createStyleString(type, string, indexRow) {
            // This code block checks for the presence of colors and applies them to the string.
            const colors = this.styles?.color?.[type];

            // Check if colors exist
            if (colors) {
                if (typeof colors === 'string') {
                    // If colors is a string, add the string and reset the color.
                    return `${colors.trim()}${string}\x1b[38;0;0m`;
                } else if (colors instanceof Array) {
                    // Check if the indexRow exists in the colors array
                    if (colors[indexRow]) return `${colors[indexRow]}${string}\x1b[38;0;0m`;
                } if (Reflect.ownKeys(colors).map(Number).includes(indexRow)) {
                    // If the indexRow exists in the keys of colors, add the color at the indexRow and reset the color.
                    return `${colors[indexRow]}${string}\x1b[38;0;0m`;
                } else if (Reflect.ownKeys(colors).includes('all')) {
                    // If 'all' exists in the keys of colors, add the color at 'all' and reset the color.
                    return `${colors.all}${string}${colors.all}`;
                }
            }

            // If colors is not defined, return the string with default color.
            return `\x1b[38;0;0m${string}`;
        }


        /**
         * @param {string} string - The string to be styled
         * @param {number} indexRow - The index of the row
         * @returns {string} - The style string
         */
        static #createStyleStringByRow(string, indexRow) { 
            return this.#createStyleString('row', string, indexRow); 
        }


        /**
         * @param {string} string - The string to be styled
         * @param {number} indexRow - The index of the row
         * @returns {string} - The style string
         */
        static #createStyleStringByHeader(string, indexRow) { 
            return this.#createStyleString('header', string, indexRow); 
        }


        /**
         * Renders a table with the given data and parameters.
         * 
         * @param {object} table - The table object containing rows and dataset.
         * @param {object} params - The parameters object containing styles, fill, and gap.
         * @returns {string} - The rendered table as a string.
         */
        static redner(table, params) {
            // Destructuring assignment to extract 'rows' and 'dataset' from 'table' and 'params'
            const [{ rows, dataset }, { styles }] = [table ?? {}, params ?? {}];

            // Checking if 'params.fill' is a boolean or string and setting 'fill' accordingly
            const fill = ['boolean', 'string'].map(type => typeof params?.fill == type).includes(true) ? params?.fill : '-';
            
            // Setting 'gap' to 'params.gap' if it exists, otherwise defaulting to 2
            const gap = params?.gap ?? 2;

            // Assigning 'params.chunks' to 'datasetChunk'
            const datasetChunk = params?.chunks;

            // Update the styles property if styles is provided
            if (styles) this.styles = styles;

            // Throw an error if dataset is undefined
            if (dataset == undefined) {
                throw new Error('dataset is not defined');
            }

            // Initialize empty objects for headers and vertical data
            const headers = {};
            const vertical = {};

            // Initialize an empty array for storing rows with maximum width
            const maxWidthRows = [];

            // Initialize the index field for rows
            let indexFieldByRow = 0;

            if (rows) {
                // Loop through each header in the rows
                for (const header of rows) {
                    // Loop through each row in the dataset
                    for (const row of dataset) {
                        // Check if the header is not defined in the vertical object
                        if (vertical[header] == undefined) {
                            // If not defined, create an empty array for the header
                            vertical[header] = [];
                        }

                        // Push the value of the current row's index field to the vertical array for the header
                        vertical[header].push(row[indexFieldByRow]);
                    }

                    // Move to the next field index
                    indexFieldByRow++;
                }
            } else {
                // If rows are not defined, create vertical headers based on the dataset
                for (const _ of dataset) {
                    // Create an array to store the values of a specific field for each record in the dataset
                    vertical[indexFieldByRow] = dataset.map(record => record[indexFieldByRow]);
                    
                    // Move to the next field index
                    indexFieldByRow++;
                }
            }

            if (!datasetChunk) {
                // Calculate the maximum width for each row
                Object.entries(vertical).forEach(record => {
                    const nameRow = record[0];

                    // Filter out any falsy values in the record and convert all items to strings
                    record = record[1].filter(Boolean).map(item => String(item));
                    record.push(nameRow);

                    // Find the maximum length of all fields in the record
                    maxWidthRows.push(Math.max(...record.map(field => field ? field.length : 0)));
                });
            } else {
                // Calculate the maximum length of each field in the dataset and rows
                // and push the results to the maxWidthRows array
                maxWidthRows.push(...dataset.map((chunk, index) => Math.max(...[...chunk, rows[index]].map(field => field ? field.length : 0))));
            }

            let indexRow = 0; // Index of the current row
            const records = []; // Array to store the records
            const fillChar = fill == false ? ' ' : fill; // Character used for filling empty spaces

            /**
             * Checks if a value is valid.
             * @param {*} value - The value to check.
             * @returns {boolean} - True if the value is valid, false otherwise.
             */
            const validValue = (value) => ![undefined, NaN, Infinity, -Infinity, null].includes(value);

            // Check if there are rows
            if (rows) {
                for (const maxWidthRow of maxWidthRows) {
                    // Initialize the top and bottom headers
                    if (headers.top == undefined) headers.top = '';
                    if (headers.bottom == undefined) headers.bottom = '';

                    // Get the current row name
                    const nameRow = rows[indexRow].trim();

                    // Create the top and bottom headers
                    headers.top += this.#createStyleStringByHeader(`${nameRow}${' '.repeat(maxWidthRow - nameRow.length)}${' '.repeat(gap)}`, indexRow);
                    headers.bottom += this.#createStyleStringByHeader(`${'-'.repeat(maxWidthRow)}${' '.repeat(gap)}`, indexRow);

                    indexRow++;
                }
            }

            // Check if datasetChunk is falsy
            if (!datasetChunk) {
                // Iterate over each maxWidthRow
                for (const maxWidthRow of maxWidthRows) {
                    let bufferIndexRow = indexRow;
                    indexRow = 0;

                    // Get the first record from the dataset
                    const record = dataset[0];
                    const fields = [];

                    // Loop through each indexRow
                    maxWidthRows.forEach(width => {
                        const value = typeof record[indexRow] == 'number' ? String(record[indexRow]) : record[indexRow];
                        let initialString;

                        // If the value is not valid, center fill with fillChar
                        initialString = !validValue(value) ? this.#centerFill(' '.repeat(width), fillChar) : `${value}${' '.repeat(width - value.length)}`;

                        fields.push(this.#createStyleStringByRow(initialString, indexRow));
                        indexRow++;
                    });

                    // Add the fields to the records array
                    records.push(fields.join(' '.repeat(gap)));

                    // Remove the first element from the dataset
                    dataset.shift();

                    // Restore the indexRow value
                    indexRow = bufferIndexRow;
                }
            } else {
                indexRow = 0;

                // Iterate over each chunk in the dataset
                for (const _ of dataset) {
                    const fields = [];

                    // Iterate over each chunk in the dataset
                    for (const chunk of dataset) {
                        // Convert the first element of the chunk to a string
                        // If it's a number, convert it to string, otherwise keep it as is
                        const value = typeof chunk[0] == 'number' ? String(chunk[0]) : chunk[0];

                        // Get the maximum width for the current row
                        let width = maxWidthRows[indexRow];
                        let initialString;

                        // If the value is not valid, center fill with fillChar
                        if (!validValue(value)) {
                            // Center fill the string with fillChar
                            initialString = this.#centerFill(' '.repeat(width), fillChar);
                        } else {
                            // Pad the value with spaces to match the maximum width
                            initialString = `${value}${' '.repeat(width - value.length)}`;
                        }

                        // Create a styled string for the current row
                        fields.push(this.#createStyleStringByRow(initialString, indexRow));

                        // Remove the first element from the chunk
                        chunk.shift();

                        // Increment the indexRow
                        indexRow++;
                    }

                    // Add the fields to the records array
                    records.push(fields.join(' '.repeat(gap)));

                    // Reset the indexRow value
                    indexRow = 0;
                }
            }

            // Initialize an empty string to store the final message
            let message = '';
            
            // Check if there are any rows
            if (rows) {
              // Add the header row to the message
              message += Reflect.ownKeys(headers).map(key => headers[key]).join('\n') + '\n';
            }
            
            // Add the records to the message
            message += records.join('\n');
            
            // Return the final message
            return message;
        }
    }

    // Check if the module object exists and if module.exports is defined
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        // Export TableCLI as a module
        module.exports = TableCLI;
    }

    // Check if define function exists and if define.amd is defined
    else if (typeof define === 'function' && define.amd) {
        // Define TableCLI as a module
        define([], function () {
            return TableCLI;
        });
    }

    // If none of the above conditions are met, assume it's running in a browser environment
    else {
        // Assign TableCLI to the global window object
        window.TableCLI = TableCLI;
    }
})()