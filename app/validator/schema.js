const Ajv = require("ajv");
var ajv = new Ajv();

const validateSchema = (schema, data) => {
    try {
        let validate = ajv.compile(JSON.parse(schema));
        let valid = validate(JSON.parse(data));
        if (!valid) {
            return validate.errors;
        } else {
            return true;
        }
    } catch (e) {
        return false;
    }
};

module.exports = {
    validateSchema
};
