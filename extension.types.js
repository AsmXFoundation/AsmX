function Uint16(unit16) {
    this.unit16 = unit16;
    return new Uint16Array(1).set(this.unit16);
}

function Uint32(unit32) {
    this.unit32 = unit32;
    return new Uint32Array(1).set(this.unit32);
}

module.exports = Uint16;
module.exports = Uint32;