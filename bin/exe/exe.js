const fs = require('fs');
const Color = require('../../utils/color');
const { FileError } = require('../../anatomics.errors');

/*
 * TYPES:
 * - WORD - 2 bytes
 * - DWORD - 4 bytes
 */


class HeaderDOS {
    static START_HEADER_WINDOWS = 'MZ';
    static OFFSET_PE_HEADER = '@';
}


class StubDOS extends HeaderDOS {
    static MESSAGE = "This program cannot be run in DOS mode";
}


class HeaderPE {
    static NUMBER_OF_SECTIONS = 3;
    static SIZE_OF_OPTIONAL_HEADER = 0xe0;

    static MACHINE = {
        /** x32 */
        IMAGE_FILE_MACHINE_I386: 0x014c,
        /**  Intel Itanium (Intel x64) */
        IMAGE_FILE_MACHINE_IA64: 0x0200,
        /** on AMD64 (x64) */
        IMAGE_FILE_MACHINE_AMD64: 0x8664
    }
}



class Section {
    /** Code */
    TEXT = '.text';
    /** Initialized data */
    DATA = '.data';
    /** Uninitialized data */
    BSS = '.bss';
    /** Constants (Read-Only data) */
    RDATA = '.rdata';
    /** Export Descriptors */
    EDATA = '.edata';
    /** Import Descriptors */
    IDATA = '.idata';
    /** Relocation table */
    RELOC = '.reloc';
    /** Resources */
    RSRC = '.rsrc';
    /** __declspec(thread) Data */
    TLS = '.tls';
}


class EXE {
    constructor(architecture, programArchitecture, outputfilename, source) {
        this.programArchitecture = programArchitecture;
        this.outputfilename = outputfilename;
        this.architecture = architecture;
        this.source = source;

        /** 00 00 00 00-00 00 00-00 00 00-00 00 00-00 00 00 */
        this.SIZE_ROW_CELLS = 16;

        // Compose the Header DOS
        this.Compose().composeHeaderDOS.call(this);
        this.Compose().composeStubDOS.call(this);

        // Compose the PE Header
        this.Compose().composeHeaderPE.call(this);
        
        // Build Header
        this.Builder().buildHeaderDOS.call(this);
        this.Builder().buildHeaderPE.call(this);

        // Build EXE file
        this.Backend();
    }


    Compose() {
        return class {
            static composeHeaderDOS() {
                // PE32 - 32 bit address (win32)
                // PE32+ - 64 bit address (win64)

                if (this.architecture == 'win32') {
                    /**  DOS Header - 4D 5A 00 00-00 00 00-00 00 00-00 00 00-00 00 00 */
                    this.e_magic = Buffer.alloc(this.SIZE_ROW_CELLS);
                    this.e_magic.write(HeaderDOS.START_HEADER_WINDOWS);
        
                    /**  DOS Header - 00 00 00 00-00 00 00-00 00 00-00 00 40-00 00 00 */
                    this.e_lfanew = Buffer.alloc(this.SIZE_ROW_CELLS);
                    this.e_lfanew.write(HeaderDOS.OFFSET_PE_HEADER, this.SIZE_ROW_CELLS - 4);
                }
            }


            static composeStubDOS() {
                /** Stub DOS */
                this.stub_dos = Buffer.alloc(StubDOS.MESSAGE.length);
                this.stub_dos.write(StubDOS.MESSAGE);
            }


            static composeHeaderPE() {
                this.Signature = Buffer.alloc(4);
                this.Signature.write('PE');
    
                let e = Buffer.alloc(2);
                e.write('0x' + parseInt(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_I386, 10).toString(16));

                // console.log(parseInt(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_I386, 10).toString(16));

                if (this.programArchitecture == 'x32')   Buffer.alloc(2).write(parseInt(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_I386, 10).toString(10));
                if (this.programArchitecture == 'x54')   this.Machine = HeaderPE.MACHINE.IMAGE_FILE_MACHINE_IA64;
                if (this.programArchitecture == 'amd64') this.Machine = HeaderPE.MACHINE.IMAGE_FILE_MACHINE_AMD64;
            }
        }
    }


    Builder() {
        return class {
            static buildHeaderDOS() {
                this.BUILD_HEADER_DOS = Buffer.concat([
                    this.e_magic, 
                    this.e_lfanew,
                    this.stub_dos
                ]);
            }


            static buildHeaderPE() {
                this.BUILD_HEADER_PE = Buffer.concat([
                    this.Signature,
                    // this.Machine,
                    // HeaderPE.NUMBER_OF_SECTIONS,
                ]);
            }
        }
    }


    static View() {
        return class {
            static view(src) {
                try {
                    let content = fs.readFileSync(src);
                    let view = [];
                    const ViewColumns = ' 00  01  02  03  04  05  06  07  08  09  0a  0b  0c  0d  0e  0f';
                    let Shift = 0x00000000;
                    const formatebuf = content.toString('hex').match(/../g).join(' ');
                    const hexList = formatebuf.match(/(\s?.{2})/g);
                    const rows = Math.ceil(hexList.length / 16);
                    let counter = 0;

                    for (let index = 0; index < rows; index++) {
                        view.push(hexList.slice(counter, counter + 16));
                        counter += 16;
                    }

                    const rowsForViewValue = view;
                    view = view.map(row => row.join(' '));
                    view[0] = ` ${view[0]}`;
                    process.stdout.write('\tVIEW ELF FILE\n');
                    process.stdout.write(`\t${Color.FG_GRAY}${'-'.repeat(96)}\n`);
                    process.stdout.write(`\t${parseInt(Shift, 10).toString(10).padStart(8, 0)}:`);
                    process.stdout.write(`${ViewColumns}\n`);
                    process.stdout.write(`\t${'-'.repeat(96)}\n`);

                    view.forEach((row, index) => {
                        Shift += 10;
                        process.stdout.write(`\t${parseInt(Shift, 10).toString(10).padStart(8, 0)}:`);
                        process.stdout.write(row);
                        index > 0 && process.stdout.write(' '.repeat(view[index - 1].length - row.length));
                        process.stdout.write('\t');
                        let rowValue = rowsForViewValue[index].map(hex => hex.trim());

                        for (const hex of rowValue) {
                            let stringf;
                            if (hex == '00') process.stdout.write('.');
                            stringf = String.fromCharCode(parseInt(hex.toString().charAt(0) + hex.toString().charAt(1), 16));

                            process.stdout.write(stringf.toString('ascii'));
                        }

                        process.stdout.write('\n');
                    });
                } catch {
                    new FileError({ message: FileError.FILE_NOT_FOUND });
                }
            }
        }
    }


    Backend() {
        if (!this.outputfilename.endsWith(".exe")) this.outputfilename = `${this.outputfilename}.exe`;

        this.data = Buffer.concat([
            this.BUILD_HEADER_DOS,
            Buffer.alloc(this.SIZE_ROW_CELLS),
            this.BUILD_HEADER_PE
        ]);

        fs.writeFileSync(this.outputfilename, this.data, { encoding: 'utf8' });
    }
}


// new EXE('win32', 'x32', './test.exe', '');
// EXE.View().view('./test.exe');

module.exports = EXE;