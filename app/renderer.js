const { remote, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const Prism = require("prismjs");
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
// Streams


let state = {
    fileName: null,
    isEdited: false,
    initialContent: "",
    titleFilePath: null
};

// Render updates main renderer and this process
// { state } -> void
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

btnValidateSchema.addEventListener("click", () => {
    validator.schema.validateSchema(null, inputJSON.value);
});

inputJSON.addEventListener("input", (event) => {
    state.isEdited = event.target.value === state.initialContent ? false : true;
    // Returns a highlighted HTML string
    const html = Prism.highlight(event.target.value, Prism.languages.javascript, "javascript");
    document.querySelector("#outputJSON").innerHTML = html;

    render(state);
});

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
                inputJSON.value = data;
                state.initialContent = data;
                state.titleFilePath = file;
                render(state);
            });
        }).catch(() => {
            console.log("error");
        });
});

document.addEventListener("dragstart", event => event.preventDefault());
document.addEventListener("dragover", event => event.preventDefault());
document.addEventListener("dragleave", event => event.preventDefault());
document.addEventListener("drop", event => event.preventDefault());

// Drag helpers
const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const isFileTypeSupported = (file) => ["text/plain", "application/json", "text/json"].includes(file.type);

inputSection.addEventListener("dragover", (event) => {
    const file = getDraggedFile(event);
    if (isFileTypeSupported(file)) {
        errors.classList.add("hidden");
    } else {
        errors.classList.remove("hidden");
    }
});

// Streams should remove this
btnValidate.addEventListener("click", () => {
    let data = document.querySelector("#inputJSON").value;
    console.log(data);
    console.log(validator.input.validate(data));
});

inputSection.addEventListener("dragleave", () => {
    errors.classList.add("hidden");
});

inputSection.addEventListener("drop", (event) => {
    const file = getDroppedFile(event);

    if (isFileTypeSupported(file)) {
        const content = fs.readFileSync(file.path).toString();
        inputJSON.value = content;
    } else {
        shell.beep();
    }
    inputSection.classList.remove("hidden");
});
