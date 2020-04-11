const { remote, shell } = require("electron");
const Prism = require("prismjs");
const flyd = require("flyd");
const path = require("path");
const { ComponentMenu } = require("./components/menu/index.js");
const { ComponentDragAndDrop } = require("./components/drag-and-drop/index.js");
const { ComponentFooter } = require("./components/footer/index.js");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();
// DOM
const inputJSON = document.querySelector("#inputJSON");
// Streams
const applicationTitleStream = flyd.stream("JSON-YAE");
const inputJSONStream = flyd.stream();
ComponentDragAndDrop({ shell }, { inputJSONStream });
// Components
ComponentMenu({ mainProcess, shell, currentWindow }, { applicationTitleStream, inputJSONStream });
ComponentDragAndDrop({ shell }, { inputJSONStream });
ComponentFooter({}, { inputJSONStream });
inputJSON.addEventListener("input", (e) => inputJSONStream(e.target.value));
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
