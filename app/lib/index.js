const compose = require("./compose.js");
const path = require("./path.js");
const pipe = require("./pipe.js");
const setValue = require("./setValue.js");
const deepCopy = require("./deepCopy.js");

module.exports = Object.freeze({
    compose,
    path,
    setValue,
    deepCopy,
    pipe
});
