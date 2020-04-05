const Ajv = require("ajv");
var ajv = new Ajv();

const validateSchema = (schema, data) => {
    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "http://example.com/product.schema.json",
        "title": "Product",
        "description": "A basic schema",
        "type": "object",
        "properties": {
            "productId": {
                "description": "The unique identifier for a product",
                "type": "integer"
            }
        },
        "required": [ "productId" ]
    };

    let validate = ajv.compile(schema);
    try {
        let valid = validate(JSON.parse(data));
        if (!valid) {
            return validate.errors;
        } else {
            return [];
        }
    } catch (e) {
        return false;
    }
};

module.exports = {
    validateSchema
};
