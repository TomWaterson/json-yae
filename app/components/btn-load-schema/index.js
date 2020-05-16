const flyd = require("flyd");
const fs = require("fs");

const BtnLoadSchema = (application, dependantStreams) => {
    const {
        mainProcess
    } = application;
    const {
        schemaJSONStream,
        btnLoadSchemaStream
    } = dependantStreams;

    const btnLoadSchema = document.querySelector("#btnLoadSchema");
    btnLoadSchema.addEventListener("click", btnLoadSchemaStream);

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
