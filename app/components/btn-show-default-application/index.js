const flyd = require("flyd");
const { button } = require("hyperaxe");

const BtnShowInDefaultApplication = (application, dependantStreams) => {
    const templateNav = document.querySelector("#template-nav");
    const { shell } = application;
    const { titleFilePathStream } = dependantStreams;
    const buttonDefaultApplicationStream = flyd.stream();

    const view = (titleFilePath) => button({
        className: "flex-initial m-1 btn btn-gray",
        disabled: titleFilePath ? null : "disabled",
        id: "btnDefaultApplication",
        onclick: buttonDefaultApplicationStream
    }, "Show in default application");

    templateNav.appendChild(view(null));
    
    flyd.on(() => {
        shell.openItem(titleFilePathStream());
    }, buttonDefaultApplicationStream);

    flyd.on((titleFilePath) => {
        templateNav.replaceChild(
            view(titleFilePath),
            document.querySelector("#btnDefaultApplication")
        );
    }, titleFilePathStream);
};

module.exports = { BtnShowInDefaultApplication };
