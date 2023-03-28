class Issues {}

Object.defineProperty(Issues, 'ISSUES_DEFINE_STATUS', {value: '[AsmX]: issues define status..\n' });
Object.defineProperty(Issues, 'SET_EVENT', { value: '[AsmX]: set..\n' });
Object.defineProperty(Issues, 'INVOKE_EVENT', { value: '[AsmX]: invoke..\n' });
Object.defineProperty(Issues, 'MEMORY_EVENT', { value: '[AsmX]: Print to memory...\n' });
Object.defineProperty(Issues, 'ADDRESS_EVENT', { value: '[AsmX]: Set address\n' });
Object.defineProperty(Issues, 'ROUTE_EVENT', { value: '[AsmX]: Set route point\n' });
Object.defineProperty(Issues, 'STACK_EVENT', { value: '[AsmX]: Stack changed..\n' });
Object.defineProperty(Issues, 'CALCULATE_ADD_EVENT', { value: '[AsmX]: match add..\n' });
Object.defineProperty(Issues, 'CALCULATE_SUB_EVENT', { value: '[AsmX]: match sub..\n' });
Object.defineProperty(Issues, 'EQUALITY_EVENT', { value: '[AsmX]: match equal..\n' });
Object.defineProperty(Issues, 'CALCULATE_DIV_EVENT', { value: '[AsmX]: reading..\n' });
Object.defineProperty(Issues, 'CALCULATE_MOD_EVENT', { value: '[AsmX]: reading..\n' });
Object.defineProperty(Issues, 'CALL_EVENT', { value: '[AsmX]: call ...\n' });
Object.defineProperty(Issues, 'CREATE_UNIT_EVENT', { value: '[AsmX]: create unit ..\n' });
Object.defineProperty(Issues, 'RET_EVENT', { value: '[AsmX]: ret ...\n' });
Object.defineProperty(Issues, 'IMPORT_EVENT', { value: '[AsmX]: import..\n' });
Object.defineProperty(Issues, 'SET_CONSTANT_EVENT', { value: '[AsmX]: set constant..\n' });
Object.defineProperty(Issues, 'EXECUTE_EVENT', { value: '[AsmX]: execute.. \n' });
Object.defineProperty(Issues, 'CALCULATE_IMUL_EVENT', { value: '[AsmX]: reading..\n' });
Object.defineProperty(Issues, 'SET_OFFSET_EVENT', { value: '[AsmX]: setting offset to current position in stack..\n' });
Object.defineProperty(Issues, 'UNSET_EVENT', { value: '[AsmX]: unsetting..\n' });
Object.defineProperty(Issues, 'MODIFY_EVENT', { value: '[AsmX]: modifying...\n' });
Object.defineProperty(Issues, 'POP_EVENT', { value: '[AsmX]: pop...\n' });
Object.defineProperty(Issues, 'PUSH_EVENT', { value: '[AsmX]: push...\n' });

module.exports = Issues;