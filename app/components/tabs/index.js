const flyd = require("flyd");
const { toHTML } = require("../../json-views/index.js");
const { div, nav, button } = require("hyperaxe");

const ComponentTabs = (_, dependantStreams) => {
    let {
        appJSONStream
    } = dependantStreams || {};

    const textViewStream = flyd.stream();
    const listViewStream = flyd.stream();
    const htmlStream = flyd.map(toHTML, appJSONStream);

    const listJSON = document.querySelector("#listJSON");

    const templateViewTabs = document.querySelector("#template-view-tabs");

    const view = ({ isActive }) => div({ id: "tab-navigation", classList: "bg-white my-2" },
        nav({ classList: "flex flex-col sm:flex-row" },
            button({ id: "btnListView", classList: `tab ${isActive ? "tab--active" : ""}`, onclick: listViewStream }, "List View")
        )
    );

    templateViewTabs.appendChild(view({ isActive: true }));

    flyd.on(() => {
        // set tab
        templateViewTabs.replaceChild(view({ isActive: false }), document.querySelector("tab-navigation"))

        // Set view
        listJSON.classList.add("hidden");
    }, textViewStream);

    flyd.on(() => {
        listJSON.innerHTML = htmlStream();
    }, htmlStream);

    flyd.on(() => {
        // set tab
        templateViewTabs.replaceChild(view({ isActive: true }), document.querySelector("tab-navigation"))
        // Set view
        listJSON.classList.remove("hidden");
        listJSON.innerHTML = htmlStream();
    }, listViewStream);
};

module.exports = { ComponentTabs };
