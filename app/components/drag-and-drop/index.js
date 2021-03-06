const flyd = require("flyd");
const fs = require("fs");
const _ = require("../../lib/index.js");
const ComponentDragAndDrop = (application, dependantStreams) => {
    let {
        shell
    } = application;
    let {
        appJSONStream
    } = dependantStreams;
    // Drag helpers
    const getDraggedFile = (event) => event.dataTransfer.items[0];
    const getDroppedFile = (event) => event.dataTransfer.files[0];
    const isFileTypeSupported = (file) => ["text/plain", "application/json", "text/json"].includes(file.type);
    // DOM
    const inputSection = document.querySelector("#inputSection");
    const errors = document.querySelector("#errors");
    // Drag Events
    document.addEventListener("dragstart", event => event.preventDefault());
    document.addEventListener("dragover", event => event.preventDefault());
    document.addEventListener("dragleave", event => event.preventDefault());
    document.addEventListener("drop", event => event.preventDefault());

    // Streams
    const inputSectionDropStream = flyd.stream();
    const inputSectionDragOverStream = flyd.stream();
    const inputSectionDragLeaveStream = flyd.stream();
    const dragOverFileTypeSupported = flyd.map(_.pipe([
        getDraggedFile,
        isFileTypeSupported
    ]), inputSectionDragOverStream);

    const inputSectionDropStreamContent = flyd.map((event) => {
        const droppedFile = getDroppedFile(event);

        return isFileTypeSupported(droppedFile) ? fs.readFileSync(droppedFile.path).toString() : null;
    }, inputSectionDropStream);

    inputSection.addEventListener("dragleave", inputSectionDragLeaveStream);
    inputSection.addEventListener("drop", inputSectionDropStream);
    inputSection.addEventListener("dragover", inputSectionDragOverStream);

    flyd.on(() => {
        errors.classList.add("hidden");
    }, inputSectionDragLeaveStream);

    flyd.on((supportedFileType) => {
        if (supportedFileType) {
            errors.classList.add("hidden");
        } else {
            errors.classList.remove("hidden");
        }
    }, dragOverFileTypeSupported);

    flyd.on((val) => {
        if (val !== null) {
            appJSONStream(val);
        } else {
            shell.beep();
        }
        inputSection.classList.remove("hidden");
    }, inputSectionDropStreamContent);
};

module.exports = { ComponentDragAndDrop };
