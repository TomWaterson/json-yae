const pipe = require("../pipe.js");

describe("Compose", () => {
    it("should return a function", () => {
        // arrange
        let add = (a) => (b) => a + b;
        let multiply = (a) => (b) => a * b;
        // act
        let result = pipe(add(7), multiply(3));
        // assert
        expect(typeof result).toBe("function");
    })
    it("make 'a(b(c))' as 'pipe(b, a)(c)'", () => {
        // arrange
        let add = (a) => (b) => a + b;
        let multiply = (a) => (b) => a * b;
        // act
        let result = pipe([
            add(7),
            multiply(3)
        ]);
        // assert
        expect(result(3)).toBe(30);
    });
});
