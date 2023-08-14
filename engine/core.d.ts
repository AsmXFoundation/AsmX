declare interface CallBack {
    args?: [];
    parser?: object;
}

declare interface Register {
    name: string,
    value: string
}

declare interface CallUnit {
    name: string,
    arguments: string
}

declare class Engine {
   static registerInstruction(name: String, cb: CallBack): any
   static changeRegister<T>(name: string, value: T): Register
   static callUnit(name: string, arguments: string): CallUnit
}