const { remote, shell } = require("electron");
const Prism = require("prismjs");
const flyd = require("flyd");
const path = require("path");
const validator = require("./validator/index.js");
const { ComponentMenu } = require("./components/menu/index.js");
const { ComponentDragAndDrop } = require("./components/drag-and-drop/index.js");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();

// DOM
const btnValidate = document.querySelector("#btnValidate");
const btnValidateSchema = document.querySelector("#btnValidateSchema");
const inputJSON = document.querySelector("#inputJSON");

// Streams
const applicationTitleStream = flyd.stream("JSON-YAE");
const inputJSONStream = flyd.stream();

// Components
ComponentMenu({ mainProcess, shell, currentWindow }, { applicationTitleStream, inputJSONStream });
ComponentDragAndDrop({ shell }, { inputJSONStream });

const isSchemaValid = flyd.map((x) => validator.schema.validateSchema(null, x), inputJSONStream);
const isJSONValid = flyd.map((x) => validator.input.validate(x), inputJSONStream);

inputJSON.addEventListener("input", (e) => inputJSONStream(e.target.value));

flyd.on((isValid) => {
    if (isValid !== true) {
        btnValidateSchema.disabled = "disabled";
    } else {
        btnValidateSchema.disabled = false;
    }
}, isSchemaValid);

flyd.on((isValid) => {
    if (!isValid) {
        btnValidate.disabled = "disabled";
    } else {
        btnValidate.disabled = false;
    }
}, isJSONValid);

// Side-effects
flyd.on((value) => {
    // Returns a highlighted HTML string
    const html = value ? Prism.highlight(value, Prism.languages.javascript, "javascript") : "";
    document.querySelector("#outputJSON").innerHTML = html;

    Prism.highlightAll();
}, inputJSONStream);

flyd.on((data) => {
    inputJSON.value = data;
}, inputJSONStream);

flyd.on((applicationTitle) => {
    currentWindow.setTitle(path.basename(applicationTitle));
}, applicationTitleStream);
