const setProperty = require("../setProperty.js");

describe("Set Property Function", () => {
    it("should return a function", () => {
        // arrange
        const before = {
            productId: 16,
            else : {
                cool: {
                    bar: "start"
                }
            }
        };

        const after = {
            productId: 16,
            else : {
                cool: {
                    foo: "start"
                }
            }
        };
        // act
        let result = setProperty(before, ["else", "cool", "bar"], "foo");
        // assert
        expect(result).toEqual(after);
        expect(before.else.cool.bar).toBe("start");
    });
});
