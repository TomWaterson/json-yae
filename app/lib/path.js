const path = (p) => (obj) => {
    if (!Array.isArray(p)) {
        throw "Expected Array got" + typeof p;
    }
    if (p.length < 1) {
        return undefined;
    }
    if (typeof obj[p[0]] === "object" && obj[p[0]] !== null) {
        return path (p.slice(1)) (obj[p[0]]);
    }
    if (p.length > 1) {
        return undefined;
    }
    return obj[p[0]];
};

module.exports = path;
