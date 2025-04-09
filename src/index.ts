import express from "express";

import AuthRoute from "./auth/router";

const app = express();
const port = process.env.PORT || 3000;

app.use('/auth', AuthRoute);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});