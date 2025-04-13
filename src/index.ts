import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import AuthRoute from "./auth/router";
import AdminRoute from "./admin/router";
import { authenticateUser } from "./middleware/authenticateUser";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({origin: process.env.ORIGIN, credentials: true}));

app.use('/auth', AuthRoute);
app.use('/admin', authenticateUser, AdminRoute);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});