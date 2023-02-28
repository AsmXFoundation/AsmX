class Stack {
    constructor(list){
        this.list = list || [];
        this.size = this.list.length;

        /* Setting the stack pointer to 0x00. */
        this.sp = 0x00;
    }


    /**
     * The push() method adds one or more elements to the end of an array and returns the new length of
     * the array
     * @param item - The item to be pushed to the stack.
     */
    static push(item){
        this.list.push(item);
        this.sp++;
    }


    /**
     * The push() method adds one or more elements to the end of an array and returns the new length of
     * the array.
     * @param item - The item to be added to the list.
     */
    push(item){
        this.list.push(item);
        this.sp++;
    }


    /**
     * It removes the last element from the array.
     */
    static pop(){
        this.list.pop();
    }

    /**
     * The pop() method removes the last element from an array and returns that element. This method
     * changes the length of the array
     */
    pop(){
        this.list.pop();
    }


    /**
     * This function sets the stack pointer to the value of the stack pointer passed in.
     * @param stackPointer - The stack pointer to set.
     */
    static setStackPointer(stackPointer){
        this.sp = stackPointer;
    }


    /**
     * This function returns the value of the stack pointer.
     * @param stackPointer - The stack pointer to set.
     * @returns The value of the static variable sp.
     */
    static getStackPointer(){
        return this.sp;
    }


    /**
     * This function sets the stack pointer to the value of the stack pointer passed in
     * @param stackPointer - The address of the stack pointer.
     */
    setStackPointer(stackPointer){
        this.sp = stackPointer;
    }


    /**
     * It returns the value of the stack pointer.
     * @returns The value of the stack pointer.
     */
    getStackPointer(){
        return this.sp;
    }


    /**
     * This function shifts the stack pointer by the amount specified in the stackPointer parameter.
     * @param stackPointer - The amount to shift the stack pointer by.
     */
    static shiftStackPointer(stackPointer){
        this.sp += stackPointer;
    }


    /**
     * This function shifts the stack pointer by the amount specified in the stackPointer parameter.
     * @param stackPointer - The amount to shift the stack pointer by.
     */
    shiftStackPointer(stackPointer){
        this.sp += stackPointer;
    }
}


module.exports = Stack;