import { authenticateUser } from "../../src/middleware/authenticateUser"; // wherever your file is
import admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

declare module 'express-serve-static-core' {
    interface Request {
        userUId?: string;
    }
}

jest.mock("firebase-admin", () => {
    const authMock = jest.fn();

    return {
        auth: authMock,
    
        credential: {
            cert: jest.fn()
        },
    
        initializeApp: jest.fn(() => ({
            auth: authMock
        }))
    }
});

describe("authenticateUser middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { cookies: {} };
        res = {
            sendStatus: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    it("should 401 if no session cookie is present", async () => {
        await authenticateUser(req as Request, res as Response, next);

        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("should 401 if session cookie is invalid", async () => {
        req.cookies = { __session: "invalidcookie" };
        const verifySessionCookieMock = jest.fn().mockRejectedValue(new Error("Invalid"));

        (admin.auth as jest.Mock).mockReturnValue({
            verifySessionCookie: verifySessionCookieMock
        });

        await authenticateUser(req as Request, res as Response, next);

        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("should set req.userUId and call next if valid session", async () => {
        req.cookies = { __session: "validcookie" };
        const verifySessionCookieMock = jest.fn().mockResolvedValue({ uid: "testUId" });

        (admin.auth as jest.Mock).mockReturnValue({
            verifySessionCookie: verifySessionCookieMock
        });

        await authenticateUser(req as Request, res as Response, next);

        expect(req.userUId).toBe("testUId");
        expect(next).toHaveBeenCalled();
    });
});