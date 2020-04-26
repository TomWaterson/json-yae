# json-yae
An electron app designed for JSON editing with schema validation.

## Example schema

```
{
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
}
```
