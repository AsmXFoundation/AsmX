const fs = require('fs');

const { DWord } = require('../../utils/hex-types');
const { FileError } = require('../../../exception');
const Color = require('../../../utils/color');

const Parser = require('../../../parser');
const Compiler = require('../../../compiler');
const { Type } = require('../../../types');
const CryptoGraphy = require('../../../tools/cryptography');


/*
    00000000: 00  01  02  03  04  05  06  07  08  09  0a  0b  0c  0d  0e  0f
    00000000: 41  73  6d  58  00  00  00  00  00  00  00  00  00  00  00  00        AsmX............
    00000010: 00  00  03  00  05  00  02  00  01  00  00  00  00  00  00  00        ..♥.♣.☻.☺.......
    00000020: 00  00  00  00  00  00  00  00  00  00  00  00  70  00  00  00        ............p...
    00000030: 54  68  69  73  20  70  72  6f  67  72  61  6d  20  63  61  6e        This program can
    00000040: 6e  6f  74  20  62  65  20  72  75  6e  20  69  6e  20  41  50        not be run in AP
    00000050: 50  20  6d  6f  64  65  2e  00  00  00  00  00  00  00  00  00        P mode..........
    00000060: 00  00  00  00  00  00  00  00  00  00  00  00  00  00  00  00        ................
    00000070: 41  50  50  00  00  02  00  00  00  00  00  00  00  00  00  00        APP..☻..........
    00000080: 00  00  00  00  00  00  00  00  00  00  00  00  5a  00  00  00        ............Z...
*/


class TableComplier {
    static table;
    static it; // index table

    static create() {
        this.createIndexedTable();
    }


    static pullIndexByInstruction(instruction) {
        return `${Reflect.ownKeys(this.table).indexOf(instruction[0])}:${this.table[instruction[0]].indexOf(instruction)}`;
    }


    static pullInstructionByIndex(data) {
        this.createIndexedTable();
        
        if (typeof data == 'string') {
            if (data.indexOf(':')) {
                const [instruction, index] = data.split(':');
                let keys = Reflect.ownKeys(this.table);
                return this.table[keys[instruction]][index];
            }
        } 
    
        return;
    }


    static createIndexedTable() {
        let parserInstructions = Object.getOwnPropertyNames(Parser).filter(i => /parse\w+Statement/.test(i)).map(i => /parse(\w+)Statement/.exec(i)[1]).map( i => i.toLowerCase());
        let parseWords = [...new Set(parserInstructions.map(i => i[0]).sort())];
        let pmap = {};

        for (const key of parseWords) pmap[key[0]] = [];
        for (const instruction of parserInstructions) pmap[instruction[0]].push(instruction);

        this.table = pmap;
    }
}


class HeaderApp {
    static SIGNATURE = 'AsmX';
}


class HeaderAppStub {
    static MESSAGE = 'This program cannot be run in APP mode.';
}


class OptionalHeaderApp {
    static SIGNATURE = {
        x32: 'APP',
        x64: 'APP+'
    }

