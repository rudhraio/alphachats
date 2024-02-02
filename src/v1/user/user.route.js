import express from "express";
import authenticateRouter from "./authenticate.js";

const userRouter = express.Router();

userRouter.use("/authenticate", authenticateRouter);

export default userRouter;
