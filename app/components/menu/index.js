const fs = require("fs");
const flyd = require("flyd");
const path = require("path");

const ComponentMenu = (application, dependantStreams) => {
    let {
        inputJSONStream,
        applicationTitleStream
    } = dependantStreams || {};
    let {
        mainProcess,
        shell,
        currentWindow
    } = application;
    document.addEventListener("DOMContentLoaded", function() {
        const isEditedStream = flyd.stream(false);
        const initialContentStream = flyd.stream("");

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

        const btnShow = document.querySelector("#btnShow");
        const btnOpen = document.querySelector("#btnOpen");
        const btnSave = document.querySelector("#btnSave");
        const btnDefaultApplication = document.querySelector("#btnDefaultApplication");

        const titleFilePathStream = flyd.stream(null);
        const buttonShowStream = flyd.stream();
        const buttonSaveStream = flyd.stream();
        const openFilePressed = flyd.stream();
        const buttonDefaultApplicationStream = flyd.stream();

        btnShow.addEventListener("click", buttonShowStream);
        btnSave.addEventListener("click", buttonSaveStream);
        btnOpen.addEventListener("click", openFilePressed);
        btnDefaultApplication.addEventListener("click", buttonDefaultApplicationStream);

        // Because it is curried the consumer can pass in the data
        const disableSaveButtonStream = flyd.combine((inputJSON, initialContent) => {
            return inputJSON() !== initialContent();
        }, [inputJSONStream, initialContentStream]);

        flyd.on((disableSaveButton) => {
            btnSave.disabled = disableSaveButton ? false : "disabled";
            currentWindow.setDocumentEdited(disableSaveButton);
        }, disableSaveButtonStream);


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
    });
};

module.exports = { ComponentMenu };
