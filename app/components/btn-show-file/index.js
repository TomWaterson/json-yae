const flyd = require("flyd");

const BtnShowFile = (application, dependantStreams) => {
    const { shell } = application;
    const { titleFilePathStream } = dependantStreams;
    const btnShow = document.querySelector("#btnShow");
    const buttonShowStream = flyd.stream();
    btnShow.addEventListener("click", buttonShowStream);

    flyd.on(() => {
        if (!titleFilePathStream()) {
            alert("Error showing button, there is no file path");
        } else {
            shell.showItemInFolder(titleFilePathStream());
        }
    }, buttonShowStream);

    flyd.on((titleFilePath) => {
        btnShow.disabled = titleFilePath ? false : "disabled";
    }, titleFilePathStream);
};

module.exports = { BtnShowFile };
