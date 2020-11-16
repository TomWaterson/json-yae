const flyd = require("flyd");
const fs = require("fs");
const { button } = require("hyperaxe");

const BtnLoadSchema = (application, dependantStreams) => {
    const {
        mainProcess
    } = application;
    const {
        schemaJSONStream
    } = dependantStreams;

    const btnLoadSchemaStream = flyd.stream();
    const templateNav = document.querySelector("#template-nav");

    templateNav.appendChild(
        button({
            className: "flex-initial m-1 btn btn-gray",
            id: "btnLoadSchema",
            onclick: btnLoadSchemaStream
        }, "Load JSON Schema")
    );

    flyd.on(() => {
        mainProcess.getFileFromUser()
            .then(res => {
                const file = res.filePaths[0];
                fs.readFile(file, "utf8", (err, data) => {
                    if (err) {
                        return null;
                    }
                    schemaJSONStream(data);
                });
            }).catch(() => {
                console.log("error retrieving schema");
            });
    }, btnLoadSchemaStream);
};

module.exports = { BtnLoadSchema };
