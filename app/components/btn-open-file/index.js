const flyd = require("flyd");
const fs = require("fs");
const { button } = require("hyperaxe");

const BtnOpenFile = (application, dependantStreams) => {
    const {
        mainProcess
    } = application;

    const {
        appJSONStream,
        initialContentStream,
        titleFilePathStream
    } = dependantStreams;

    const templateNav = document.querySelector("#template-nav");
    const openFilePressed = flyd.stream();

    templateNav.appendChild(
        button({
            className: "flex-initial m-1 btn btn-gray",
            id: "btnOpen",
            onclick: openFilePressed
        }, "Open File")
    );

    flyd.on(() => {
        mainProcess.getFileFromUser()
            .then(res => {
                const file = res.filePaths[0];
                fs.readFile(file, "utf8", (err, data) => {
                    if (err) {
                        return null;
                    }
                    appJSONStream(data);
                    initialContentStream(data);
                    titleFilePathStream(file);
                });
            }).catch(() => {
                console.log("error retrieving file");
            });
    }, openFilePressed);
};

module.exports = { BtnOpenFile };