    static MACHINE = {
        /**  Unknown CPU  */
        IMAGE_FILE_MACHINE_UNKNOWN:     0x0,
        /**  x32  */
        IMAGE_FILE_MACHINE_I386:        0x14c,
        /**  Intel Itanium (Intel x64)  */
        IMAGE_FILE_MACHINE_IA64:        0x0200,
        /**  on AMD64 (x64) */
        IMAGE_FILE_MACHINE_AMD64:       0x8664,
        /**  MIPS R3000, little-endian  **/
        IMAGE_FILE_MACHINE_R3000:	    0x0162,
        /**  MIPS R4000  */
        IMAGE_FILE_MACHINE_R4000:	    0x0166,
        /**	 MIPS R10000  */
        IMAGE_FILE_MACHINE_R10000:	    0x0168,
        /**  MIPS WCE v2  */
        IMAGE_FILE_MACHINE_WCEMIPSV2:	0x0169,
        /**  DEC/Compaq Alpha AXP  */
        IMAGE_FILE_MACHINE_ALPHA:	    0x0184,
        /**  Hitachi SH3  */
        IMAGE_FILE_MACHINE_SH3:	        0x01A2,
        /**  Hitachi SH3 DSP  */
        IMAGE_FILE_MACHINE_SH3DSP:	    0x01A3,
        /**  Hitachi SH3E  */
        IMAGE_FILE_MACHINE_SH3E:	    0x01A4,
        /**  Hitachi SH4  */
        IMAGE_FILE_MACHINE_SH4:	        0x01A6,
        /**  Hitachi SH5  */
        IMAGE_FILE_MACHINE_SH5:	        0x01A8,
        /**  ARM  */
        IMAGE_FILE_MACHINE_ARM:	        0x01C0,
        /**  ARM Thumb  */
        IMAGE_FILE_MACHINE_THUMB:	    0x01C2,
        /**  Panasonic AM33  */
        IMAGE_FILE_MACHINE_AM33:	    0x01D3,
        /**  IBM PowerPC  */
        IMAGE_FILE_MACHINE_POWERPC:	    0x01F0,
        /**  IBM PowerPC FP  */
        IMAGE_FILE_MACHINE_POWERPCFP:	0x01F1,
        /**  Intel IA-64 (Itanium)  */
        IMAGE_FILE_MACHINE_IA64:	    0x0200,
        /**  MIPS16  */
        IMAGE_FILE_MACHINE_MIPS16:	    0x0266,
        /**  Motorola 68000  */
        IMAGE_FILE_MACHINE_MOTOROLA:	0x0268,
        /**  DEC/Compaq Alpha AXP 64-bit  */
        IMAGE_FILE_MACHINE_ALPHA64:	    0x0284,
        /**  HP PA-RISC  */
        IMAGE_FILE_MACHINE_HP_PA_RISC:  0x0290,
        /**  MIPS with FPU  */
        IMAGE_FILE_MACHINE_MIPSFPU:     0x0366,
        /**  MIPS16 with FPU  */
        IMAGE_FILE_MACHINE_MIPSFPU16:	0x0466,
        /** Infineon TriCore  */
        IMAGE_FILE_MACHINE_TRICORE:	    0x0520,
        /**  CEF  */
        IMAGE_FILE_MACHINE_CEF:     	0x0CEF,
        /**  EFI Byte Code  */
        IMAGE_FILE_MACHINE_EBC:	        0x0EBC,
        /**  AMD 64 (K8)  */
        IMAGE_FILE_MACHINE_AMD64:	    0x8664,
        /**  Renesas M32R  */
        IMAGE_FILE_MACHINE_M32R:	    0x9041,
        /**  CEE  */
        IMAGE_FILE_MACHINE_CEE:	        0xC0EE,
    }
}


class App {
    constructor(outputfilename, architecture, programArchitecture, source, crypto_t, auth_t) {
        this.programArchitecture = programArchitecture;
        this.architecture = architecture;
        this.outputfilename = outputfilename;
        this.source = source;
        this.crypto_t = crypto_t;
        this.auth_t = auth_t;
        /** Offset APP File */
        this.OFFSET_APP = 0x00000000;
        /** 00 00 00 00-00 00 00-00 00 00-00 00 00-00 00 00 */
        this.SIZE_ROW_CELLS = 16;

        this.Compose().composeStartHeaderApp.call(this);
        this.Compose().composeLinkerApp.call(this);
        this.Compose().composeStubApp.call(this);
        this.Compose().composeOptionalHeaderApp.call(this);
        
        this.Builder().buildStartHeaderApp.call(this);
        this.Builder().buildStubApp.call(this);
        this.Builder().buildOptionalHeaderApp.call(this);
        this.Builder().buildSourceCodeApp.call(this);

        this.Backend();
    }


