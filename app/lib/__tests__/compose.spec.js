const compose = require("../compose.js");

describe("Compose", () => {
    it("make 'a(b(c))' as 'compose(a,b)(c)'", () => {
        // arrange
        let a = (a) => a + 4;
        let b = (b) => b + 4;
        // act
        let c = compose(a,b);
        // assert
        expect(c(4)).toBe(12);
    });
});
