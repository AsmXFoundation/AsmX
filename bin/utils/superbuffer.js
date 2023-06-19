class SuperBuffer extends Buffer {
    static writeUInt16BEList(buffer, list, offset) {
        for (let index = 0; index < list.length; index++) {
            if (offset && offset != index) continue;
            if (offset && offset >= index) buffer[index] = list[index];
            else if (offset == null) buffer[index] = list[index];
        }
    }


    static writeListInBuffer(buffer, list) {
        for (let index = 0; index < list.length; index++) buffer[index] = list[index];
    }
}


module.exports = SuperBuffer;