const setProperty = (sourceObject, keyPath, replacementKey, result = {}) => {
    let currentKeyToReplace = keyPath[0];

    for (const key in sourceObject) {
        if (typeof sourceObject[key] != "object") {
            if (key == currentKeyToReplace && keyPath.length == 1) {
                result[replacementKey] = sourceObject[key];
            } else {
                result[key] = sourceObject[key];
            }
        } else {
            result[key] = {};
            setProperty(sourceObject[key], keyPath.slice(1), replacementKey, result[key]);
        }
    }

    return result;
};

module.exports = setProperty;