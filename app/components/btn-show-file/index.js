const flyd = require("flyd");
const { button } = require("hyperaxe");
const BtnShowFile = (application, dependantStreams) => {
    const { shell } = application;
    const { titleFilePathStream } = dependantStreams;
    const buttonShowFileStream = flyd.stream();
    const templateNav = document.querySelector("#template-nav");
    const view = (titleFilePath) => button({
        id: "btnShow",
        disabled: titleFilePath ? null : "disabled",
        onclick: buttonShowFileStream,
        className: "flex-initial m-1 btn btn-gray"
    }, "Show File");

    templateNav.appendChild(view(null));

    flyd.on(() => {
        if (!titleFilePathStream()) {
            alert("Error showing button, there is no file path");
        } else {
            shell.showItemInFolder(titleFilePathStream());
        }
    }, buttonShowFileStream);

    flyd.on((titleFilePath) => {
        templateNav.replaceChild(
            view(titleFilePath),
            document.querySelector("#btnShow")
        );
    }, titleFilePathStream);
};

module.exports = { BtnShowFile };
