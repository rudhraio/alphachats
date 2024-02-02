import express from "express";

import v1 from "./v1/router.js";

export const app = express();
app.use(express.json());

app.get('/api/ping', (_, res) => {
    return res.status(200).json({
        status: 200,
        message: "ok"
    });
});

app.use("/api/v1", v1);

app.all('*', (_, res) => {
    return res.status(404).json({
        status: 404,
        message: "Invalid URL"
    });
});