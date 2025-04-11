import { login, sessionCheck } from "../../src/auth/router";
import admin from "firebase-admin";

jest.mock("firebase-admin", () => {
    const authMock = jest.fn();
    const firestoreMock = jest.fn()

    return {
        auth: authMock,
        firestore: firestoreMock,
    
        credential: {
            cert: jest.fn()
        },
    
        initializeApp: jest.fn(() => ({
            auth: authMock,
            firestore: firestoreMock
        }))
    }
});

describe('Authentication tests', () => {
    describe("Session checker method", () => {
        it("should 200 ok but reject if no __session cookie", () => {
            let req = { cookies: {} };
            let res = { status: jest.fn(), send: jest.fn() };

            res.status.mockReturnValue(res);

            // @ts-ignore
            sessionCheck(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({presence: false});
        });

        it("should 200 ok but reject if error verifying __session", async () => {
            let req = { cookies: { "__session": "mockSessionCode"} };
            let res = { status: jest.fn(), send: jest.fn() };

            const verifySessionCookieMock = jest.fn().mockRejectedValue(new Error("auth/could-not-verify"));

            res.status.mockReturnValue(res);
            (admin.auth as jest.Mock).mockReturnValue({verifySessionCookie: verifySessionCookieMock});

            // @ts-ignore
            await sessionCheck(req, res);

            expect(verifySessionCookieMock).toHaveBeenCalledWith("mockSessionCode", true);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({presence: false});
        });

        it("should 200 ok but reject if no uid is found after verifying __session", async () => {
            let req = { cookies: { "__session": "mockSessionCode"} };
            let res = { status: jest.fn(), send: jest.fn() };

            const verifySessionCookieMock = jest.fn().mockReturnValue({ uid: null });

            res.status.mockReturnValue(res);
            (admin.auth as jest.Mock).mockReturnValue({verifySessionCookie: verifySessionCookieMock});

            // @ts-ignore
            await sessionCheck(req, res);

            expect(verifySessionCookieMock).toHaveBeenCalledWith("mockSessionCode", true);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({presence: false});
        });

        it("should 200 ok and accept on valid session", async () => {
            let req = { cookies: { "__session": "mockSessionCode"} };
            let res = { status: jest.fn(), send: jest.fn() };

            const verifySessionCookieMock = jest.fn().mockReturnValue({ uid: "mockUId" });
            const createCustomTokenMock = jest.fn().mockReturnValue("customToken");

            res.status.mockReturnValue(res);
            (admin.auth as jest.Mock).mockReturnValue({verifySessionCookie: verifySessionCookieMock, createCustomToken: createCustomTokenMock});

            // @ts-ignore
            await sessionCheck(req, res);

            expect(verifySessionCookieMock).toHaveBeenCalledWith("mockSessionCode", true);
            expect(createCustomTokenMock).toHaveBeenCalledWith("mockUId");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({presence: true, customToken: "customToken"});
        });
    });

    describe("Login methods", () => {
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
            const setMock = jest.fn();
        
            (admin.auth as jest.Mock).mockReturnValue({
                verifyIdToken: mockVerifyIdToken,
                createSessionCookie: mockCreateSessionCookie
            });

            (admin.firestore as unknown as jest.Mock).mockReturnValue({
                collection: jest.fn(() => ({
                    doc: jest.fn(() => ({
                        get: jest.fn().mockReturnValue({exists: false}),
                        set: setMock
                    }))
                }))
            });
    
            // @ts-ignore
            await login(req, res);
            
            expect(setMock).toHaveBeenCalled();
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
    })
});