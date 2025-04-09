import express from "express";

import { root } from "./calls";

const app = express();
const port = process.env.PORT || 3000;

app.get('/', root);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

export {}