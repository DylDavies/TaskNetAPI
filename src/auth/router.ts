import { Request, Response, Router } from "express";
import { app } from "../firebase";
import UserType from "../enums/UserType.enum";
import UserStatus from "../enums/UserStatus.enum";

const router = Router();

const sessionCheck = async (req: Request, res: Response) => {
    let { __session } = req.cookies;

    if (!__session) {
        res.status(200).send({presence: false});
        return;
    }

    try {
        const token = await app.auth().verifySessionCookie(__session, true);

        if (token.uid) {
            const customToken = await app.auth().createCustomToken(token.uid);
            res.status(200).send({presence: true, customToken});
        } else res.status(200).send({presence: false});
    } catch (error) {
        res.status(200).send({presence: false});
        return;
    }
};

const login = async (req: Request, res: Response) => {
    let authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer") || authHeader.split(' ').length !== 2) {
        res.sendStatus(400);
        return;
    }

    const token = authHeader.split(' ')[1];

    let auth = app.auth();
    let uid = "";

    try {
        let decodedToken = await auth.verifyIdToken(token, true);
        uid = decodedToken.uid;
    } catch (error) {
        res.status(401).send(error);
        return;
    }

    const cookie = await auth.createSessionCookie(token, {expiresIn: 24 * 60 * 60 * 1000});

    let db = app.firestore();

    let userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
        db.collection("users").doc(uid).set({
            type: UserType.None,
            status: UserStatus.Pending
        });
    }

    res.cookie('__session', cookie, {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        httpOnly: true,
        sameSite: "strict"
    })

    res.sendStatus(200);
};

router.post('/login', login);
router.post('/session', sessionCheck);

export default router;
export { login, sessionCheck };