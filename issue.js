class Issues {}

Object.defineProperty(Issues, 'ISSUES_DEFINE_STATUS', {value: '[AsmX]: issues define status..\n' });
Object.defineProperty(Issues, 'SET_EVENT', { value: '[AsmX]: set...\n' });
Object.defineProperty(Issues, 'INVOKE_EVENT', { value: '[AsmX]: invoke...\n' });
Object.defineProperty(Issues, 'MEMORY_EVENT', { value: '[AsmX]: Print to memory...\n' });
Object.defineProperty(Issues, 'ADDRESS_EVENT', { value: '[AsmX]: Set address\n' });
Object.defineProperty(Issues, 'ROUTE_EVENT', { value: '[AsmX]: Set route point\n' });
Object.defineProperty(Issues, 'STACK_EVENT', { value: '[AsmX]: Stack changed..\n' });
Object.defineProperty(Issues, 'ADD_EVENT', { value: '[AsmX]: match add..\n' });
Object.defineProperty(Issues, 'SUB_EVENT', { value: '[AsmX]: match sub..\n' });
Object.defineProperty(Issues, 'EQUALITY_EVENT', { value: '[AsmX]: match equal..\n' });
Object.defineProperty(Issues, 'MATCH_DIV_EVENT', { value: '[AsmX]: match..\n' });
Object.defineProperty(Issues, 'MATCH_MOD_EVENT', { value: '[AsmX]: match..\n' });
Object.defineProperty(Issues, 'CALL_EVENT', { value: '[AsmX]: call ...\n' });
Object.defineProperty(Issues, 'CREATE_UNIT_EVENT', { value: '[AsmX]: create unit ...\n' });
Object.defineProperty(Issues, 'RET_EVENT', { value: '[AsmX]: ret ...\n' });
Object.defineProperty(Issues, 'IMPORT_EVENT', { value: '[AsmX]: import ...\n' });

module.exports = Issues;