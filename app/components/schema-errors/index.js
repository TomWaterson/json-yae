const flyd = require("flyd");

const ComponentSchemaErrors = (_, dependantStreams) => {
    const {
        isSchemaValidStream
    } = dependantStreams || {};

    const accordianSchemaErrors = document.querySelector("#accordian-schema-errors");
    const accordianContent = document.querySelector("#accordian-content");

    const schemaToHTML = error =>
        `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <div>Error: ${error.keyword}</div>
            <div>Fix: ${error.message}</div>
        </div>`;

    flyd.on((isSchemaValid) => {
        if (isSchemaValid !== true && isSchemaValid.length) {
            accordianSchemaErrors.classList.remove("hidden");
            accordianContent.innerHTML = isSchemaValid.map(schemaToHTML);
        } else {
            accordianSchemaErrors.classList.add("hidden");
        }
    }, isSchemaValidStream);
};

module.exports = { ComponentSchemaErrors };
