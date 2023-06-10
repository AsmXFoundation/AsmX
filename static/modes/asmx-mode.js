import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        
    }
}

const def = definition();
monaco.languages.register({ id: 'asmx' });
monaco.languages.setMonarchTokensProvider('asmx', def);

export = def;