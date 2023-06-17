const fs = require('fs');
const Color = require('../../utils/color');
const { FileError } = require('../../anatomics.errors');


class SuperBuffer extends Buffer {
    static writeUInt16BEList(buffer, list) {
        for (let index = 0; index < list.length; index++) {
            buffer[index] = list[index];
        }
    }


    static writeListInBuffer(buffer, list) {
        for (let index = 0; index < list.length; index++) buffer[index] = list[index];
    }
}


/*
 * TYPES:
 * - WORD - 2 bytes
 * - DWORD - 4 bytes
 */


/** 2 bytes */
class Word {
    static byteslength = 2;

    constructor(list, offset) {
        this.value = list;
        this.offset = offset || 0x0;
        this.buffer = Buffer.alloc(2);
        if (typeof list === 'string') this.buffer.write(list);
        else if (typeof list === 'number') this.buffer.writeUInt16BE(list, this.offset);

        else if (Array.isArray(list)) {
            this.buffer[0] = list[0] || 0x00;
            this.buffer[1] = list[1] || 0x00;
        }

        return this.buffer;
    }
}


/** 4 bytes */
class DWord {
    static byteslength = 4;

    constructor(list) {
        this.value = list;
        this.buffer = Buffer.alloc(4);
        if (typeof list === 'string') this.buffer.write(list);
        else if (typeof list === 'number') this.buffer.writeUInt16BE(list, this.offset);

        else if (Array.isArray(list)) {
            this.buffer[0] = list[0] || 0x0;
            this.buffer[1] = list[1] || 0x0;
            this.buffer[2] = list[2] || 0x0;
            this.buffer[3] = list[3] || 0x0;
        }

        return this.buffer;
    }
}


class Byte {
    constructor(value) {
        this.value = value;
        this.buffer = Buffer.alloc(1);
        this.buffer.write(this.value);
        return this.buffer;
    }
}


/**
 * @field SizeOfOptionalHeader
 * @class headerNT
 */
class HeaderNT {
    /**  for file PE   */
    static IMAGE_SIZEOF_NT_OPTIONAL32_HEADER = 0x0E0;
    /**  for file PE+ */
    static IMAGE_SIZEOF_NT_OPTIONAL64_HEADER = 0xF0;
}


class HeaderDOS {
    static START_HEADER_WINDOWS = [0x4D, 0x5A];
    static OFFSET_PE_HEADER = [0x40];
}


class StubDOS extends HeaderDOS {
    static MESSAGE = "This program cannot be run in DOS mode.";
}


class RichHeader {
    static SIGNATURE = "Rich";
}


class HeaderPE {
    static NUMBER_OF_SECTIONS = 3;
    static SIZE_OF_OPTIONAL_HEADER = 0xe0;


    static FIELD_MAGIC = {
        /**  Firmware header in ROM  */
        IMAGE_ROM_OPTIONAL_HDR_MAGIC:   0x0107,
        /** Header PE  */
        IMAGE_NT_OPTIONAL_HDR32_MAGIC:  0x010B,
        /**  Header PE+ */
        MAGE_NT_OPTIONAL_HDR64_MAGIC:	0x020B,
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
        this.OFFSET_PE_HEADER = 0x70;
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
                    SuperBuffer.writeUInt16BEList(this.e_magic, new Word(HeaderDOS.START_HEADER_WINDOWS));

                    /**  DOS Header - 00 00 00 00-00 00 00-00 00 00-00 00 XX-XX XX XX */
                    this.e_lfanew = Buffer.alloc(this.SIZE_ROW_CELLS);
                    this.e_lfanew.writeUInt16BE(0x70, this.SIZE_ROW_CELLS - 5);
                }
            }


            static composeStubDOS() {
                this.assembly_code = Buffer.alloc(14);
    
                SuperBuffer.writeUInt16BEList(this.assembly_code, [
                    0x0e, 0x1f, 0xba, 0x0e, 0x00, 0xb4, 0x09, 0xcd, 
                    0x21, 0xb8 , 0x01, 0x4c, 0xcd, 0x21
                ]);

                /** Stub DOS */
                this.stub_dos = Buffer.alloc(16 * 2 + 7);
                this.stub_dos.write(StubDOS.MESSAGE);
                this.end_stub_dos = Buffer.alloc(this.SIZE_ROW_CELLS - 5);
                this.end_stub_dos.write("\x0D\x0A$");

                this.stub_dos2 = Buffer.alloc(this.assembly_code.byteLength + this.stub_dos.byteLength + this.end_stub_dos.byteLength);

                this.stub_dos = Buffer.concat([
                    this.assembly_code,
                    this.stub_dos,
                    this.end_stub_dos
                ]);
    
                // this.stub_dos = Buffer.concat([this.assembly_code, this.stub_dos]);
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
                this.Signature = new DWord('PE\0\0');
                this.Machine = Buffer.alloc(2);

                if (this.programArchitecture == 'x32') {
                    this.Machine.writeUInt16BE(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_I386);
                } else if (this.programArchitecture == 'x54') {
                    this.Machine.writeUInt16BE(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_IA64);
                } else  if (this.programArchitecture == 'amd64') {
                    this.Machine.writeUInt16BE(HeaderPE.MACHINE.IMAGE_FILE_MACHINE_AMD64);
                }
                
                this.Machine.reverse();

                this.NumberOfSections = Buffer.alloc(2);
                this.NumberOfSections.writeUInt16BE(0x03);
                this.NumberOfSections.reverse();
                this.NumberOfSections = Buffer.concat([this.NumberOfSections, Buffer.alloc(8)]);

                this.SizeOfOtionalheader = Buffer.alloc(6);
                this.SizeOfOtionalheader.writeUInt16BE(HeaderPE.FIELD_MAGIC.IMAGE_NT_OPTIONAL_HDR32_MAGIC, 4);

                this.Characteristics = Buffer.alloc(2);
                this.Characteristics.writeUInt16BE(HeaderPE.Characteristics.EXE);
                this.Characteristics.reverse();
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
                    this.SizeOfOtionalheader,
                    this.Characteristics
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
                    process.exit(1);
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
                    Shift += 10;
                });
            }
        }
    }


    Backend() {
        if (!this.outputfilename.endsWith(".exe")) this.outputfilename = `${this.outputfilename}.exe`;

        this.data = Buffer.concat([
            this.BUILD_HEADER_DOS,
            // Buffer.alloc(this.SIZE_ROW_CELLS),
            this.BUILD_HEADER_PE
        ]);

        fs.writeFileSync(this.outputfilename, this.data, { encoding: 'utf8' });
    }
}


new EXE('win32', 'amd64', './test.exe', '');
// EXE.View().view('./test.exe');

module.exports = EXE;