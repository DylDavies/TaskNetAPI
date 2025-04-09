import { root } from "../src/calls";

describe("root routes tests", () => {
    test("test root route", () => {
        const req = {};
        const res = { send: jest.fn() };

        // @ts-ignore
        root(req, res);

        expect( res.send.mock.calls[0][0] ).toBe("Hello Typescript Express!");
    });
});