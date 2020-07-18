const compose = require("./compose.js");
const path = require("./path.js");
const pipe = require("./pipe.js");
const setValue = require("./setValue.js");
const setProperty = require("./setProperty.js");
const deepCopy = require("./deepCopy.js");
const trimEnd = require("./trimEnd.js");

module.exports = Object.freeze({
    compose,
    path,
    setValue,
    setProperty,
    deepCopy,
    pipe,
    trimEnd
});
