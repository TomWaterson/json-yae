const flyd = require("flyd");
const path = require("path");

const ComponentApplicationTitle = (application, dependantStreams) => {
    const {
        currentWindow
    } = application;

    const {
        applicationTitleStream,
        titleFilePathStream,
        isEditedStream
    } = dependantStreams || {};

    const isEditable = flyd.merge(titleFilePathStream, isEditedStream);

    flyd.on(() => {
        if (titleFilePathStream()) {
            let edited = isEditedStream() ? "(* Edited)" : "";
            let titleFilePath = (`${titleFilePathStream()} - ${applicationTitleStream()} ${edited}`);
            currentWindow.setRepresentedFilename(titleFilePath);
            currentWindow.setTitle(path.basename(titleFilePath));
        }
    }, isEditable);

    flyd.on((applicationTitle) => {
        currentWindow.setTitle(path.basename(applicationTitle));
    }, applicationTitleStream);
};

module.exports = { ComponentApplicationTitle };
