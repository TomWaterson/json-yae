const pipe = (fns) => (data) => fns.reduce((result, currentFunction) => {
    return currentFunction(result);
}, data);

module.exports = pipe;
