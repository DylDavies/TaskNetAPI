import { Auth } from "firebase-admin/auth";
import { login } from "../../src/auth/router";
import admin from "firebase-admin";

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

describe('Authentication tests', () => {
    it("should 400 reject on no authorization header", () => {
        let req = { headers: {} };
        let res = { sendStatus: jest.fn() };

        // @ts-ignore
        login(req, res);
        
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it("should 400 reject on no bearer authorization header", () => {
        let req = { headers: {'authorization': "Basic mocktoken"} };
        let res = { sendStatus: jest.fn() };

        // @ts-ignore
        login(req, res);
        
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it("should 400 reject on malformed bearer authorization header", () => {
        let req = { headers: {'authorization': "Bearer"} };
        let res = { sendStatus: jest.fn() };

        // @ts-ignore
        login(req, res);
        
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });


    it("should 401 reject on failing to verify id token", async () => {
        let req = { headers: {'authorization': "Bearer mocktoken"} };
        let res = { status: jest.fn(), send: jest.fn() };

        (res.status as jest.Mocked<any>).mockReturnValue(res);
        
        const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error("Invalid token"));
        (admin.auth as jest.Mock).mockReturnValue({
            verifyIdToken: mockVerifyIdToken
        });

        // @ts-ignore
        await login(req, res);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send.mock.calls[0][0].message).toBe("Invalid token");
    });

    it("should 200 accept with valid data", async () => {
        let req = { headers: {'authorization': "Bearer mocktoken"} };
        let res = { status: jest.fn(), send: jest.fn(), cookie: jest.fn(), sendStatus: jest.fn() };

        const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: "123" });
        const mockCreateSessionCookie = jest.fn().mockResolvedValue("mockSessionCookie");
    
        (admin.auth as jest.Mock).mockReturnValue({
            verifyIdToken: mockVerifyIdToken,
            createSessionCookie: mockCreateSessionCookie
        });

        // @ts-ignore
        await login(req, res);
        
        expect(res.cookie).toHaveBeenCalledWith(
            "__session",
            "mockSessionCookie",
            expect.objectContaining({
                maxAge: 24 * 60 * 60 * 1000,
                secure: false,
                httpOnly: true,
                sameSite: "strict"
            })
        );
        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
});