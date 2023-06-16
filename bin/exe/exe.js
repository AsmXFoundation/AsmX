const fs = require('fs');
const Color = require('../../utils/color');
const { FileError } = require('../../anatomics.errors');


class SuperBuffer extends Buffer {
    static writeUInt16BEList(buffer, list) {
        for (let index = 0; index < list.length; index++) {
            buffer[index] = list[index];
        }
    }
}


/*
 * TYPES:
 * - WORD - 2 bytes
 * - DWORD - 4 bytes
 */


class HeaderDOS {
    static START_HEADER_WINDOWS = [0x4D, 0x5A];
    static OFFSET_PE_HEADER = [0x40];
}


class StubDOS extends HeaderDOS {
    static MESSAGE = "This program cannot be run in DOS mode";
}


class RichHeader {
    static SIGNATURE = "Rich";
}


class HeaderPE {
    static NUMBER_OF_SECTIONS = 3;
    static SIZE_OF_OPTIONAL_HEADER = 0xe0;

    static MACHINE = {
        /** x32 */
        IMAGE_FILE_MACHINE_I386: 0x14c,
        /**  Intel Itanium (Intel x64) */
        IMAGE_FILE_MACHINE_IA64: 0x0200,
        /** on AMD64 (x64) */
        IMAGE_FILE_MACHINE_AMD64: 0x8664
    }

    static Characteristics = {
        EXE: 0x102,
        DLL: 0x103
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
        
        /** OFFEST PE HEADER */
        this.OFFSET_PE_HEADER = 0x40;
        /** 00 00 00 00-00 00 00-00 00 00-00 00 00-00 00 00 */
        this.SIZE_ROW_CELLS = 16;

        // Compose the Header DOS
        this.Compose().composeHeaderDOS.call(this);
        this.Compose().composeStubDOS.call(this);
        this.Compose().composeRichHeader.call(this);
        this.Compose().composeCompilerVersion.call(this);

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
                    SuperBuffer.writeUInt16BEList(this.e_magic, HeaderDOS.START_HEADER_WINDOWS);

                    /**  DOS Header - 00 00 00 00-00 00 00-00 00 00-00 00 XX-XX XX XX */
                    this.e_lfanew = Buffer.alloc(this.SIZE_ROW_CELLS);
                    this.e_lfanew.writeUInt16BE(0x80, this.SIZE_ROW_CELLS - 5);
                }
            }


            static composeStubDOS() {
                this.assembly_code = Buffer.alloc(this.SIZE_ROW_CELLS - 2);
    
                SuperBuffer.writeUInt16BEList(this.assembly_code, [
                    0x0e, 0x1f, 0xba, 0x0e, 0x00, 0xb4, 0x09, 0xcd, 
                    0x21, 0xb8 , 0x01, 0x4c, 0xcd, 0x21
                ]);

                /** Stub DOS */
                this.stub_dos = Buffer.alloc(StubDOS.MESSAGE.length);
                this.stub_dos.write(StubDOS.MESSAGE);

                this.stub_dos = Buffer.concat([this.assembly_code, this.stub_dos]);
            }


            static composeRichHeader() {
                this.BUILD_RICH_HEADER = Buffer.alloc(this.SIZE_ROW_CELLS / 2);
                this.BUILD_RICH_HEADER.write(RichHeader.SIGNATURE);
            }


            static composeCompilerVersion() {
                this.BUILD_COMPILER_VERSION = Buffer.alloc(this.SIZE_ROW_CELLS / 2);
                const [MAJOR, MINOR, MICRO, ISBETA] = [0, 0, 0, 1];
                this.BUILD_COMPILER_VERSION.write(`${MAJOR}${MINOR}${MICRO}${ISBETA == 1 ? `${ISBETA}` : ''}`);
            }


            static composeHeaderPE() {
                this.Signature = Buffer.alloc(4);
                this.Signature.write('PE');
                this.Machine = Buffer.alloc(2);

                if (this.programArchitecture == 'x32') {
                    this.Machine.writeUInt16BE(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_I386);
                } else if (this.programArchitecture == 'x54') {
                    this.Machine.writeUInt16BE(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_IA64);
                } else  if (this.programArchitecture == 'amd64') {
                    this.Machine.writeUInt16BE(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_AMD64);
                }
                
                this.Machine.reverse();

                this.NumberOfSections = Buffer.alloc(6);
                this.NumberOfSections.writeUInt16BE(0x3);
            }
        }
    }


    Builder() {
        return class {
            static buildHeaderDOS() {
                this.BUILD_HEADER_DOS = Buffer.concat([
                    this.e_magic, 
                    this.e_lfanew,
                    this.BUILD_COMPILER_VERSION,
                    this.BUILD_RICH_HEADER,
                    this.stub_dos,
                ]);
            }


            static buildHeaderPE() {
                this.BUILD_HEADER_PE = Buffer.concat([
                    this.Signature,
                    this.Machine,
                    this.NumberOfSections,
                ]);
            }
        }
    }


    static View() {
        return class {
            static ViewColumns = ' 00  01  02  03  04  05  06  07  08  09  0a  0b  0c  0d  0e  0f';

            static getFileContent(src) {
                try {
                    return fs.readFileSync(src);
                } catch {
                    new FileError({ message: FileError.FILE_NOT_FOUND });
                }
            }


            static view(src) {
                let content = this.getFileContent(src);
                let view = [];
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
                process.stdout.write('\tVIEW EXE FILE\n');
                process.stdout.write(`\t${Color.FG_GRAY}${'-'.repeat(96)}\n`);
                process.stdout.write(`\t${parseInt(Shift, 10).toString(10).padStart(8, 0)}:`);
                process.stdout.write(`${this.ViewColumns}\n`);
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


new EXE('win32', 'amd64', './test.exe', '');
// EXE.View().view('./test.exe');

module.exports = EXE;