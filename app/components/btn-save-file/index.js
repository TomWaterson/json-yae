const flyd = require("flyd");
const fs = require("fs");
const path = require("path");

const BtnSaveFile = (application, dependantStreams) => {
    const {
        currentWindow,
        mainProcess
    } = application;
    const {
        inputJSONStream,
        initialContentStream,
        titleFilePathStream,
        isEditedStream
    } = dependantStreams;
    const btnSave = document.querySelector("#btnSave");
    const buttonSaveStream = flyd.stream();
    btnSave.addEventListener("click", buttonSaveStream);

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

    flyd.on((disableSaveButton) => {
        btnSave.disabled = disableSaveButton ? false : "disabled";
        currentWindow.setDocumentEdited(disableSaveButton);
    }, isEditedStream);

    flyd.on(() => {
        saveFile(titleFilePathStream(), inputJSONStream());
        initialContentStream(inputJSONStream());
        try {
            currentWindow.setRepresentedFilename(titleFilePathStream());
            currentWindow.setTitle(path.basename(titleFilePathStream()));
        } catch (e) {
            // TODO add proper logging
            return e;
        }
    }, buttonSaveStream);
};

module.exports = { BtnSaveFile };
