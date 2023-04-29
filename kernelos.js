const os = require('os');

class KernelOS {
    static {
        this.datalist = {
            date:  {
                time: () => new Date().toLocaleString(),
                year: () =>  new Date().getFullYear(),
                month: () => new Date().getMonth(),
                day: () => new Date().getDay(),
                hour: () => new Date().getHours(),
                minute: () => new Date().getMinutes(),
                seconds: () => new Date().getSeconds(),
                milliseconds: () => new Date().getMilliseconds()
            },

            kernel: {
                arch: 'AsmX',
                version: 'v1.0'
            },

            os: {
                arch: os.arch(),
                version: os.version()
            }
        }
    }
}

module.exports = KernelOS;