import { Request, Response } from "express";

const root = (req: Request, res: Response) => {
    res.send("Hello Typescript Express!");
}

export { root };