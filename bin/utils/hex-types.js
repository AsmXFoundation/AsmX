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


module.exports = {
    Byte, Word, DWord
}