const setValue = require("../setValue.js");

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
                    bar: "end"
                }
            }
        };
        // act
        let result = setValue(before, ["else", "cool", "bar"], "end");
        // assert
        expect(result).toEqual(after);
        expect(before.else.cool.bar).toBe("start");
    });
});
