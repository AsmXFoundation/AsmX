import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        defaultToken: 'invalid',
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        tokenizer: {
            root: [
                [/[(){}]/, {token: 'operator', next: '@rest'}],
                { include: '@whitespace' },
            ],

            rest: [
                [/[{}<>()[\]]/, '@brackets'],

                [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
                [/([$]|0[xX])[0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],

                [/[-+,*/!:&{}()]/, 'operator'],

                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/"/, {token: 'string.quote', bracket: '@open', next: '@string'}],
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, {token: 'string.quote', bracket: '@close', next: '@pop'}],
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/[#;\\@].*$/, 'comment']
            ],
        }
    }
}

const def = definition();
monaco.languages.register({ id: 'asmx' });
monaco.languages.setMonarchTokensProvider('asmx', def);

export = def;