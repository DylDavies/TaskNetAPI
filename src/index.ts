import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import AuthRoute from "./auth/router";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({origin: ['https://tasknet.tech', 'https://tasknet-4bede.firebaseapp.com'], credentials: true}));

if (process.env.PROD === 'true') {
    app.set('trust proxy', 1);
}

app.use('/auth', AuthRoute);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});