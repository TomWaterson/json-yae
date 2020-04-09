const { remote, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const Prism = require("prismjs");
const flyd = require("flyd");
const validator = require("./validator/index.js");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();

// DOM
const errors = document.querySelector("#errors");
const btnOpen = document.querySelector("#btnOpen");
const btnSave = document.querySelector("#btnSave");
const btnShow = document.querySelector("#btnShow");
const btnValidate = document.querySelector("#btnValidate");
const btnDefaultApplication = document.querySelector("#btnDefaultApplication");
const btnValidateSchema = document.querySelector("#btnValidateSchema");
const inputSection = document.querySelector("#inputSection");
const inputJSON = document.querySelector("#inputJSON");

let state = {
    fileName: null,
    isEdited: false,
    initialContent: "",
    titleFilePath: null
};

// const updateState = (x) => Object.assign({}, state, x);
// const stateStream = flyd.stream(state);

// Remove state object when streams are complete
const render = (state) => {
    let title = "JSON-YAE";

    if (state.titleFilePath) {
        title = `${state.titleFilePath} - ${title} ${state.isEdited ? "(* Edited)" : ""}`;
    }

    btnSave.disabled = state.isEdited ? false : "disabled";
    btnShow.disabled = state.titleFilePath ? false : "disabled";
    // For MACOS
    if (state.titleFilePath) {
        currentWindow.setRepresentedFilename(state.titleFilePath);
    }
    if (state.isEdited) {
        currentWindow.setDocumentEdited(state.isEdited);
    }
    currentWindow.setTitle(path.basename(title));
    Prism.highlightAll();
};

// Drag helpers
const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const isFileTypeSupported = (file) => ["text/plain", "application/json", "text/json"].includes(file.type);

const saveFile = (file, content) => {
    if (!file) {
        mainProcess.showSaveDialog().then((res) => {
            if (!res.canceled) {
                state.titleFilePath = res.filePath;
                fs.writeFileSync(res.filePath, content);
                render(state);
            }
        }).catch(() => {
            return null;
        });
    }

    if(!file) {
        return;
    } else {
        fs.writeFileSync(file, content);
    }
};
// Click events
btnShow.addEventListener("click", () => {
    if (!state.titleFilePath) {
        alert("Error showing button, there is no file path");
    } else {
        shell.showItemInFolder(state.titleFilePath);
    }
});

btnSave.addEventListener("click", () => {
    saveFile(state.titleFilePath, inputJSON.value);
    state.isEdited = false;

    render(state);
});

btnDefaultApplication.addEventListener("click", () => {
    shell.openItem(state.titleFilePath);
    render(state);
});

btnOpen.addEventListener("click", () => {
    mainProcess.getFileFromUser()
        .then(res => {
            const file = res.filePaths[0];
            fs.readFile(file, "utf8", (err, data) => {
                if (err) {
                    return null;
                }
                inputJSONStream(data);
                state.initialContent = data;
                state.titleFilePath = file;
                render(state);
            });
        }).catch(() => {
            console.log("error");
        });
});

const inputJSONStream = flyd.stream();
const inputSectionDragLeaveStream = flyd.stream();
const inputSectionDropStream = flyd.stream();
const inputSectionDragOverStream = flyd.stream();

const isSchemaValid = flyd.map((x) => validator.schema.validateSchema(null, x), inputJSONStream);
const isJSONValid = flyd.map((x) => validator.input.validate(x), inputJSONStream);

// TODO: improve readability with fn composition
const inputSectionDropStreamContent = flyd.map((event) => {
    const file = getDroppedFile(event);

    if (isFileTypeSupported(file)) {
        const content = fs.readFileSync(file.path).toString();
        return content;
    } else {
        return null;
    }
}, inputSectionDropStream);

const dragOverFileTypeSupported = flyd.map((event) => {
    const file = getDraggedFile(event);
    return isFileTypeSupported(file);
}, inputSectionDragOverStream);

// Drag Events
document.addEventListener("dragstart", event => event.preventDefault());
document.addEventListener("dragover", event => event.preventDefault());
document.addEventListener("dragleave", event => event.preventDefault());
document.addEventListener("drop", event => event.preventDefault());
inputSection.addEventListener("dragleave", inputSectionDragLeaveStream);
inputSection.addEventListener("drop", inputSectionDropStream);
inputSection.addEventListener("dragover", inputSectionDragOverStream);
inputJSON.addEventListener("input", (e) => inputJSONStream(e.target.value));

flyd.on((supportedFileType) => {
    if (supportedFileType) {
        errors.classList.add("hidden");
    } else {
        errors.classList.remove("hidden");
    }
}, dragOverFileTypeSupported);

flyd.on(() => {
    errors.classList.add("hidden");
}, inputSectionDragLeaveStream);

flyd.on((val) => {
    if (val !== null) {
        inputJSONStream(val);
    } else {
        shell.beep();
    }
    inputSection.classList.remove("hidden");
}, inputSectionDropStreamContent);

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
    state.isEdited = value === state.initialContent ? false : true;

    // Returns a highlighted HTML string
    const html = value ? Prism.highlight(value, Prism.languages.javascript, "javascript") : "";
    document.querySelector("#outputJSON").innerHTML = html;

    render(state);
}, inputJSONStream);

flyd.on((data) => {
    inputJSON.value = data;
}, inputJSONStream);
