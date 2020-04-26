const flyd = require("flyd");

const ComponentSchemaButtons = (_, dependantStreams) => {
    let {
        isSchemaValidStream,
        isJSONValidStream
    } = dependantStreams || {};

    document.addEventListener("DOMContentLoaded", function() {
        const btnValidate = document.querySelector("#btnValidate");
        const btnValidateSchema = document.querySelector("#btnValidateSchema");

        flyd.on((isSchemaValid) => {
            if (isSchemaValid === true) {
                btnValidateSchema.classList.remove("bg-red-500");
                btnValidateSchema.classList.add("bg-green-500");
            } else {
                btnValidateSchema.classList.remove("bg-green-500");
                btnValidateSchema.classList.add("bg-red-500");
            }
        }, isSchemaValidStream);

        flyd.on((isJSONValid) => {
            if (isJSONValid) {
                btnValidate.classList.remove("bg-red-500");
                btnValidate.classList.add("bg-green-500");
            } else {
                btnValidate.classList.remove("bg-green-500");
                btnValidate.classList.add("bg-red-500");
            }
        }, isJSONValidStream);
    });
};

module.exports = { ComponentSchemaButtons };
