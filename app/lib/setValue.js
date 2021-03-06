const setValue = (sourceObject, keyPath, replacementValue, result = {}) => {
    let currentKeyToReplace = keyPath[0];

    for (const key in sourceObject) {
        if (typeof sourceObject[key] != "object") {
            if (key == currentKeyToReplace && keyPath.length == 1) {
                result[key] = replacementValue;
            } else {
                result[key] = sourceObject[key];
            }
        } else {
            result[key] = {};
            setValue(sourceObject[key], keyPath.slice(1), replacementValue, result[key]);
        }
    }
    return result;
};

module.exports = setValue;