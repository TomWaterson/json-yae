const { remote, shell } = require("electron");
const Prism = require("prismjs");
const flyd = require("flyd");
const path = require("path");
const { ComponentMenu } = require("./components/menu/index.js");
const { ComponentDragAndDrop } = require("./components/drag-and-drop/index.js");
const { ComponentFooter } = require("./components/footer/index.js");
const { ComponentTabs } = require("./components/tabs/index.js");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();
// DOM
const inputJSON = document.querySelector("#inputJSON");
const listJSON = document.querySelector("#listJSON");
// Streams
const applicationTitleStream = flyd.stream("JSON-YAE");
const inputJSONStream = flyd.stream();
const listJSONStream = flyd.stream();

ComponentDragAndDrop({ shell }, { inputJSONStream });
// Components
ComponentMenu({ mainProcess, shell, currentWindow }, { applicationTitleStream, inputJSONStream });
ComponentDragAndDrop({ shell }, { inputJSONStream });
ComponentFooter({}, { inputJSONStream });
ComponentTabs({}, { inputJSONStream });

// Listeners
inputJSON.addEventListener("input", (e) => inputJSONStream(e.target.value));
listJSON.addEventListener("click", listJSONStream);
// Side-effects
flyd.on(event => {
    let el = event.target;
    if (el.classList) {
        let classes = el.classList.value.split(" ");

        if (classes.includes("collapsible")) {
            let parentEl = el.parentElement;
            let toHide = parentEl.querySelector(".nested");

            if (toHide) {
                if (toHide.classList.value.split(" ").includes("hidden")) {
                    toHide.classList.remove("hidden");
                } else {
                    toHide.classList.add("hidden");
                }
            }
        }
    }
}, listJSONStream);

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
