class Switching {
    /* A private variable. */
    _state = false;

    /**
     * `this._state = !this._state`
     * 
     * This is a ternary operator. It's a shorthand way of writing an if/else statement. 
     * 
     * The first part of the ternary operator is the condition. In this case, it's `!this._state`. This
     * is a boolean expression. It's saying "if this._state is not true, then do the following". 
     * 
     * The second part of the ternary operator is the "then" part. In this case, it's `this._state`.
     * This is saying "if the condition is true, then set this._state to true". 
     * 
     * The third part of the ternary operator is the "else" part. In this case, it's `!this._state`.
     * This is saying "if the condition is false, then set this._state to false". 
     * 
     * So
     * @returns The value of the _state property.
     */
    static trigger(){
       return this._state = !this._state;
    }

    
    /**
     * This function sets the state of the object to the state passed in as an argument.
     * @param state - The state of the component.
     */
    static setState(state){
        if (typeof state  !== 'boolean') throw new TypeError('State must be a boolean');
        this._state = state;
        return this;
    }
    

    /**
     * The state property is a getter function that returns the value of the _state property.
     * @returns The state of the class.
     */
    static get state(){
        return this._state;
    }
}

module.exports = Switching;