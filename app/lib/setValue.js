const setValue = (object, path, value) => {
    var fullPath = path.split("."),
        way = fullPath.slice(),
        last = way.pop();

    way.reduce(function (r, a) {
        return r[a] = r[a] || {};
    }, object)[last] = value;

    return object;
};

module.exports = setValue;
