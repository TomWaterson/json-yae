const flyd = require("flyd");
const fs = require("fs");
const path = require("path");
const { button } = require("hyperaxe");

const BtnSaveFile = (application, dependantStreams) => {
    const {
        currentWindow,
        mainProcess
    } = application;
    const {
        appJSONStream,
        initialContentStream,
        titleFilePathStream,
        isEditedStream
    } = dependantStreams;

    const templateNav = document.querySelector("#template-nav");
    const buttonSaveStream = flyd.stream();

    const btnSave = isEdited => button({
        className: "flex-initial m-1 btn btn-gray",
        id: "btnSave",
        onclick: buttonSaveStream,
        disabled: isEdited ? null : "disabled"
    }, "Save");

    templateNav.appendChild(btnSave(true));

    const saveFile = (file, content) => {
        appJSONStream(content);
        initialContentStream(appJSONStream());
        return !file ? mainProcess
            .showSaveDialog()
            .catch((error) => {
                return error;
            })
            : new Promise((res, rej) => {
                fs.writeFile(file, content, function(err) {
                    err ? rej(err) : res({ overwritten: true });
                });
            });
    };

    flyd.on((isEdited) => {
        templateNav.replaceChild(
            btnSave(isEdited), 
            document.querySelector("#btnSave")
        );
        currentWindow.setDocumentEdited(isEdited);
    }, isEditedStream);

    flyd.on(() => {
        saveFile(titleFilePathStream(), appJSONStream())
            .then(res => {
                if (res && !res.canceled && !res.overwritten) {
                    titleFilePathStream(res.filePath);
                    fs.writeFileSync(res.filePath, appJSONStream());
                }
            })
            .catch(error => error);
        
        try {
            currentWindow.setRepresentedFilename(titleFilePathStream());
            currentWindow.setTitle(path.basename(titleFilePathStream()));
        } catch (e) {
            // TODO add proper logging 
            // (find a free program or write an email implementation)
            return e;
        }
    }, buttonSaveStream);
};

module.exports = { BtnSaveFile };
