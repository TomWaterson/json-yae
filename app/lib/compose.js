const compose = (a,b) => (c) => a(b(c));

module.exports = compose;
