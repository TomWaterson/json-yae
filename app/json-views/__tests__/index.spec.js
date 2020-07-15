const { toHTML } = require("../index.js");

describe("Tree View", () => {
    it("toHTML should be defined", () => {
        // assert
        expect(toHTML).toBeDefined();
    });

    it("converts json to html", () => {
        let json = {
            hello: "world"
        };

        expect(toHTML(JSON.stringify(json))).not.toBe(null);
    });
    it("matches template", () => {
        let data = {
            foo: {
                bar: "baz"
            },
            hello: "world"
        };

        expect(toHTML(JSON.stringify(data))).toMatchSnapshot();
    });
});
