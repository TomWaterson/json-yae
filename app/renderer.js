const { remote, shell } = require("electron");
const flyd = require("flyd");
const { toHTML } = require("./json-views/index.js");

const { ComponentApplicationTitle } = require("./components/application-title/index.js");
const { ComponentDragAndDrop } = require("./components/drag-and-drop/index.js");
const { ComponentSchemaButtons } = require("./components/schema-buttons/index.js");
const { ComponentSchemaErrors } = require("./components/schema-errors/index.js");
const { ComponentTabs } = require("./components/tabs/index.js");
const { FormUpdateValue } = require("./components/form-update-value/index.js");
const { FormUpdateProperty } = require("./components/form-update-property/index.js");
const { BtnLoadSchema } = require("./components/btn-load-schema/index.js");
const { BtnShowFile } = require("./components/btn-show-file/index.js");
const { BtnOpenFile } = require("./components/btn-open-file/index.js");
const { BtnSaveFile } = require("./components/btn-save-file/index.js");
const { BtnShowInDefaultApplication } = require("./components/btn-show-default-application/index.js");
const validator = require("./validator/index.js");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();
// Streams
const applicationTitleStream = flyd.stream("JSON-YAE");
const appJSONStream = flyd.stream(JSON.stringify({ hello: "world" }));
const openFilePressed = flyd.stream();
const btnLoadSchemaStream = flyd.stream();
const schemaJSONStream = flyd.stream(null);
const titleFilePathStream = flyd.stream(null);
const initialContentStream = flyd.stream("");
const htmlStream = flyd.map(toHTML, appJSONStream);
const isSchemaValidStream = flyd.map((x) => validator.schema.validateSchema(schemaJSONStream(), x), appJSONStream);
const isJSONValidStream = flyd.map((x) => validator.input.validate(x), appJSONStream);
const isEditedStream = flyd.combine((inputJSON, initialContent) => {
    return inputJSON() !== initialContent();
}, [appJSONStream, initialContentStream]);

const listJSONClickStream = flyd.stream();
const objPathStream = flyd.stream();
// Components
ComponentDragAndDrop({ shell }, {
    appJSONStream
});
ComponentApplicationTitle({ shell, currentWindow }, {
    applicationTitleStream,
    isEditedStream,
    titleFilePathStream
});
ComponentDragAndDrop({ shell }, {
    appJSONStream
});
ComponentSchemaButtons({}, {
    appJSONStream,
    schemaJSONStream,
    isSchemaValidStream,
    isJSONValidStream
});
ComponentTabs({}, {
    appJSONStream,
    htmlStream
});
ComponentSchemaErrors({}, {
    schemaJSONStream,
    isSchemaValidStream
});
FormUpdateValue({}, {
    appJSONStream,
    listJSONClickStream,
    objPathStream
});
FormUpdateProperty({}, {
    appJSONStream,
    listJSONClickStream,
    objPathStream
});
BtnShowFile({ shell }, {
    titleFilePathStream
});
BtnOpenFile({ mainProcess }, {
    openFilePressed,
    appJSONStream,
    initialContentStream,
    titleFilePathStream
});
BtnLoadSchema({ mainProcess }, {
    schemaJSONStream,
    btnLoadSchemaStream
});
BtnSaveFile({ currentWindow }, {
    appJSONStream,
    initialContentStream,
    titleFilePathStream,
    isEditedStream
});
BtnShowInDefaultApplication({ shell }, {
    titleFilePathStream
});
