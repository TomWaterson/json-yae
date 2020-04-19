const flyd = require("flyd");
const { toHTML } = require("../../json-views/index.js");

const ComponentTabs = (_, dependantStreams) => {
    let {
        inputJSONStream
    } = dependantStreams || {};

    document.addEventListener("DOMContentLoaded", function() {
        const textViewStream = flyd.stream();
        const listViewStream = flyd.stream();
        const htmlStream = flyd.map(toHTML, inputJSONStream);
        const btnTextView = document.querySelector("#btnTextView");
        const btnListView = document.querySelector("#btnListView");
        const inputJSON = document.querySelector("#inputJSON");
        const listJSON = document.querySelector("#listJSON");

        btnListView.addEventListener("click", listViewStream);
        btnTextView.addEventListener("click", textViewStream);

        flyd.on(() => {
            // set tab
            btnTextView.classList.add("tab--active");
            btnListView.classList.remove("tab--active");

            // Set view
            inputJSON.classList.remove("hidden");
            listJSON.classList.add("hidden");
        }, textViewStream);

        flyd.on(() => {
            // set tab
            btnListView.classList.add("tab--active");
            btnTextView.classList.remove("tab--active");

            // Set view
            inputJSON.classList.add("hidden");
            listJSON.classList.remove("hidden");
            listJSON.innerHTML = htmlStream();
        }, listViewStream);
    });
};

module.exports = { ComponentTabs };
