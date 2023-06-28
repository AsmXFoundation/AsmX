class NeuralNetwork {
    static coincidence(list, matches) {
        let coincidences = [];
        if (typeof matches === 'string' || typeof matches === 'number') matches = [matches];
        list = [...new Set(list)];
        matches = [...new Set(matches)];

        for (let index = 0; index < list.length; index++) {
            const listItem = list[index];

            for (let index = 0; index < matches.length; index++) {
                let match = matches[index];
                
                for (let idx = 0; idx < match.length; idx++) {
                    const matchWord = match[idx];
                    if (new RegExp(`[${listItem.split('|')}]`).test(matchWord)) {
                        if (!Reflect.ownKeys(coincidences).includes(listItem)) coincidences[listItem] = 0;
                        coincidences[listItem] += 1;
                    }
                }
            }
        }

        return coincidences || [];
    }


    static presumably(list, matches) {
        let presumably = [];
        let ints = [];

        if (matches == undefined) {
            if (typeof list == 'object') {
                for (const property of Reflect.ownKeys(list).filter(prop => prop != 'length')) ints.push(list[property]);
            }

            Array.isArray(list) && list.map(item => {
                typeof item == 'object' && ints.push(item[Reflect.ownKeys(item)[0]])
            });

            ints = [...new Set(ints)];
            ints.sort((a, b) => a - b);
            
            if (ints.length == 2) {
                if (!ints.includes(1)) {
                    if (typeof list == 'object')
                        for (const property of Reflect.ownKeys(list).filter(prop => prop != 'length')) presumably.push(property);
                    else
                        presumably = list;
                } else {
                    if (typeof list == 'object')
                    for (const property of Reflect.ownKeys(list).filter(prop => prop != 'length')) list[property] != 1 && presumably.push(property);
                }
            } else {
                const numberList = ints.slice(Math.ceil(ints.length / 2) - 1);

                if (typeof list == 'object')
                for (const property of Reflect.ownKeys(list).filter(prop => prop != 'length')) numberList.includes(list[property]) && presumably.push(property);
            }
        }

        return presumably || [];
    }
}


module.exports = NeuralNetwork;