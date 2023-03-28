const os = require('os');

class KernelOS {
    static {
        this.datalist = [
            {
                register: '$date',
                prototype: [
                    {
                        property: 'time',
                        data: new Date().toLocaleString()
                    },

                    {
                        property: 'year',
                        data: new Date().getFullYear()
                    },

                    {
                        property: 'month',
                        data: new Date().getMonth()
                    },

                    {
                        property: 'day',
                        data: new Date().getDay()
                    },

                    {
                        property: 'hour',
                        data: new Date().getHours()
                    },

                    {
                        property: 'minute',
                        data: new Date().getMinutes()
                    },

                    {
                        property: 'seconds',
                        data: new Date().getSeconds()
                    },

                    {
                        property: 'milliseconds',
                        data: new Date().getMilliseconds()
                    }
                ]
            },

            {
                register: '$kernel',
                prototype: [
                    {
                        property: 'arch',
                        data: 'AsmX'
                    },

                    {
                        property: 'version',
                        data: 'v1.0'
                    }
                ]
            },

            {
                register: '$os',
                prototype: [
                    {
                        property: 'arch',
                        data: os.arch()
                    },

                    {
                        property: 'version',
                        data: os.version()
                    }
                ]
            }
        ]
    }
}


KernelOS.datalist.forEach(list => {
    console.log(list.prototype);
});