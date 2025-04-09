import { root } from "../src/auth/router";

describe("auth routes", () => {
    test("auth root", () => {
        const req = {};
        const res = { send: jest.fn() };

        // @ts-ignore
        root(req, res);

        expect(res.send.mock.calls[0][0]).toBe("auth root");
    });
});