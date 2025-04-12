import { Request, Response, Router } from "express";

const router = Router();

const root = (req: Request, res: Response) => {
    res.send(req.userUId);
};

router.get('/', root);

export default router;
export { root };