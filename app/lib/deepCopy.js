const deepCopy = (sourceObject, destinationObject) => {
    for (const key in sourceObject) {
        if(typeof sourceObject[key] != "object") {
            destinationObject[key] = sourceObject[key];
        } else {
            destinationObject[key] = {};
            deepCopy(sourceObject[key], destinationObject[key]);
        }
    }
    return destinationObject;
};

module.exports = deepCopy;
