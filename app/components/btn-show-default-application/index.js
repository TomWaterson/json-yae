const flyd = require("flyd");

const BtnShowInDefaultApplication = (application, dependantStreams) => {
    const { shell } = application;
    const { titleFilePathStream } = dependantStreams;
    const btnDefaultApplication = document.querySelector("#btnDefaultApplication");
    const buttonDefaultApplicationStream = flyd.stream();

    btnDefaultApplication.addEventListener("click", buttonDefaultApplicationStream);

    flyd.on(() => {
        shell.openItem(titleFilePathStream());
    }, buttonDefaultApplicationStream);

    flyd.on((titleFilePath) => {
        btnDefaultApplication.disabled = titleFilePath ? false : "disabled";
    }, titleFilePathStream);
};

module.exports = { BtnShowInDefaultApplication };
