class Route {
    /**
     * @param startPoint - The starting point of the route.
     * @param endPoint - The end point of the route.
     */
    constructor(startPoint, endPoint){
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.pointers = [];
        this.livePointName = null;
        this.livePointAddress = null;
        this.islivePoint = false;
        this.value = null;
    }

    
    /**
     * This function takes two arguments, a point name and a point address, and adds them to the
     * pointers array.
     * @param pointName - The name of the point.
     * @param pointAddress - The address of the point.
     */
    static setPoint(pointName, pointAddress){
        this.pointers.push({ name: pointName, address: pointAddress });
        this.livePointName = pointName;
        this.livePointAddress = pointAddress;
        this.isLivePoint = true;
    }


    /**
     * This function takes two arguments, a point name and a point address, and adds them to the
     * pointers array.
     * @param pointName - The name of the point.
     * @param pointAddress - The address of the point.
     */
    setPoint(pointName, pointAddress){
        this.pointers.push({ name: pointName, address: pointAddress });
        this.livePointName = pointName;
        this.livePointAddress = pointAddress;
        this.isLivePoint = true;
    }
}

module.exports = Route;