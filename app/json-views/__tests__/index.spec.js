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
        expect(toHTML(JSON.stringify(json))).toBe(`<ul class="list-tree select-none"><li data-meta="string" class="item ml-6">
                <span class="property">hello</span>
                <span class="value">world</span>
            </li></ul>`);
    });
});
