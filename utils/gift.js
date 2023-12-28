class Gift {
    static #isNewYearsEve() {
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();
        
        return month === 11 && [28, 29, 30, 31].includes(day); // December is month 11
    }
    
    static displaySurprise() {
        console.log("Surprise! Happy New Year's Eve! 🎉");
        console.log("Thank you for your support and enthusiasm!");
        console.log("Keep coding and making amazing things happen!");
        console.log("Best regards,");
        console.log("Founder & CEO of AsmX");
    }

    static get() {
        if (this.#isNewYearsEve()) {
            this.displaySurprise();
        }  else {
            console.log("No surprise today.");
        }
    }
}

module.exports = Gift;