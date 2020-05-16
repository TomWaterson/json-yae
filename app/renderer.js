const { remote, shell } = require("electron");
const flyd = require("flyd");
const path = require("path");
const { toHTML } = require("./json-views/index.js");

const { ComponentApplicationMenu } = require("./components/application-menu/index.js");
const { ComponentDragAndDrop } = require("./components/drag-and-drop/index.js");
const { ComponentSchemaButtons } = require("./components/schema-buttons/index.js");
const { ComponentSchemaErrors } = require("./components/schema-errors/index.js");
const { ComponentTabs } = require("./components/tabs/index.js");
const { FormUpdate } = require("./components/form-update/index.js");
const { TextArea } = require("./components/text-area/index.js");
const validator = require("./validator/index.js");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();
// DOM
const inputJSON = document.querySelector("#inputJSON");
const listJSON = document.querySelector("#listJSON");
const updateJSON = document.querySelector("#update-json");
// Streams
const applicationTitleStream = flyd.stream("JSON-YAE");
const inputJSONStream = flyd.stream();
const updateJSONStream = flyd.stream();
const objPathStream = flyd.stream();
const listJSONStream = flyd.stream();
const schemaJSONStream = flyd.stream(null);
const htmlStream = flyd.map(toHTML, inputJSONStream);

const isSchemaValidStream = flyd.map((x) => validator.schema.validateSchema(schemaJSONStream(), x), inputJSONStream);
const isJSONValidStream = flyd.map((x) => validator.input.validate(x), inputJSONStream);
// Components
ComponentDragAndDrop({ shell }, { inputJSONStream });
ComponentApplicationMenu({ mainProcess, shell, currentWindow }, { applicationTitleStream, inputJSONStream, schemaJSONStream });
ComponentDragAndDrop({ shell }, { inputJSONStream });
ComponentSchemaButtons({}, { inputJSONStream, schemaJSONStream, isSchemaValidStream, isJSONValidStream });
ComponentTabs({}, { inputJSONStream, htmlStream  });
ComponentSchemaErrors({}, { schemaJSONStream, isSchemaValidStream });
FormUpdate({}, { updateJSONStream, listJSONStream, inputJSONStream, objPathStream, htmlStream });
TextArea({}, { inputJSONStream });
// Listeners
inputJSON.addEventListener("input", (e) => inputJSONStream(e.target.value));
listJSON.addEventListener("click", listJSONStream);
updateJSON.addEventListener("click", updateJSONStream);

flyd.on((data) => {
    inputJSON.value = data;
}, inputJSONStream);

flyd.on((applicationTitle) => {
    currentWindow.setTitle(path.basename(applicationTitle));
}, applicationTitleStream);
