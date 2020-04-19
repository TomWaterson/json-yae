const flyd = require("flyd");
const validator = require("./../../validator/index.js");

const ComponentFooter = (_, dependantStreams) => {
    let {
        inputJSONStream
    } = dependantStreams || {};

    document.addEventListener("DOMContentLoaded", function() {
        const btnValidate = document.querySelector("#btnValidate");
        const btnValidateSchema = document.querySelector("#btnValidateSchema");

        const isSchemaValidStream = flyd.map((x) => validator.schema.validateSchema(null, x), inputJSONStream);
        const isJSONValidStream = flyd.map((x) => validator.input.validate(x), inputJSONStream);

        flyd.on((isSchemaValid) => {
            if (isSchemaValid !== true) {
                btnValidateSchema.disabled = "disabled";
            } else {
                btnValidateSchema.disabled = false;
            }
        }, isSchemaValidStream);

        flyd.on((isJSONValid) => {
            if (!isJSONValid) {
                btnValidate.disabled = "disabled";
            } else {
                btnValidate.disabled = false;
            }
        }, isJSONValidStream);
    });
};

module.exports = { ComponentFooter };
