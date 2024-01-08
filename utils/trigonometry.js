class Trigonometry {
    /**
     * Calculates the sine of a number.
     * @param {number} x - The input number in radians.
     * @returns {number} The sine value of the input number.
     */
    static sin(x) {
        let result = 0;
        let term = x;

        for (let n = 1; n <= 10; n++) {
            result += term;
            term *= -x * x / ((2 * n) * (2 * n + 1));
        }

        return result;
    }


    /**
     * Calculates the cosine of a number.
     * @param {number} x - The input number in radians.
     * @returns {number} The cosine value of the input number.
     */
    static cos(x) {
        let result = 0;
        let term = 1;

        for (let n = 0; n <= 10; n++) {
            result += term;
            term *= -x * x / ((2 * n + 2) * (2 * n + 1));
        }

        return result;
    }


    /**
     * Returns the tangent of a given angle.
     * 
     * @param {number} x - The angle in radians.
     * @returns {number} The tangent of the angle.
     */
    static tan(x) {
        return Trigonometry.sin(x) / Trigonometry.cos(x);
    }


    /**
     * Returns the cotangent of an angle in degrees.
     * @param {number} x - The angle in degrees.
     * @returns {number} The cotangent of the angle.
     */
    static ctg(x) {
        // Convert the angle from degrees to radians
        const radians = x * Math.PI / 180;

        // Calculate the cotangent using the Math.tan function
        const cotangent = 1 / Math.tan(radians);

        return cotangent;
    }


    /**
     * Returns the secant of an angle in degrees.
     * @param {number} x - The angle in degrees.
     * @returns {number} The secant of the angle.
     */
    static sec(x) {
        x = x * Math.PI / 180;
        return 1 / this.cos(x);
    }
    
    
    /**
     * Returns the cosecant of an angle in degrees.
     * @param {number} x - The angle in degrees.
     * @returns {number} The cosecant of the angle.
     */
    static cosec(x) {
        x = x * Math.PI / 180;
        return 1 / this.sin(x);
    }


    /**
     * Returns the arcsine of a given value.
     * 
     * @param {number} x - The value.
     * @returns {number} The arcsine of the value.
     */
    static asin(x) {
        let result = x;
        let term = x;

        for (let n = 1; n <= 10; n++) {
            term *= (x * x * (2 * n - 1) * (2 * n - 1)) / ((2 * n) * (2 * n + 1));
            result += term;
        }

        return result;
    }


    /**
     * Returns the arc cosine of a number.
     * @param {number} x - The number to calculate the arc cosine of.
     * @returns {number} - The arc cosine of the given number.
     */
    static acos(x) {
        return Math.PI / 2 - Trigonometry.asin(x);
    }


    /**
     * Returns the arc tangent of a number.
     * @param {number} x - The number to calculate the arc tangent of.
     * @returns {number} - The arc tangent of the given number.
     */
    static atan(x) {
        let result = x;
        let term = x;

        for (let n = 1; n <= 10; n++) {
            term *= -x * x;
            result += term / (2 * n + 1);
        }

        return result;
    }


    /**
     * Returns the arc cotangent of a number in degrees.
     * @param {number} x - The number to calculate the arc cotangent of.
     * @returns {number} The arc cotangent of the number in degrees.
     */
    static actg(x) {
        // Calculate the arc tangent of 1/x and convert it to degrees
        return this.atan(1 / x) * 180 / Math.PI;
    }


    /**
     * Returns the arcsecant of a number.
     * @param {number} x - The input number.
     * @returns {number} - The arcsecant value in degrees.
     */
    static asec(x) {
        return this.acos(1 / x) * 180 / Math.PI;
    }
    
    
    /**
     * Returns the arcosecant of a number.
     * @param {number} x - The input number.
     * @returns {number} - The arcosecant value in degrees.
     */
    static acosec(x) {
        return this.asin(1 / x) * 180 / Math.PI;
    }


    /**
     * Calculates the hyperbolic sine of a given number.
     * @param {number} x - The input number.
     * @returns {number} - The hyperbolic sine of the input number.
     */
    static sinh(x) {
        let result = x;
        let term = x;

        for (let n = 1; n <= 10; n++) {
            term *= x * x / ((2 * n) * (2 * n + 1));
            result += term;
        }

        return result;
    }


    /**
     * Calculates the hyperbolic cosine of a given number.
     * @param {number} x - The input number.
     * @returns {number} - The hyperbolic cosine of the input number.
     */
    static cosh(x) {
        let result = 1;
        let term = 1;

        for (let n = 1; n <= 10; n++) {
            term *= x * x / ((2 * n - 1) * (2 * n));
            result += term;
        }

        return result;
    }


    /**
     * Calculates the hyperbolic tangent of a number.
     * @param {number} x - The input number.
     * @returns {number} The hyperbolic tangent of the input number.
     */
    static tanh(x) {
        return Trigonometry.sinh(x) / Trigonometry.cosh(x);
    }


    /**
     * Returns the hyperbolic secant of a number.
     * @param {number} x - The input number.
     * @returns {number} The hyperbolic secant of the input number.
     */
    static sech(x) {
        return 2 / (Math.exp(x) + Math.exp(-x));
    }
    

    /**
     * Returns the hyperbolic cosecant of a number.
     * @param {number} x - The input number.
     * @returns {number} The hyperbolic cosecant of the input number.
     */
    static cosech(x) {
        return 2 / (Math.exp(x) - Math.exp(-x));
    }


    /**
     * Calculates the inverse hyperbolic sine of a number.
     * @param {number} x - The input number.
     * @returns {number} The inverse hyperbolic sine of the input number.
     */
    static asinh(x) {
        let result = x;
        let term = x;

        for (let n = 1; n <= 10; n++) {
            term *= (x * x * (2 * n - 1)) / ((2 * n) * (2 * n + 1));
            result += term;
        }

        return result;
    }


    /**
     * Returns the inverse hyperbolic cosine of a number.
     * @param {number} x - The number to calculate the inverse hyperbolic cosine of.
     * @returns {number} The inverse hyperbolic cosine of the given number.
     */
    static acosh(x) {
        return Math.log(x + Math.sqrt(x * x - 1));
    }


    /**
     * Returns the inverse hyperbolic tangent of a number.
     * @param {number} x - The number to calculate the inverse hyperbolic tangent of.
     * @returns {number} The inverse hyperbolic tangent of the given number.
     */
    static atanh(x) {
        return (Math.log(1 + x) - Math.log(1 - x)) / 2;
    }


    /**
     * Calculate the arcctghyperbolic of a number.
     * @param {number} x - The input number.
     * @returns {number} - The arcctghyperbolic value.
     */
    static actgh(x) {
        // Formula: arcctgh(x) = 0.5 * ln((x + 1) / (x - 1))
        return 0.5 * Math.log((x + 1) / (x - 1));
    }


    /**
     * Returns the inverse hyperbolic secant of a number.
     * @param {number} x - The input number.
     * @returns {number} - The inverse hyperbolic secant of the input number.
     */
    static arcsech(x) {
        return Math.log((1 + Math.sqrt(1 - x * x)) / x);
    }
    
    
    /**
     * Returns the inverse hyperbolic cosecant of a number.
     * @param {number} x - The input number.
     * @returns {number} - The inverse hyperbolic cosecant of the input number.
     */
    static arccosech(x) {
        return Math.log((1 + Math.sqrt(1 + x * x)) / x);
    }
}

module.exports = Trigonometry;