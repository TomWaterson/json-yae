const path = require("../path.js");

describe("Path", () => {
    it("return property value at the path", () => {
        // arrange
        let obj = {
            path: {
                to: {
                    prop: "A dope value"
                }
            }
        };
        // act
        let a = path (["path", "to", "prop"]) (obj);
        // assert
        expect(a).toBe("A dope value");
    });

    it("return undefined if path does not exist", () => {
        // arrange
        let obj = {
            path: {
                to: {
                    prop: "A dope value"
                }
            }
        };
        // act
        let a = path (["path", "to", "x"]) (obj);
        let b = path (["path", "to", "prop", "x", "factor"]) (obj);
        // assert
        expect(a).toBe(undefined);
        expect(b).toBe(undefined);
    });

    it("return null if path value is null", () => {
        // arrange
        let obj = {
            path: {
                to: {
                    prop: null
                }
            }
        };
        // act
        let a = path (["path", "to", "prop"]) (obj);
        // assert
        expect(a).toBe(null);
    });
});
