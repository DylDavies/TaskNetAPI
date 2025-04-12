import { root } from "../../src/admin/router";

describe("admin routes", () => {
    test("admin root user uid", () => {
        const req = { userUId: "testuseruid" };
        const res = { send: jest.fn() };

        // @ts-ignore
        root(req, res);

        expect(res.send.mock.calls[0][0]).toBe(req.userUId);
    });
});