const { remote, shell } = require("electron");
const flyd = require("flyd");
const path = require("path");
const { toHTML } = require("./json-views/index.js");

const { ComponentApplicationTitle } = require("./components/application-title/index.js");
const { ComponentDragAndDrop } = require("./components/drag-and-drop/index.js");
const { ComponentSchemaButtons } = require("./components/schema-buttons/index.js");
const { ComponentSchemaErrors } = require("./components/schema-errors/index.js");
const { ComponentTabs } = require("./components/tabs/index.js");
const { FormUpdate } = require("./components/form-update/index.js");
const { TextArea } = require("./components/text-area/index.js");
const { BtnLoadSchema } = require("./components/btn-load-schema/index.js");
const { BtnShowFile } = require("./components/btn-show-file/index.js");
const { BtnOpenFile } = require("./components/btn-open-file/index.js");
const { BtnSaveFile } = require("./components/btn-save-file/index.js");
const { BtnShowInDefaultApplication } = require("./components/btn-show-default-application/index.js");
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
const openFilePressed = flyd.stream();
const isEditedStream = flyd.stream(false);
const btnLoadSchemaStream = flyd.stream();
const schemaJSONStream = flyd.stream(null);
const titleFilePathStream = flyd.stream(null);
const initialContentStream = flyd.stream("");
const htmlStream = flyd.map(toHTML, inputJSONStream);

const isSchemaValidStream = flyd.map((x) => validator.schema.validateSchema(schemaJSONStream(), x), inputJSONStream);
const isJSONValidStream = flyd.map((x) => validator.input.validate(x), inputJSONStream);
// Components
ComponentDragAndDrop({ shell }, {
    inputJSONStream
});
ComponentApplicationTitle({ shell, currentWindow }, {
    applicationTitleStream,
    isEditedStream,
    titleFilePathStream
});
ComponentDragAndDrop({ shell }, {
    inputJSONStream
});
ComponentSchemaButtons({}, {
    inputJSONStream,
    schemaJSONStream,
    isSchemaValidStream,
    isJSONValidStream
});
ComponentTabs({}, {
    inputJSONStream,
    htmlStream
});
ComponentSchemaErrors({}, {
    schemaJSONStream,
    isSchemaValidStream
});
FormUpdate({}, {
    updateJSONStream,
    listJSONStream,
    inputJSONStream,
    objPathStream,
    htmlStream
});
TextArea({}, {
    inputJSONStream
});
BtnShowFile({ shell }, { titleFilePathStream });
BtnOpenFile({ mainProcess }, {
    openFilePressed,
    inputJSONStream,
    initialContentStream,
    titleFilePathStream
});
BtnLoadSchema({ mainProcess }, {
    schemaJSONStream,
    btnLoadSchemaStream
});
BtnSaveFile({ currentWindow }, {
    inputJSONStream,
    initialContentStream,
    titleFilePathStream
});
BtnShowInDefaultApplication({ shell }, {
    titleFilePathStream
});
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
