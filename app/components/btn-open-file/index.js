const flyd = require("flyd");
const fs = require("fs");

const BtnOpenFile = (application, dependantStreams) => {
    const {
        mainProcess
    } = application;

    const {
        openFilePressed,
        inputJSONStream,
        initialContentStream,
        titleFilePathStream
    } = dependantStreams;

    const btnOpen = document.querySelector("#btnOpen");
    btnOpen.addEventListener("click", openFilePressed);

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
};

module.exports = { BtnOpenFile };
