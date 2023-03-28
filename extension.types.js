/* It converts a number to a string representation of the number multiplied by 2^1028 */
class Unit1028 {
    /**
     * It takes a number and multiplies it by 2^1028.
     * @param number - The number you want to convert to a string.
     * @returns A string representation of a bigint.
     */
    static convert(number) {
        const base = BigInt(2) ** 1028n;
        const result = BigInt(number) * base;
        return result.toString();
    }
}


/* It converts a number to a 128-bit integer. */
class Unit128 {
    /**
     * It takes a number and multiplies it by 2^128.
     * @param number - The number you want to convert to a 128-bit integer.
     * @returns A string representation of a bigint.
     */
    static convert(number) {
        const base = BigInt(2) ** 128n;
        const result = BigInt(number) * base;
        return result.toString();
    }
}


/* It converts a number to a string, and multiplies it by a base */
class UnitUser {
    /**
     * It takes a number and a bit, and returns a string representation of the number multiplied by 2 to the power of the bit.
     * @param number - The number you want to convert.
     * @param bit - The number of bits to convert to.
     * @returns A string.
     */
    static convert(number, bit) {
        const base = BigInt(2) ** bit;
        const result = BigInt(number) * base;
        return result.toString();
    }
}


module.exports = {
    Unit1028,
    Unit128,
    UnitUser
}