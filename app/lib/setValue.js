const setValue = (object, path, value) => {
    let fullPath = path.split(".");
    let way = fullPath.slice();
    let last = way.pop();

    way.reduce(function (result, currentKey) {
        return result[currentKey] = result[currentKey] || {};
    }, object)[last] = value;

    return object;
};

module.exports = setValue;
