class Memory {
    constructor(){
        this.memory = new Map();
        this.listeners = [];
        /* The size of the memory. */
        const LIMITERS_MEMORY_BYTES = 4056;
        this.defaultCellAddress = 0x00;
        /* Creating a new array with the size of the memory. */
        const privateMemory = new Uint32Array(LIMITERS_MEMORY_BYTES);

        /* Looping through the memory array and pushing the value of the cell to the privateMemory array. */
        for (let index = 0; index < LIMITERS_MEMORY_BYTES.length; index++) {
            const cell = this.memory[index][1];
            privateMemory.push(cell);
        }
    }   
    

    /**
     * It adds a cell to the memory.
     * @param key - The address of the cell.
     * @param value - The value to be stored in the cell.
     */
    addCell(key, value) {
        this.memory.set(key || this.defaultCellAddress, value);
        this.defaultCellAddress++;
    }


    /**
     * It returns the cell and index of the cell that contains the value passed to it.
     * @param value - The value you want to find in the memory.
     * @returns An object with the cell and index of the cell that contains the value.
     */
    getCellByAddress(address) {
        return this.memory.get(address);
    }


    /**
     * If the value is in the memory, then for each cell in the memory, if the cell's value is equal to
     * the value, then return the cell and its index.
     * @param value - The value to search for
     * @returns An object with two properties: cell and index.
     */
    getCellByValue(value) {
        let cellRet = 0x00;

        if ([...this.memory.values()].includes(value)) {
            this.memory.forEach((cell, index) => {
                if (cell.value === value) cellRet = { cell: cell, index: index }
            })
        }

        return cellRet;
    }


    /**
     * The function removes a cell from the memory.
     * @param key - The key of the cell to remove.
     */
    removeCell(key) {
        this.memory.delete(key);
    }
}


class MemoryManager  extends Memory {
    /**
     * This function adds a listener to the listeners array, which is a property of the class.
     * @param typeEvent - The event type to listen for.
     * @param listener - The function that will be called when the event is triggered.
     */
    addMemoryListener(typeEvent, listener) {
        this.listeners.push({ [typeEvent]: listener });
    }
}


class MemoryAddress extends Memory {
    constructor() {
        super();
        this.address = new Map();
        this.addressDefaultValue = 0x00;
    }


    /**
     * If the value is true, set the address to the value, otherwise set the address to the default
     * value.
     * @param address - The address to set.
     * @param value - The value to set the address to.
     */
    setAddress(address, value) {
        value ? this.address.set(address, value) : this.address.set(this.addressDefaultValue, address);
        this.addressDefaultValue++;
    }


    /**
     * It takes a value and returns an object with the address and value of the cell that contains the
     * value.
     * @param value - The value you want to find in the table.
     * @returns The address of the cell and the value of the cell.
     */
    getCellByValue(value) {
        let ret = 0x00;

        this.address.forEach(cell => {
            if (cell == value) ret = { name: cell };
        });

        return ret;
    }


    /**
     * It returns the value of the address key in the address object.
     * @param address - The address of the contract.
     * @returns The address.get(address) method is being returned.
     */
    getAddress(address) {
        return this.address.get(address);
    }


    /**
     * It takes an address and returns an object with the address and value of that address.
     * @param address - The address of the contract.
     * @returns An object with two properties, address and value.
     */
    getAddressFormateToJson(address) {
        let addressGet = this.address.get(address);
        return { address: addressGet[0], value: addressGet[1] };
    }


    /**
    * The function returns the size of the address object.
    * @returns The size of the address.
    */
    get sizeof() {
        return this.address.size;
    }
}

class MemoryVariables {
    constructor(){
        this.memory = new Map();
        this.addressDefaultValue = 0x00;
    }


    /**
     * This function sets the cell to the value of the cell, and then increments the
     * addressDefaultValue by one.
     * @param cell - The cell to be added to the memory.
     */
    setCell(cell){
        this.cell = cell;
        this.memory.set(this.cell.address || this.addressDefaultValue, this.cell);
        this.addressDefaultValue++;
    }


    /**
     * This function returns the value of the cell at the address specified by the cellAddress
     * parameter, or the default address if no parameter is specified.
     * @param cellAddress - The address of the cell to get.
     * @returns The value of the cell at the address specified by the cellAddress parameter. If no
     * cellAddress is specified, the value of the cell at the default address is returned.
     */
    getCell(cellAddress){
        return this.memory.get(cellAddress || this.addressDefaultValue);
    }


    /**
     * It returns the key of the first element in the memory array that has the value passed to the
     * function
     * @param value - The value to search for.
     * @returns The key of the cell that contains the value.
     */
    getCellByValue(value){
       for (const [key, valueCell] of this.memory) if (valueCell.name === value) return this.memory.get(key);
    }
}


const memory = new Memory();
const memoryManager = new MemoryManager();
const memoryAddress = new MemoryAddress();
const memoryVariables = new MemoryVariables();

module.exports = {
    Memory: memory,
    MemoryManager: memoryManager,
    MemoryAddress: memoryAddress,
    MemoryVariables: memoryVariables
}