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

    flyd.on((titleFilePath) => {
        if (titleFilePath) {
            titleFilePath = (`${titleFilePath} - ${applicationTitleStream()} ${isEditedStream() ? "(* Edited)" : ""}`);
            currentWindow.setRepresentedFilename(titleFilePath);
            currentWindow.setTitle(path.basename(titleFilePath));
        }
    }, titleFilePathStream);
};

module.exports = { ComponentApplicationTitle };