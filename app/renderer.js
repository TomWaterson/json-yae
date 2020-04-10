const { remote, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const Prism = require("prismjs");
const flyd = require("flyd");
const validator = require("./validator/index.js");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();
// DOM
// Menu
const btnOpen = document.querySelector("#btnOpen");
const btnSave = document.querySelector("#btnSave");
const btnShow = document.querySelector("#btnShow");
const btnDefaultApplication = document.querySelector("#btnDefaultApplication");

// Errors
const errors = document.querySelector("#errors");

// JSON schema and Input
const btnValidate = document.querySelector("#btnValidate");
const btnValidateSchema = document.querySelector("#btnValidateSchema");
const inputSection = document.querySelector("#inputSection");
const inputJSON = document.querySelector("#inputJSON");

// State streams
const applicationTitleStream = flyd.stream("JSON-YAE");
const isEditedStream = flyd.stream(false);
const titleFilePathStream = flyd.stream(null);
const initialContentStream = flyd.stream("");

// Drag helpers
const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const isFileTypeSupported = (file) => ["text/plain", "application/json", "text/json"].includes(file.type);

const saveFile = (file, content) => {
    if (!file) {
        mainProcess.showSaveDialog().then((res) => {
            if (!res.canceled) {
                titleFilePathStream(res.filePath);
                fs.writeFileSync(res.filePath, content);
                inputJSONStream(content);
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

// Click streams
const buttonShowStream = flyd.stream();
const buttonSaveStream = flyd.stream();
const buttonDefaultApplicationStream = flyd.stream();
const openFilePressed = flyd.stream();

btnShow.addEventListener("click", buttonShowStream);
btnSave.addEventListener("click", buttonSaveStream);
btnOpen.addEventListener("click", openFilePressed);
btnDefaultApplication.addEventListener("click", buttonDefaultApplicationStream);

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
const disableSaveButtonStream = flyd.combine((inputJSON, initialContent) => {
    return inputJSON() !== initialContent();
}, [inputJSONStream, initialContentStream]);

flyd.on((disableSaveButton) => {
    btnSave.disabled = disableSaveButton ? false : "disabled";
    currentWindow.setDocumentEdited(disableSaveButton);
}, disableSaveButtonStream);

flyd.on((value) => {
    isEditedStream(value === initialContentStream() ? false : true);
    // Returns a highlighted HTML string
    const html = value ? Prism.highlight(value, Prism.languages.javascript, "javascript") : "";
    document.querySelector("#outputJSON").innerHTML = html;

    Prism.highlightAll();
}, inputJSONStream);

flyd.on((data) => {
    inputJSON.value = data;
}, inputJSONStream);

flyd.on(() => {
    if (!titleFilePathStream()) {
        alert("Error showing button, there is no file path");
    } else {
        shell.showItemInFolder(titleFilePathStream());
    }
}, buttonShowStream);

flyd.on(() => {
    saveFile(titleFilePathStream(), inputJSONStream());
    initialContentStream(inputJSONStream());
    currentWindow.setRepresentedFilename(titleFilePathStream());
    currentWindow.setTitle(path.basename(titleFilePathStream()));
}, buttonSaveStream);

flyd.on(() => {
    shell.openItem(titleFilePathStream());
}, buttonDefaultApplicationStream);

flyd.on(() => {
    mainProcess.getFileFromUser()
        .then(res => {
            const file = res.filePaths[0];
            fs.readFile(file, "utf8", (err, data) => {
                if (err) {
                    return null;
                }
                inputJSONStream(data);
                initialContentStream(data);
                titleFilePathStream(file);
            });
        }).catch(() => {
            console.log("error retrieving file");
        });
}, openFilePressed);

flyd.on((titleFilePath) => {
    if (titleFilePath) {
        titleFilePath = (`${titleFilePath} - ${applicationTitleStream()} ${isEditedStream() ? "(* Edited)" : ""}`);
        currentWindow.setRepresentedFilename(titleFilePath);
        currentWindow.setTitle(path.basename(titleFilePath));
    }

    btnShow.disabled = titleFilePath ? false : "disabled";
}, titleFilePathStream);

flyd.on((applicationTitle) => {
    currentWindow.setTitle(path.basename(applicationTitle));
}, applicationTitleStream);
