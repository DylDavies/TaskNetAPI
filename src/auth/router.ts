import { Request, Response, Router } from "express";
import { app } from "../firebase";

const router = Router();

const login = async (req: Request, res: Response) => {
    let authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer") || authHeader.split(' ').length !== 2) {
        res.sendStatus(400);
        return;
    }

    const token = authHeader.split(' ')[1];

    let auth = app.auth();

    try {
        await auth.verifyIdToken(token, true);
    } catch (error) {
        res.status(401).send(error);
        return;
    }

    const cookie = await auth.createSessionCookie(token, {expiresIn: 24 * 60 * 60 * 1000});

    res.cookie('__session', cookie, {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        httpOnly: true,
        sameSite: "strict"
    })

    res.sendStatus(200);
};

router.post('/login', login);

export default router;
export { login };