    Compose() {
        return class {
            static composeStartHeaderApp() {
                if (this.OFFSET_APP == 0x0) {
                    // 4 + 4 = 8 -> 16 - 8 = 8 empty bytes
                    this.app_magic = new DWord(HeaderApp.SIGNATURE);
                    this.app_m = Buffer.alloc(this.SIZE_ROW_CELLS - this.app_magic.byteLength);
                    this.app_magic = Buffer.concat([this.app_magic, this.app_m]);

                    /**  DOS Header - 00 00 00 00-00 00 00-00 00 00-00 00 XX-XX XX XX */
                    this.app_offset = Buffer.alloc(this.SIZE_ROW_CELLS);
                    this.app_offset.writeUInt16BE(0x100, this.SIZE_ROW_CELLS - 5);
                    this.OFFSET_APP += 0xA;
                }
            }


            static composeLinkerApp() {
                if (this.OFFSET_APP == 0xA) {
                    this.app_linker = Buffer.alloc(this.SIZE_ROW_CELLS);
                    const [MAJOR, MINOR, MICRO, ISBETA] = [3, 0, 0, 0];
                    this.app_linker[2] = parseInt(MAJOR, 16).toString(16);
                    this.app_linker[3] = '-';
                    this.app_linker[4] = parseInt(MINOR, 10).toString(16);
                    this.app_linker[5] = '-';
                    this.app_linker[6] = parseInt(MICRO, 10).toString(16);
                    this.app_linker[7] = '-';
                    this.app_linker[8] = parseInt(ISBETA, 10).toString(16);
                    this.OFFSET_APP += 0xA;
                }
            }


            static composeStubApp() {
                this.app_stub = Buffer.alloc(this.SIZE_ROW_CELLS * 4);
                if (this.crypto_t) {
                   if (this.crypto_t == 'l1') this.app_stub.write(CryptoGraphy.caesar(HeaderAppStub.MESSAGE, 4));
                } else {
                    this.app_stub.write(HeaderAppStub.MESSAGE);
                }
            }


            static composeOptionalHeaderApp() {
                this.app_signature = Buffer.alloc(4);
                if (this.architecture == 'x32') this.app_signature.write(OptionalHeaderApp.SIGNATURE.x32);
                if (this.architecture == 'x64') this.app_signature.write(OptionalHeaderApp.SIGNATURE.x64);
                this.app_machine = Buffer.alloc(2);
                
                if (this.programArchitecture == 'x32') {
                    this.app_machine.writeUint16BE(OptionalHeaderApp.MACHINE.IMAGE_FILE_MACHINE_I386);
                } else if (this.programArchitecture == 'x64') {
                    this.app_machine.writeUint16BE(OptionalHeaderApp.MACHINE.IMAGE_FILE_MACHINE_IA64);
                }
                
                this.app_offset_source = Buffer.alloc(16);
                this.app_offset_source.writeInt16BE(parseInt(0x120, 10).toString(16), this.SIZE_ROW_CELLS - 5);

                this.app_crypto = Buffer.alloc(16);
                this.crypto_t && this.app_crypto.write(this.crypto_t);

                this.app_auth = Buffer.alloc(32);

                this.app_machine.reverse();
            }
        }
    }


    Builder() {
        return class {
            static buildStartHeaderApp() {
                this.BUILD_START_HEADER_APP = Buffer.concat([
                    this.app_magic,
                    this.app_linker,
                    this.app_offset
                ]);
            }


            static buildStubApp() {
                this.BUILD_STUB_HEADER_APP = Buffer.concat([
                    this.app_stub
                ]);
            }


            static buildOptionalHeaderApp() {
                this.BUILD_OPTIONAL_HEADER_APP = Buffer.concat([
                    this.app_crypto,
                    this.app_auth,
                    this.app_signature,
                    this.app_machine,
                    Buffer.alloc(10),
                    this.app_offset_source
                ]);
            }


            static buildSourceCodeApp() {
                if (Array.isArray(this.source)) {
                    let sourceBuffers = [];
                    const source = this.source.map(s => s.parser.code).filter(t => t);
                    TableComplier.create();

                    source.forEach((line) => {
                        let l2 = line.slice(line.indexOf(' '));
                        let nl2 = ':';
                        for (const char of l2) nl2 += char.charCodeAt() + ':';
                        l2 = nl2;
                        l2 = l2.split(':').reverse().join(':');
                        let cl = `${TableComplier.pullIndexByInstruction(line.substring(1, line.indexOf(' ')).toLowerCase())} <${l2}>\0`;
                        this.BUILD_SOURCE_CODE_APP = Buffer.alloc(cl.length);
                        this.BUILD_SOURCE_CODE_APP.write(cl);
                        sourceBuffers.push(this.BUILD_SOURCE_CODE_APP);
                    });

                    let totalSize = 0;
                    sourceBuffers = sourceBuffers.filter(buf => buf !== undefined);
                    sourceBuffers.map((buf) => totalSize += buf.length);
                    this.BUILD_SOURCE_CODE_APP = Buffer.alloc(totalSize);
                    this.BUILD_SOURCE_CODE_APP = Buffer.concat(sourceBuffers, totalSize + 16);
                } else {
                    this.BUILD_SOURCE_CODE_APP = Buffer.alloc(this.source.length + 16);
                    this.BUILD_SOURCE_CODE_APP.write(this.source);
                }
            }
        }
    }


