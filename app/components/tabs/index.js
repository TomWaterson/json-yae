const flyd = require("flyd");
const { toHTML } = require("../../json-views/index.js");

const ComponentTabs = (_, dependantStreams) => {
    let {
        appJSONStream
    } = dependantStreams || {};

    const textViewStream = flyd.stream();
    const listViewStream = flyd.stream();
    const htmlStream = flyd.map(toHTML, appJSONStream);

    const btnListView = document.querySelector("#btnListView");
    const listJSON = document.querySelector("#listJSON");

    btnListView.addEventListener("click", listViewStream);

    flyd.on(() => {
        // set tab
        btnListView.classList.remove("tab--active");

        // Set view
        listJSON.classList.add("hidden");
    }, textViewStream);

    flyd.on(() => {
        listJSON.innerHTML = htmlStream();
    }, htmlStream);

    flyd.on(() => {
        // set tab
        btnListView.classList.add("tab--active");
        // Set view
        listJSON.classList.remove("hidden");
        listJSON.innerHTML = htmlStream();
    }, listViewStream);
};

module.exports = { ComponentTabs };
