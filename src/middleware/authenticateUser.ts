import { NextFunction, Request, Response } from "express";
import { app } from "../firebase";

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { __session } = req.cookies;

    if (!__session) {
        res.sendStatus(401);
        return;
    }

    try {
        const { uid } = await app.auth().verifySessionCookie(__session, true);

        req.userUId = uid;
    } catch (error) {
        res.sendStatus(401);
        return;
    }

    next();
}

export { authenticateUser };