    Backend() {
        if (!this.outputfilename.endsWith('.app')) this.outputfilename = this.outputfilename + '.app';

        this.outputSource = Buffer.concat([
            this.BUILD_START_HEADER_APP,
            this.BUILD_STUB_HEADER_APP,
            this.BUILD_OPTIONAL_HEADER_APP,
            this.BUILD_SOURCE_CODE_APP
        ]);

        fs.writeFileSync(this.outputfilename, this.outputSource, { encoding: 'utf-8' });
    }


    static getFileContent(src) {
        try {
            return fs.readFileSync(src);
        } catch {
            new FileError({ message: FileError.FILE_NOT_FOUND });
            process.exit(1);
        }
    }


    static Decompiler() {
        return class {
            static getFileContent(src) {
                try {
                    return fs.readFileSync(src);
                } catch {
                    new FileError({ message: FileError.FILE_NOT_FOUND });
                    process.exit(1);
                }
            }


            static convertToAscii(string) {
                let stringf = '';
                for (const char of string)
                    stringf += String.fromCharCode(parseInt(char.toString().charAt(0) + char.toString().charAt(1), 16));

                return stringf;
            }


            static decompiler(path, log = true) {
                let content = this.getFileContent(path);
                let view = [];
                const formatebuf = content.toString('hex').match(/../g).join(' ');
                const hexList = formatebuf.match(/(\s?.{2})/g);
                const rows = Math.ceil(hexList.length / 16);
                let counter = 0;
                this.app_offset = 0x00;
                this.app_stub = '';
                this.app_source = [];

                for (let index = 0; index < rows; index++) {
                    view.push(hexList.slice(counter, counter + 16));
                    counter += 16;
                }

                const ListToBuffer = (list) => Buffer.from(list.join(''), 'hex');
                const rowsForViewValue = view;
                let index = 0;

                view.forEach((row) => {
                    if (index == 0) {
                        let rowValue = rowsForViewValue[index].map(hex => hex.trim()).slice(0, 4);
                        this.app_magic = this.convertToAscii(rowValue);

                        if (this.app_magic == 'AsmX') {
                            log && process.stdout.write('Step 1: The file is original');
                        } else {
                            process.stdout.write('Invalid File');
                            process.exit(1);
                        }

                        index += 10;
                    }
                    
                    else if (index == 10) {
                        row = row.map(hex => hex.trim());

                        let app_linker = {
                            major: parseInt(row.slice(2, 3), 10).toString(16),
                            minor: parseInt(row.slice(4, 5), 10).toString(16),
                            micro: parseInt(row.slice(6, 7), 10).toString(16),
                            beta: parseInt(row.slice(8, 9), 10).toString(16)
                        };

                        this.app_linker = app_linker;

                        if (log) {
                            console.log(`\n\n${Color.BG_GREEN} ${Object.values(app_linker).join('.')}${Color.BG_BLACK} Linker Version:`);
                            console.log('\t|-> Major: ', app_linker.major);
                            console.log('\t|-> Minor: ', app_linker.minor);
                            console.log('\t|-> Micro: ', app_linker.micro);
                            console.log('\t|-> is Beta (1 - yes / 0 no): ',app_linker.beta);
                        }

                        index += 10;
                    } 
                    
                    else if (index == 20) {
                        let offset = row.map(hex => hex.trim()).slice(12).join(' ');
                        this.app_offset = parseInt(offset, 10);
                        index += 10;
                    }

                    else if (this.app_offset > index) {
                        row = row.map(hex => hex.trim());
                        
                        if (index + 10 == this.app_offset) {
                            this.app_crypto = this.convertToAscii(row.slice(0, 4).filter(hex => hex != '00').map(hex => hex.trim()));
                        } else {
                            this.app_stub += ListToBuffer(row).toString();
                        }

                        index += 10;
                    }

                    else if (this.app_offset == index) {
                        this.app_signature = this.convertToAscii(row.slice(0, 4).filter(hex => hex != '00').map(hex => hex.trim()));
                        if (!Object.values(OptionalHeaderApp.SIGNATURE).includes(this.app_signature)) process.stdout.write(this.app_stub);

                        this.app_machine = row.slice(4, 6).reverse().filter(hex => hex != '00').map(hex => hex.trim());
                        index += 10;
                    }

                    else if (this.app_offset + 10 == index) {
                        row = view[(this.app_offset + 10) / 10];
                        this.app_offset_source = row.slice(12).filter(hex => hex != '00').map(hex => hex.trim());
                        this.app_offset_source.reverse();

                        // new app offset source
                        let naos = [];
                        let isNext = true;

                        while (isNext) {
                            for (let index = 0; index < this.app_offset_source.length; index++) {
                                const item = this.app_offset_source[index];
                                 (item !== '00') ? naos.push(item) : isNext = false;
                            }
                        }

                        this.app_offset_source = naos;
                        this.app_offset_source = +parseInt(this.app_offset_source.join(''), 16).toString(10);
                        index += 10;
                    }

                    else if (this.app_offset_source >= index) {
                        this.app_source.push(row);
                    }
                })
            }
        }
    }


