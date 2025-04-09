import { Request, Response, Router } from "express";

const router = Router();

const root = (req: Request, res: Response) => {
    res.send("auth root");
};

router.get('/', root);

export default router;
export { root };