    static Execute() {
        return class {
            static execute(path) {
                this.decompiler = App.Decompiler();
                this.decompiler.decompiler(path, false);
                const keys = [];

                for (const key of Reflect.ownKeys(this.decompiler)) if (typeof this.decompiler[key] !== 'function') keys.push(key);

                this.app_linker = this.decompiler['app_linker'];
                this.app_stub = this.decompiler['app_stub'];
                this.app_magic = this.decompiler['app_magic'];
                this.app_offset_source = this.decompiler['app_offset_source'];

                if (this.decompiler['app_crypto']) this.app_stub = CryptoGraphy.caesar(this.app_stub, -4);

                if (this.app_linker.major != 3) {
                    process.stdout.write(this.app_stub);
                    process.exit(1);
                }

                if (this.app_magic !== 'AsmX') {
                    process.stdout.write(this.app_stub);
                    process.exit(1);
                }

                this.app_source = this.decompiler['app_source'].map(list => list.map(item => item.trim()));
                this.app_source[this.app_source.length - 1].every((item) => item == '00') && this.app_source.pop();
                this.app_source = this.app_source.join(' ').split('00');
                this.app_source = this.app_source.map(item => item.replaceAll(',', ' ').trim()).filter(line => line !== '');
                // new app source formated
                let nasf = [];
                this.app_source.map((line) => nasf.push(Buffer.from(line.split(' ').join(''), 'hex').toString()));
                this.app_source = nasf;

                this.app_source = this.app_source.map(line => {
                    let instruction = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ')).trim();
                    let i9n;
                    
                    if ((i9n = TableComplier.pullInstructionByIndex(instruction))) {
                        let nl2 = '';
                        line = line.slice(2, line.indexOf(':>'));
                        line = line.split(':').reverse().join(':');
                        let l2 = line;
                        for (const char of l2.split(':')) nl2 += String.fromCharCode(char);
                        return `@${i9n}${nl2}`;
                    } else {
                        process.stdout.write(this.app_stub);
                        process.exit(1);
                    }
                });


                try {
                    new Compiler(Parser.parse(this.app_source.join('\n')));
                } catch {
                    process.stdout.write(`${Color.BRIGHT}[${Color.FG_RED}Exception${Color.FG_WHITE}]: ${this.app_stub}\n`);
                    process.exit(1);
                }
            }
        }
    }
}


module.exports = App;